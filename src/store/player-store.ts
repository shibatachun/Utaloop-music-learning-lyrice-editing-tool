import { create } from "zustand";

type PlayerStore = {
  activeLineId: string | null;
  currentTime: number;
  duration: number;
  isLoopingLine: boolean;
  isPlaying: boolean;
  playbackRate: number;
  setActiveLineId: (activeLineId: string | null) => void;
  setCurrentTime: (currentTime: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackRate: (playbackRate: number) => void;
  toggleLineLoop: () => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  activeLineId: null,
  currentTime: 0,
  duration: 0,
  isLoopingLine: false,
  isPlaying: false,
  playbackRate: 1,
  setActiveLineId: (activeLineId) => set({ activeLineId }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  toggleLineLoop: () => set((state) => ({ isLoopingLine: !state.isLoopingLine }))
}));
