"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { format } from "@/lib/currency";

export default function Search() {
  const [q, setQ] = useState(""), [res, setRes] = useState<Product[]>([]), [note, setNote] = useState("");
  const [error, setError] = useState("");
  async function byImage(file: File) {
    setNote("Looking closely…");
    setError("");
    try {
      const bmp = await createImageBitmap(file), s = Math.min(1, 768 / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement("canvas"); canvas.width = Math.round(bmp.width * s); canvas.height = Math.round(bmp.height * s);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not process that image.");
      context.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const response = await fetch("/api/visual-search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image: canvas.toDataURL("image/jpeg", 0.8) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Image search failed.");
      setRes(result.items);
      setNote(result.items.length ? `Seen: ${result.keywords.join(", ")}` : "Nothing similar in the collection.");
    } catch (cause) {
      setRes([]);
      setNote("");
      setError(cause instanceof Error ? cause.message : "Image search failed.");
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    if (q.trim().length < 2) { setRes([]); return () => controller.abort(); }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=12`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail ?? "Product search failed.");
        setRes(result.items);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Product search failed.");
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [q]);
  return (
    <main className="page">
      <p className="eyebrow">Search</p>
      <label style={{ display: "inline-block", margin: "12px 0", padding: "10px 20px", border: "1px solid var(--glass-line)", borderRadius: 30, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", cursor: "pointer" }}>Search by image<input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && byImage(e.target.files[0])} /></label>
      {note && <p style={{ color: "var(--mute)", fontSize: 14 }}>{note}</p>}
      {error && <p role="alert" style={{ color: "var(--gold)", fontSize: 14 }}>{error}</p>}
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the collection" placeholder="Search the collection…" style={{ width: "100%", background: "none", border: 0, borderBottom: "1px solid var(--gold)", color: "var(--ivory)", fontFamily: "var(--font-serif)", fontSize: "clamp(36px, 6vw, 72px)", padding: "16px 0", outline: "none" }} />
      <div style={{ marginTop: 40, display: "grid", gap: 8 }}>
        {res.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`} style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 20, alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--glass-line)" }}>
            <Image src={p.image_url} alt="" width={72} height={72} /><span style={{ display: "grid", gap: 4, fontFamily: "var(--font-serif)", fontSize: 26 }}>{p.name}<small style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--dim)" }}>{p.category_group}{p.subcategory ? ` · ${p.subcategory}` : ""}</small></span><span style={{ color: "var(--gold)" }}>{format(p.price, p.currency ?? undefined)}</span>
          </Link>
        ))}
        {q.trim().length >= 2 && !res.length && !error && <p style={{ color: "var(--mute)" }}>Nothing found for “{q}”.</p>}
      </div>
    </main>
  );
}
