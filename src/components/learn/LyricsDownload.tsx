"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportLyrics, lyricExportExtension, type LyricExportFormat } from "@/lib/lyrics-export";
import type { LyricLine } from "@/types/lyrics";

type LyricsDownloadProps = {
  fileName: string;
  labels: {
    download: string;
    format: string;
  };
  lines: LyricLine[];
};

const FORMATS: LyricExportFormat[] = ["lrc", "srt", "vtt", "json"];

export function LyricsDownload({ fileName, labels, lines }: LyricsDownloadProps) {
  const download = (format: LyricExportFormat) => {
    const content = exportLyrics(lines, format);
    const blob = new Blob([content], {
      type: format === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sanitizeFileName(fileName)}.${lyricExportExtension(format)}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{labels.format}</span>
      {FORMATS.map((format) => (
        <Button key={format} variant="outline" size="sm" onClick={() => download(format)} disabled={lines.length === 0}>
          <Download className="h-4 w-4" />
          {format.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}

function sanitizeFileName(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]/g, "-") || "lyrics";
}
