import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json() as { session_id?: string; message?: string };
  if (!payload.session_id || !payload.message?.trim()) {
    return NextResponse.json({ detail: "session_id and message are required." }, { status: 400 });
  }

  const base = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
  try {
    const response = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Could not reach the chat API:", error);
    return NextResponse.json(
      { detail: "The concierge is unavailable. Please try again." },
      { status: 502 }
    );
  }
}
