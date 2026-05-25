"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LyricLine } from "@/types/lyrics";

type LyricTimelineProps = {
  currentTime: number;
  lines: LyricLine[];
  onInsertLine: (time: number) => void;
  onDeleteLine: (lineId: string) => void;
  onLineDurationChange: (lineId: string, duration: number) => void;
  onLineStartChange: (lineId: string, startTime: number) => void;
  onSeek: (time: number) => void;
  videoDuration: number;
};

type DragState =
  | { type: "move"; lineId: string; originX: number; originStart: number }
  | { type: "resize"; lineId: string; originX: number; originDuration: number };

export function LyricTimeline({
  currentTime,
  lines,
  onDeleteLine,
  onInsertLine,
  onLineDurationChange,
  onLineStartChange,
  onSeek,
  videoDuration
}: LyricTimelineProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [contextTime, setContextTime] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ lineId: string; x: number; y: number } | null>(null);
  const duration = useMemo(() => {
    const lastLineEnd = Math.max(...lines.map((line) => line.endTime), 0);
    return Math.max(30, videoDuration || 0, lastLineEnd + 6, currentTime + 6);
  }, [currentTime, lines, videoDuration]);

  const timeFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) {
      return 0;
    }

    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return ratio * duration;
  };

  const secondsPerPixel = () => {
    const rect = trackRef.current?.getBoundingClientRect();
    return rect ? duration / rect.width : 0;
  };

  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">歌词轨道</h2>
          <p className="text-sm text-muted-foreground">拖动字幕块调整开始时间，拖右侧边缘调整 duration。右键轨道插入歌词。</p>
        </div>
        <Button
          variant="outline"
          onClick={() => onInsertLine(currentTime)}
        >
          <Plus className="h-4 w-4" />
          Insert at playhead
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div
          ref={trackRef}
          className="relative h-32 rounded-md border bg-background"
          style={{ minWidth: `${Math.max(760, duration * 32)}px` }}
          onClick={(event) => {
            setContextTime(null);
            setDeleteTarget(null);
            onSeek(timeFromClientX(event.clientX));
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            setContextTime(timeFromClientX(event.clientX));
          }}
          onPointerMove={(event) => {
            if (!dragState) {
              return;
            }

            const delta = (event.clientX - dragState.originX) * secondsPerPixel();
            if (dragState.type === "move") {
              onLineStartChange(dragState.lineId, Math.max(0, dragState.originStart + delta));
            } else {
              onLineDurationChange(dragState.lineId, Math.max(0.2, dragState.originDuration + delta));
            }
          }}
          onPointerUp={() => setDragState(null)}
          onPointerLeave={() => setDragState(null)}
        >
          <div
            className="absolute bottom-0 top-0 z-20 w-0.5 bg-accent"
            style={{ left: `${Math.min(100, (currentTime / duration) * 100)}%` }}
          />
          <div className="absolute left-0 right-0 top-0 flex h-7 border-b bg-muted/40">
            {Array.from({ length: Math.ceil(duration / 5) + 1 }).map((_, index) => (
              <button
                key={index}
                className="relative h-full border-r px-2 text-left font-mono text-[11px] text-muted-foreground"
                style={{ width: `${(5 / duration) * 100}%` }}
                onClick={() => onSeek(index * 5)}
              >
                {formatTime(index * 5)}
              </button>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 top-7">
            {lines.map((line, index) => {
              const left = (line.startTime / duration) * 100;
              const width = Math.max(1, ((line.endTime - line.startTime) / duration) * 100);
              const isActive = currentTime >= line.startTime && currentTime < line.endTime;

              return (
                <div
                  key={line.id}
                  className={cn(
                    "absolute h-10 cursor-grab select-none rounded-md border px-2 py-1 text-left text-xs shadow-sm transition",
                    isActive ? "border-accent bg-accent text-accent-foreground" : "border-primary/40 bg-primary/15 text-foreground"
                  )}
                  style={{
                    left: `${left}%`,
                    top: `${8 + (index % 2) * 46}px`,
                    width: `${width}%`
                  }}
                  title={`${line.text} ${formatTime(line.startTime)} - ${formatTime(line.endTime)}`}
                  onDoubleClick={() => onSeek(line.startTime)}
                  onClick={(event) => event.stopPropagation()}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setContextTime(null);
                    setDeleteTarget({
                      lineId: line.id,
                      x: event.clientX - (trackRef.current?.getBoundingClientRect().left ?? 0),
                      y: event.clientY - (trackRef.current?.getBoundingClientRect().top ?? 0)
                    });
                  }}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragState({
                      type: "move",
                      lineId: line.id,
                      originX: event.clientX,
                      originStart: line.startTime
                    });
                  }}
                >
                  <span className="block truncate font-medium">{line.text || "New lyric"}</span>
                  <span className="block truncate font-mono opacity-75">
                    {formatTime(line.startTime)} · {(line.endTime - line.startTime).toFixed(2)}s
                  </span>
                  <button
                    className="absolute bottom-0 right-0 top-0 w-3 cursor-ew-resize rounded-r-md bg-foreground/10 hover:bg-foreground/20"
                    title="Resize duration"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setDragState({
                        type: "resize",
                        lineId: line.id,
                        originX: event.clientX,
                        originDuration: line.endTime - line.startTime
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
          {contextTime !== null ? (
            <div
              className="absolute z-30 rounded-md border bg-card p-2 shadow-lg"
              style={{ left: `${Math.min(92, (contextTime / duration) * 100)}%`, top: 36 }}
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                size="sm"
                onClick={() => {
                  onInsertLine(contextTime);
                  setContextTime(null);
                }}
              >
                <Plus className="h-4 w-4" />
                Insert lyric
              </Button>
            </div>
          ) : null}
          {deleteTarget ? (
            <div
              className="absolute z-30 rounded-md border bg-card p-2 shadow-lg"
              style={{ left: deleteTarget.x, top: deleteTarget.y }}
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onDeleteLine(deleteTarget.lineId);
                  setDeleteTarget(null);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete lyric
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
