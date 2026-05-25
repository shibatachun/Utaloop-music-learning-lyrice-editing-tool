import { parseSubtitleText, tokenizeLyricText } from "@/lib/subtitles";
import type { LyricLine, LyricWord, ParsedLyrics } from "@/types/lyrics";

type AlignmentInput = {
  lyricsText?: string;
  lyrics?: ParsedLyrics;
};

export function autoAlignLyrics(input: AlignmentInput): ParsedLyrics {
  const sourceLyrics = input.lyrics?.lines.length
    ? input.lyrics
    : parseSubtitleText(input.lyricsText ?? "");

  const lines = sourceLyrics.lines.map((line, index) => alignLine(line, index, sourceLyrics.lines));

  return {
    ...sourceLyrics,
    source: "user",
    lines
  };
}

function alignLine(line: LyricLine, index: number, allLines: LyricLine[]): LyricLine {
  const previousEnd = allLines[index - 1]?.endTime ?? 0;
  const nextStart = allLines[index + 1]?.startTime;
  const textWeight = Math.max(1, tokenizeLyricText(line.text).length);
  const estimatedDuration = Math.min(8, Math.max(1.2, textWeight * 0.38));
  const startTime = Math.max(previousEnd, line.startTime);
  const endTime = nextStart
    ? Math.min(nextStart - 0.04, Math.max(startTime + 0.4, line.endTime))
    : Math.max(line.endTime, startTime + estimatedDuration);

  return {
    ...line,
    startTime,
    endTime,
    words: alignWords(line, startTime, endTime)
  };
}

function alignWords(line: LyricLine, startTime: number, endTime: number): LyricWord[] {
  const tokens = tokenizeLyricText(line.text);
  const duration = Math.max(0.2, endTime - startTime);
  const weights = tokens.map(wordWeight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  let cursor = startTime;

  return tokens.map((text, index) => {
    const slice = duration * (weights[index] / totalWeight);
    const wordStart = cursor;
    const wordEnd = index === tokens.length - 1 ? endTime : Math.min(endTime, cursor + slice);
    cursor = wordEnd;

    return {
      id: `${line.id}-word-${index + 1}`,
      text,
      startTime: wordStart,
      endTime: Math.max(wordStart + 0.05, wordEnd)
    };
  });
}

function wordWeight(text: string) {
  if (/^[\u3040-\u30ff\u3400-\u9fff]$/.test(text)) {
    return 1;
  }

  if (/^[,.!?;:，。！？、]$/.test(text)) {
    return 0.25;
  }

  return Math.max(0.8, Math.min(2.4, text.length * 0.32));
}
