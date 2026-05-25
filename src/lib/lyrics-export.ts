import type { LyricLine } from "@/types/lyrics";

export type LyricExportFormat = "lrc" | "srt" | "vtt" | "json";

export function exportLyrics(lines: LyricLine[], format: LyricExportFormat) {
  switch (format) {
    case "lrc":
      return lines.map((line) => `[${formatLrcTime(line.startTime)}]${line.text}`).join("\n");
    case "srt":
      return lines
        .map((line, index) => `${index + 1}\n${formatSrtTime(line.startTime)} --> ${formatSrtTime(line.endTime)}\n${line.text}`)
        .join("\n\n");
    case "vtt":
      return `WEBVTT\n\n${lines
        .map((line) => `${formatVttTime(line.startTime)} --> ${formatVttTime(line.endTime)}\n${line.text}`)
        .join("\n\n")}`;
    case "json":
      return JSON.stringify({ lines }, null, 2);
  }
}

export function lyricExportExtension(format: LyricExportFormat) {
  return format === "json" ? "json" : format;
}

function formatLrcTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const hundredths = Math.floor((totalSeconds % 1) * 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function formatSrtTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

function formatVttTime(totalSeconds: number) {
  return formatSrtTime(totalSeconds).replace(",", ".");
}
