import { parseSubtitleText } from "@/lib/subtitles";
import { resolveVideoInput, type ResolvedVideo } from "@/lib/video-platforms";
import type { ParsedLyrics } from "@/types/lyrics";

export type SongVideo = {
  id: string;
  title: string;
  artist: string;
  language: string;
  sourceUrl: string;
  sourceLabel: string;
  creator: string;
  views: string;
  video: ResolvedVideo;
  lyrics: ParsedLyrics;
};

const SONGS: Array<Omit<SongVideo, "video" | "lyrics"> & { lrc: string }> = [
  {
    id: "never-gonna-give-you-up",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    language: "English",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sourceLabel: "YouTube",
    creator: "UtaLoop Studio",
    views: "12K",
    lrc: `[00:01.36]We're no strangers to love
[00:04.80]You know the rules and so do I
[00:08.30]A full commitment's what I'm thinking of
[00:12.50]You wouldn't get this from any other guy
[00:18.64]I just wanna tell you how I'm feeling`
  },
  {
    id: "japanese-practice-demo",
    title: "Japanese Chorus Practice",
    artist: "Practice Track",
    language: "日本語",
    sourceUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    sourceLabel: "YouTube",
    creator: "Karaoke Lab",
    views: "8.5K",
    lrc: `[00:00.00]君の声を聞かせて
[00:04.20]遠い空へ響かせて
[00:08.40]もう一度だけ歌うよ
[00:12.60]心を重ねながら`
  },
  {
    id: "bilibili-cover-template",
    title: "Bilibili Cover Template",
    artist: "Creator Tools",
    language: "中文",
    sourceUrl: "https://www.bilibili.com/video/BV1xx411c7mD",
    sourceLabel: "Bilibili",
    creator: "Creator Tools",
    views: "New",
    lrc: `[00:00.00]这里是 Bilibili 翻唱练习模板
[00:04.00]上传歌词后可以校准每一句时间
[00:08.00]提交审核后进入公共学歌库`
  }
];

export const completedSongVideos: SongVideo[] = SONGS.map((song) => {
  const video = resolveVideoInput(song.sourceUrl);
  if (!video) {
    throw new Error(`Invalid catalog video URL: ${song.sourceUrl}`);
  }

  return {
    ...song,
    video,
    lyrics: parseSubtitleText(song.lrc, "user")
  };
});

export function searchCompletedSongVideos(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return completedSongVideos;
  }

  return completedSongVideos.filter((song) =>
    [song.title, song.artist, song.language, song.creator]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}
