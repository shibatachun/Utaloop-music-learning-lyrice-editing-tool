import { NextResponse } from "next/server";

const submissions = new Map<string, unknown>();

export async function GET() {
  return NextResponse.json({
    submissions: [...submissions.values()]
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = crypto.randomUUID();
  const payload = {
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...body
  };

  submissions.set(id, payload);
  return NextResponse.json(payload, { status: 201 });
}
