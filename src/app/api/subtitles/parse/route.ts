import { NextResponse } from "next/server";
import { parseSubtitleText } from "@/lib/subtitles";

export async function POST(request: Request) {
  const body = (await request.json()) as { content?: string };
  const parsed = parseSubtitleText(body.content ?? "");

  if (parsed.lines.length === 0) {
    return NextResponse.json({ message: "No timed lyrics found" }, { status: 400 });
  }

  return NextResponse.json(parsed);
}
