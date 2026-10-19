import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const incoming = await req.formData();
  const audio = incoming.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ detail: "An audio recording is required." }, { status: 400 });
  }
  const outgoing = new FormData();
  outgoing.append("audio", audio, audio.name || "recording.webm");

  const base = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
  try {
    const response = await fetch(`${base}/api/voice/transcribe`, {
      method: "POST",
      body: outgoing,
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Could not reach the voice API:", error);
    return NextResponse.json(
      { detail: "Voice transcription is unavailable. Please try again." },
      { status: 502 }
    );
  }
}
