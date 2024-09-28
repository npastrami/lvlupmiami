// app/api/login/route.ts
import { NextResponse } from "next/server";

// Handle GET requests to /api/login
export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}
