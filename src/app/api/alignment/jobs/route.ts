import { NextResponse } from "next/server";
import { autoAlignLyrics } from "@/lib/alignment";
import { saveAlignmentJob, type AlignmentJob } from "@/lib/alignment-jobs";

export async function POST(request: Request) {
  const body = await request.json();
  const id = crypto.randomUUID();

  try {
    const result = autoAlignLyrics({
      lyrics: body.lyrics,
      lyricsText: body.lyricsText
    });

    const job: AlignmentJob = {
      id,
      status: "completed",
      createdAt: new Date().toISOString(),
      result
    };

    saveAlignmentJob(job);
    return NextResponse.json(job, { status: 201 });
  } catch {
    const job: AlignmentJob = {
      id,
      status: "failed",
      createdAt: new Date().toISOString()
    };

    saveAlignmentJob(job);
    return NextResponse.json(job, { status: 400 });
  }
}
