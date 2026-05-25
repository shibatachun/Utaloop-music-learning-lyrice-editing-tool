import { NextResponse } from "next/server";
import { resolveVideoInput } from "@/lib/video-platforms";

export async function POST(request: Request) {
  const body = (await request.json()) as { url?: string };
  const video = resolveVideoInput(body.url ?? "");

  if (!video) {
    return NextResponse.json({ message: "Invalid YouTube or Bilibili URL" }, { status: 400 });
  }

  return NextResponse.json({
    id: video.videoId,
    platform: video.platform,
    videoId: video.videoId,
    title: null,
    thumbnailUrl: video.thumbnailUrl ?? null,
    duration: null,
    source: video.platform
  });
}
