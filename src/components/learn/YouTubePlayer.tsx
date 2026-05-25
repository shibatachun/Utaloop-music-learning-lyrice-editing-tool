"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/player-store";

type YouTubePlayerProps = {
  videoId: string | null;
  onReady: (player: YT.Player) => void;
};

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve();
      };

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }

  return apiPromise;
}

export function YouTubePlayer({ videoId, onReady }: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const onReadyRef = useRef(onReady);
  const elementId = "youtube-player";
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    let isMounted = true;

    async function initPlayer() {
      if (!videoId) {
        return;
      }

      await loadYouTubeApi();
      if (!isMounted || !window.YT?.Player) {
        return;
      }

      playerRef.current?.destroy();
      playerRef.current = new window.YT.Player(elementId, {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            setDuration(event.target.getDuration());
            onReadyRef.current(event.target);
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === 1);
          }
        }
      });
    }

    initPlayer();

    return () => {
      isMounted = false;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId, setDuration, setIsPlaying]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border bg-black shadow-sm">
      {videoId ? <div id={elementId} className="h-full w-full" /> : <div className="grid h-full place-items-center text-sm text-white/70">Load a YouTube video to begin</div>}
    </div>
  );
}
