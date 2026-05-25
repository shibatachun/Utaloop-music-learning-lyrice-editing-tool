export type VideoPlatform = "youtube" | "bilibili";

export type ResolvedVideo = {
  platform: VideoPlatform;
  videoId: string;
  embedUrl: string;
  thumbnailUrl?: string;
};

export function resolveVideoInput(input: string): ResolvedVideo | null {
  const youtubeVideoId = extractYouTubeVideoId(input);
  if (youtubeVideoId) {
    return {
      platform: "youtube",
      videoId: youtubeVideoId,
      embedUrl: `https://www.youtube.com/embed/${youtubeVideoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
    };
  }

  const bilibiliVideoId = extractBilibiliVideoId(input);
  if (bilibiliVideoId) {
    return {
      platform: "bilibili",
      videoId: bilibiliVideoId,
      embedUrl: `https://player.bilibili.com/player.html?bvid=${bilibiliVideoId}&high_quality=1`
    };
  }

  return null;
}

export function extractYouTubeVideoId(input: string) {
  const value = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "").slice(0, 11);
    }

    if (url.hostname.includes("youtube.com")) {
      const fromSearch = url.searchParams.get("v");
      if (fromSearch) {
        return fromSearch.slice(0, 11);
      }

      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) {
        return shortsMatch[1];
      }

      const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) {
        return embedMatch[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function extractBilibiliVideoId(input: string) {
  const value = input.trim();
  const directMatch = value.match(/^(BV[a-zA-Z0-9]{10})$/);
  if (directMatch) {
    return directMatch[1];
  }

  try {
    const url = new URL(value);
    if (!url.hostname.includes("bilibili.com")) {
      return null;
    }

    const match = url.pathname.match(/\/video\/(BV[a-zA-Z0-9]{10})/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
