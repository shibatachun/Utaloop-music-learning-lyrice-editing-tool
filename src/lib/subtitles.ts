import type { LyricLine, LyricWord, ParsedLyrics } from "@/types/lyrics";

type TranscriptItem = {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
};

const SAMPLE_LYRICS = `[00:00.00]Paste LRC, SRT, or WebVTT lyrics on the left
[00:04.00]Load a YouTube video and practice one line at a time
[00:08.30]Click any lyric line to jump to that moment
[00:12.50]Turn on loop mode to repeat the current phrase
[00:17.00]Words highlight as the player moves through the line`;

export function getSampleLyrics(): ParsedLyrics {
  return parseSubtitleText(SAMPLE_LYRICS, "sample");
}

export function parseSubtitleText(text: string, source: "sample" | "user" = "user"): ParsedLyrics {
  const normalized = text.replace(/\r/g, "").trim();
  if (!normalized) {
    return { source, lines: [] };
  }

  const lines = normalized.includes("-->") ? parseTimedBlocks(normalized) : parseLrc(normalized);
  return {
    source,
    lines: withWordTimings(lines)
  };
}

export function parseEditableLrcText(text: string, existingLines: LyricLine[]): ParsedLyrics {
  const parsed = parseSubtitleText(text);
  if (parsed.lines.length === 0) {
    return { source: "user", lines: existingLines };
  }

  return {
    source: "user",
    lines: parsed.lines.map((line, index) => mergeParsedLine(line, existingLines[index]))
  };
}

export function transcriptToLyrics(transcript: TranscriptItem[]): ParsedLyrics {
  const lines: LyricLine[] = transcript
    .map((item, index) => {
      const startTime = normalizeTranscriptTime(item.offset);
      const duration = normalizeTranscriptTime(item.duration);

      return {
        id: `line-${index + 1}`,
        startTime,
        endTime: startTime + Math.max(duration, estimateDuration(item.text)),
        text: item.text.trim(),
        words: []
      };
    })
    .filter((line) => line.text.length > 0)
    .sort((a, b) => a.startTime - b.startTime)
    .map((line, index, allLines) => ({
      ...line,
      id: `line-${index + 1}`,
      endTime: Math.min(line.endTime, allLines[index + 1]?.startTime ?? line.endTime)
    }));

  return {
    language: transcript.find((item) => item.lang)?.lang,
    source: "user",
    lines: withWordTimings(lines)
  };
}

function parseLrc(text: string): LyricLine[] {
  const parsed = text
    .split("\n")
    .flatMap((line) => {
      const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
      const lyricText = line.replace(/\[[^\]]+\]/g, "").trim();

      return matches.map((match) => ({
        startTime: toSeconds(match[1], match[2], match[3]),
        text: lyricText
      }));
    })
    .filter((line) => line.text.length > 0)
    .sort((a, b) => a.startTime - b.startTime);

  return parsed.map((line, index) => ({
    id: `line-${index + 1}`,
    startTime: line.startTime,
    endTime: parsed[index + 1]?.startTime ?? line.startTime + estimateDuration(line.text),
    text: line.text,
    words: []
  }));
}

function parseTimedBlocks(text: string): LyricLine[] {
  return text
    .split(/\n\s*\n/)
    .map((block, index): LyricLine | null => {
      const rows = block.split("\n").map((row) => row.trim()).filter(Boolean);
      const timingRowIndex = rows.findIndex((row) => row.includes("-->"));
      if (timingRowIndex === -1) {
        return null;
      }

      const [start, end] = rows[timingRowIndex].split("-->").map((value) => value.trim());
      const lyricText = rows.slice(timingRowIndex + 1).join(" ").trim();
      if (!lyricText) {
        return null;
      }

      return {
        id: `line-${index + 1}`,
        startTime: parseTimestamp(start),
        endTime: parseTimestamp(end),
        text: lyricText,
        words: []
      };
    })
    .filter((line): line is LyricLine => Boolean(line));
}

function withWordTimings(lines: LyricLine[]): LyricLine[] {
  return lines.map((line) => {
    const tokens = tokenize(line.text);
    const duration = Math.max(0.5, line.endTime - line.startTime);
    const slice = duration / Math.max(tokens.length, 1);
    const words: LyricWord[] = tokens.map((text, index) => ({
      id: `${line.id}-word-${index + 1}`,
      text,
      startTime: line.startTime + slice * index,
      endTime: line.startTime + slice * (index + 1)
    }));

    return { ...line, words };
  });
}

function mergeParsedLine(parsedLine: LyricLine, existingLine?: LyricLine): LyricLine {
  if (!existingLine) {
    return parsedLine;
  }

  const duration = Math.max(0.2, existingLine.endTime - existingLine.startTime);
  return {
    ...parsedLine,
    id: existingLine.id,
    endTime: parsedLine.startTime + duration,
    words: withWordTimings([
      {
        ...parsedLine,
        id: existingLine.id,
        endTime: parsedLine.startTime + duration,
        words: []
      }
    ])[0].words
  };
}

export function tokenizeLyricText(text: string) {
  return tokenize(text);
}

function tokenize(text: string) {
  const spaced = text.match(/[A-Za-z0-9']+|[\u3040-\u30ff\u3400-\u9fff]|\S/g);
  return spaced ?? [text];
}

function toSeconds(minutes: string, seconds: string, fraction = "0") {
  const padded = fraction.padEnd(3, "0").slice(0, 3);
  return Number(minutes) * 60 + Number(seconds) + Number(padded) / 1000;
}

function parseTimestamp(timestamp: string) {
  const clean = timestamp.replace(",", ".");
  const parts = clean.split(":");
  const seconds = Number(parts.pop() ?? 0);
  const minutes = Number(parts.pop() ?? 0);
  const hours = Number(parts.pop() ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function estimateDuration(text: string) {
  return Math.min(8, Math.max(2.6, tokenize(text).length * 0.42));
}

function normalizeTranscriptTime(value: number) {
  return value > 1000 ? value / 1000 : value;
}
