import { NextResponse } from "next/server";
import { searchCompletedSongVideos } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  return NextResponse.json({
    songs: searchCompletedSongVideos(query)
  });
}
