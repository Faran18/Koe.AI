import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/api";

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "Visual search needs ANTHROPIC_API_KEY in .env.local." }, { status: 501 });
  const { image } = (await req.json()) as { image: string };
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(image ?? "");
  if (!m) return NextResponse.json({ error: "Unsupported image." }, { status: 400 });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6", max_tokens: 60,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } },
        { type: "text", text: "Name the clothing or accessory item in this photo with 5 single-word, lowercase keywords (item type, colour, material, style). Output only the keywords, comma-separated." },
      ] }],
    }),
  });
  if (!r.ok) return NextResponse.json({ error: "Image analysis failed." }, { status: 502 });
  const text: string = (await r.json()).content?.[0]?.text ?? "";
  const keywords = text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2).slice(0, 8);
  const items = (await getCatalog())
    .map((p) => ({ p, s: keywords.filter((k) => `${p.name} ${p.category_group ?? ""} ${p.subcategory ?? ""} ${p.description ?? ""}`.toLowerCase().includes(k)).length }))
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 12).map((x) => x.p);
  return NextResponse.json({ keywords, items });
}
