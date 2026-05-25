export {};

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    type PlayerState = -1 | 0 | 1 | 2 | 3 | 5;

    type PlayerEvent = {
      target: Player;
      data: PlayerState;
    };

    class Player {
      constructor(elementId: string, options: PlayerOptions);
      destroy(): void;
      getCurrentTime(): number;
      getDuration(): number;
      pauseVideo(): void;
      playVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      setPlaybackRate(suggestedRate: number): void;
    }

    type PlayerOptions = {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: PlayerEvent) => void;
      };
    };
  }
}
