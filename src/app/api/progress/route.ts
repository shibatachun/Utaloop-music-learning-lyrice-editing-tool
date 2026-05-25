import { NextResponse } from "next/server";

const progressStore = new Map<string, unknown>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ message: "videoId is required" }, { status: 400 });
  }

  return NextResponse.json(progressStore.get(videoId) ?? null);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    videoId?: string;
    currentTime?: number;
    activeLineId?: string | null;
  };

  if (!body.videoId) {
    return NextResponse.json({ message: "videoId is required" }, { status: 400 });
  }

  const payload = {
    videoId: body.videoId,
    currentTime: body.currentTime ?? 0,
    activeLineId: body.activeLineId ?? null,
    updatedAt: new Date().toISOString()
  };

  progressStore.set(body.videoId, payload);
  return NextResponse.json(payload);
}
