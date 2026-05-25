export type LyricWord = {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
};

export type LyricLine = {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words: LyricWord[];
};

export type ParsedLyrics = {
  language?: string;
  source: "sample" | "user" | "youtube";
  lines: LyricLine[];
};
