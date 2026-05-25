"use client";

import { useEffect, useMemo, useRef } from "react";
import type { LyricLine } from "@/types/lyrics";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/player-store";

type LyricsScrollerProps = {
  compact?: boolean;
  lines: LyricLine[];
  onSeek: (time: number) => void;
};

export function LyricsScroller({ compact = false, lines, onSeek }: LyricsScrollerProps) {
  const activeLineId = usePlayerStore((state) => state.activeLineId);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeLine = useMemo(
    () => lines.find((line) => line.id === activeLineId) ?? null,
    [activeLineId, lines]
  );

  useEffect(() => {
    if (!activeLineId) {
      return;
    }

    itemRefs.current[activeLineId]?.scrollIntoView({
      block: "center",
      behavior: "smooth"
    });
  }, [activeLineId]);

  if (lines.length === 0) {
    return (
      <div className="grid h-full min-h-[260px] place-items-center rounded-lg border bg-card px-6 text-center text-sm text-muted-foreground">
        Paste timed lyrics to see the karaoke view.
      </div>
    );
  }

  return (
    <div className="lyrics-scrollbar h-full min-h-[260px] overflow-y-auto rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex min-h-full flex-col justify-center gap-1 py-16">
        {lines.map((line) => {
          const isActive = line.id === activeLine?.id;
          return (
            <button
              key={line.id}
              ref={(node) => {
                itemRefs.current[line.id] = node;
              }}
              className={cn(
                "w-full rounded-md px-4 text-left leading-7 transition",
                compact ? "py-2 text-sm" : "py-3 text-base",
                isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => onSeek(line.startTime)}
            >
              {line.words.length > 0 ? (
                <span aria-label={line.text}>
                  {line.words.map((word) => {
                    const isCurrentWord = currentTime >= word.startTime && currentTime < word.endTime;
                    return (
                      <span
                        key={word.id}
                        className={cn(
                          "mr-1 rounded-sm px-0.5 transition-colors",
                          isActive && isCurrentWord && "bg-accent text-accent-foreground"
                        )}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </span>
              ) : (
                line.text
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
