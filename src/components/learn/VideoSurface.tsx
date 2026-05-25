"use client";

import { YouTubePlayer } from "@/components/learn/YouTubePlayer";
import type { ResolvedVideo } from "@/lib/video-platforms";

type VideoSurfaceProps = {
  video: ResolvedVideo | null;
  onReady: (player: YT.Player | null) => void;
};

export function VideoSurface({ video, onReady }: VideoSurfaceProps) {
  if (!video) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-xl bg-black text-sm text-white/70">
        Load a YouTube or Bilibili video to begin
      </div>
    );
  }

  if (video.platform === "youtube") {
    return <YouTubePlayer videoId={video.videoId} onReady={onReady} />;
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border bg-black shadow-sm">
      <iframe
        className="h-full w-full"
        src={video.embedUrl}
        title="Bilibili player"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
