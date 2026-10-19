"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { format } from "@/lib/currency";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/lib/hooks";

export default function Wishlist() {
  const ids = useWishlist((s) => s.ids), toggle = useWishlist((s) => s.toggle), ready = useHydrated();
  const [all, setAll] = useState<Product[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/products?limit=1000")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail ?? "Could not load the catalog.");
        if (active) setAll(result.items);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load the catalog.");
      });
    return () => { active = false; };
  }, []);
  const saved = all.filter((p) => ids.includes(p.id));
  return (
    <main className="page">
      <p className="eyebrow">Wishlist</p><h1 style={{ fontSize: "clamp(48px, 7vw, 96px)", margin: "16px 0 40px" }}>Kept <em style={{ color: "var(--gold)" }}>for later</em></h1>
      {error && <p role="alert" style={{ color: "var(--gold)" }}>{error}</p>}
      {ready && !ids.length && <p style={{ color: "var(--mute)" }}>Nothing saved yet. Tap ♡ on any piece.</p>}
      <div style={{ display: "grid", gap: 8 }}>
        {saved.map((p) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "72px 1fr auto auto", gap: 20, alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--glass-line)" }}>
            <Image src={p.image_url} alt="" width={72} height={72} /><Link href={`/product/${p.id}`} style={{ display: "grid", gap: 4, fontFamily: "var(--font-serif)", fontSize: 26 }}>{p.name}<small style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--dim)" }}>{p.category_group}{p.subcategory ? ` · ${p.subcategory}` : ""}</small></Link>
            <span style={{ color: "var(--gold)" }}>{format(p.price, p.currency ?? undefined)}</span><button onClick={() => toggle(p.id)} style={{ background: "none", border: 0, color: "var(--mute)", cursor: "pointer" }}>remove</button>
          </div>
        ))}
      </div>
    </main>
  );
}
