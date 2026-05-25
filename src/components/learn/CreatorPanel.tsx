"use client";

import { useMemo, useState } from "react";
import { Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LyricLine } from "@/types/lyrics";

type CreatorPanelProps = {
  currentTime: number;
  lines: LyricLine[];
  onGlobalNudge: (delta: number) => void;
  onImport: () => void;
  onSave: () => void;
  onSeek: (time: number) => void;
  onWordDurationNudge: (lineId: string, wordId: string, delta: number) => void;
  onWordStartNudge: (lineId: string, wordId: string, delta: number) => void;
  subtitleText: string;
  onSubtitleTextChange: (value: string) => void;
};

export function CreatorPanel({
  currentTime,
  lines,
  onGlobalNudge,
  onImport,
  onSave,
  onSeek,
  onWordDurationNudge,
  onWordStartNudge,
  subtitleText,
  onSubtitleTextChange
}: CreatorPanelProps) {
  const [selectedWordKey, setSelectedWordKey] = useState<string | null>(null);
  const activeLine = useMemo(
    () => lines.find((line) => currentTime >= line.startTime && currentTime < line.endTime) ?? null,
    [currentTime, lines]
  );
  const selectedWord = useMemo(() => {
    for (const line of lines) {
      const word = line.words.find((item) => `${line.id}:${item.id}` === selectedWordKey);
      if (word) {
        return { line, word };
      }
    }

    return null;
  }, [lines, selectedWordKey]);

  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">制作歌词</h2>
          <p className="text-sm text-muted-foreground">先编辑并保存到预览，确认后再提交审核。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onImport}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/60 px-3 py-2">
        <div>
          <p className="text-sm font-medium">整体 offset</p>
          <p className="text-xs text-muted-foreground">整首歌词都早/晚时，用这里先粗调。</p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => onGlobalNudge(-0.5)}>-0.5s</Button>
          <Button size="sm" variant="outline" onClick={() => onGlobalNudge(-0.1)}>-0.1s</Button>
          <Button size="sm" variant="outline" onClick={() => onGlobalNudge(0.1)}>+0.1s</Button>
          <Button size="sm" variant="outline" onClick={() => onGlobalNudge(0.5)}>+0.5s</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <textarea
            className="min-h-[220px] w-full resize-y rounded-md border bg-background p-3 font-mono text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
            value={subtitleText}
            onChange={(event) => onSubtitleTextChange(event.target.value)}
            placeholder="[00:12.40]君の知らない物語"
          />
          <div className="lyrics-scrollbar max-h-[260px] overflow-y-auto rounded-md border bg-background p-3">
            {lines.map((line) => {
              const isLineActive = line.id === activeLine?.id;
              return (
                <div key={line.id} className={cn("mb-3 rounded-md p-2 last:mb-0", isLineActive && "bg-primary/10")}>
                  <div className="mb-1 font-mono text-xs text-muted-foreground">
                    [{line.startTime.toFixed(2)}]
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {line.words.map((word) => {
                      const wordKey = `${line.id}:${word.id}`;
                      const isSelected = selectedWordKey === wordKey;
                      const isCurrentWord = currentTime >= word.startTime && currentTime < word.endTime;

                      return (
                        <button
                          key={word.id}
                          className={cn(
                            "rounded px-1.5 py-1 text-sm transition",
                            isSelected && "bg-accent text-accent-foreground ring-2 ring-accent/50",
                            !isSelected && isCurrentWord && "bg-accent/15 text-accent ring-1 ring-accent/50",
                            !isSelected && !isCurrentWord && "hover:bg-muted"
                          )}
                          onClick={() => {
                            setSelectedWordKey(wordKey);
                            onSeek(word.startTime);
                          }}
                        >
                          {word.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lyrics-scrollbar max-h-[520px] overflow-y-auto rounded-md border">
          <SelectedWordEditor
            selectedWord={selectedWord}
            onSeek={onSeek}
            onWordDurationNudge={onWordDurationNudge}
            onWordStartNudge={onWordStartNudge}
          />
        </div>
      </div>
    </section>
  );
}

function SelectedWordEditor({
  onSeek,
  onWordDurationNudge,
  onWordStartNudge,
  selectedWord
}: {
  selectedWord: { line: LyricLine; word: LyricLine["words"][number] } | null;
  onSeek: (time: number) => void;
  onWordDurationNudge: (lineId: string, wordId: string, delta: number) => void;
  onWordStartNudge: (lineId: string, wordId: string, delta: number) => void;
}) {
  if (!selectedWord) {
    return (
      <div className="border-b bg-muted/50 p-3 text-sm text-muted-foreground">
        选中左侧歌词里的某个词后，在这里调 start 和 duration。
      </div>
    );
  }

  const { line, word } = selectedWord;
  const wordDuration = Math.max(0.05, word.endTime - word.startTime);

  return (
    <div className="border-b bg-accent/10 p-3">
      <div className="mb-3">
        <p className="text-xs font-medium text-muted-foreground">selected word</p>
        <button className="mt-1 rounded bg-accent px-2 py-1 text-sm font-semibold text-accent-foreground" onClick={() => onSeek(word.startTime)}>
          {word.text}
        </button>
      </div>
      <div className="grid grid-cols-[82px_minmax(0,1fr)] items-center gap-2">
        <span className="text-xs text-muted-foreground">word start</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => onWordStartNudge(line.id, word.id, -0.05)}>-0.05s</Button>
          <span className="grid h-9 min-w-16 place-items-center rounded-md border bg-background px-2 font-mono text-xs">
            {word.startTime.toFixed(2)}s
          </span>
          <Button size="sm" variant="outline" onClick={() => onWordStartNudge(line.id, word.id, 0.05)}>+0.05s</Button>
        </div>
        <span className="text-xs text-muted-foreground">word duration</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => onWordDurationNudge(line.id, word.id, -0.05)}>-0.05s</Button>
          <span className="grid h-9 min-w-16 place-items-center rounded-md border bg-background px-2 font-mono text-xs">
            {wordDuration.toFixed(2)}s
          </span>
          <Button size="sm" variant="outline" onClick={() => onWordDurationNudge(line.id, word.id, 0.05)}>+0.05s</Button>
        </div>
      </div>
    </div>
  );
}
