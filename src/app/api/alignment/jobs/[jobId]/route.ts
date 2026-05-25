import { NextResponse } from "next/server";
import { getAlignmentJob } from "@/lib/alignment-jobs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getAlignmentJob(jobId);

  if (!job) {
    return NextResponse.json({ message: "Alignment job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
