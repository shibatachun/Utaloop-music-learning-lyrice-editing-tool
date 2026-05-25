import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;
  const body = (await request.json()) as { status?: "approved" | "rejected" };

  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json({ message: "status must be approved or rejected" }, { status: 400 });
  }

  return NextResponse.json({
    id: submissionId,
    status: body.status,
    reviewedAt: new Date().toISOString()
  });
}
