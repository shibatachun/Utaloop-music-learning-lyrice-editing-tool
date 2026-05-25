"use client";

import { Pause, Play, Repeat, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/player-store";

type PlaybackControlsProps = {
  activeLineStart?: number;
  onPause: () => void;
  onPlay: () => void;
  onReplayLine: () => void;
  onRateChange: (rate: number) => void;
};

const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5];

export function PlaybackControls({
  activeLineStart,
  onPause,
  onPlay,
  onReplayLine,
  onRateChange
}: PlaybackControlsProps) {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isLoopingLine = usePlayerStore((state) => state.isLoopingLine);
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  const toggleLineLoop = usePlayerStore((state) => state.toggleLineLoop);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card/95 p-3 shadow-sm">
      <Button size="icon" onClick={isPlaying ? onPause : onPlay} title={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onReplayLine}
        disabled={activeLineStart === undefined}
        title="Replay current line"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant={isLoopingLine ? "default" : "outline"}
        size="icon"
        onClick={toggleLineLoop}
        title="Loop current line"
      >
        <Repeat className="h-4 w-4" />
      </Button>
      <div className="ml-auto flex flex-wrap items-center gap-1 rounded-md bg-muted p-1">
        {RATES.map((rate) => (
          <button
            key={rate}
            className={cn(
              "h-8 rounded px-2.5 text-sm font-medium transition-colors",
              playbackRate === rate ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onRateChange(rate)}
          >
            {rate}x
          </button>
        ))}
      </div>
    </div>
  );
}
