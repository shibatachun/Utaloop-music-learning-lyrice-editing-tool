import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    displayName?: string;
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ message: "email and password are required" }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: crypto.randomUUID(),
      displayName: body.displayName || body.email.split("@")[0],
      email: body.email,
      role: "user",
      avatarUrl: null
    }
  }, { status: 201 });
}
