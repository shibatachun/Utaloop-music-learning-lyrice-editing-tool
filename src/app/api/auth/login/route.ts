import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ message: "email and password are required" }, { status: 400 });
  }

  if (body.email === "admin123" && body.password === "123") {
    return NextResponse.json({
      user: {
        id: "admin123",
        displayName: "admin123",
        email: "admin123",
        role: "admin",
        avatarUrl: null
      }
    });
  }

  return NextResponse.json({
    user: {
      id: "demo-user",
      displayName: body.email.split("@")[0],
      email: body.email,
      role: body.email.includes("admin") ? "admin" : "user",
      avatarUrl: null
    }
  });
}
