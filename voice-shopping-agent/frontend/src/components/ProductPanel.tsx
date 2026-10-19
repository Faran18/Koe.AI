"use client";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { productSizes } from "@/lib/api";
import { format } from "@/lib/currency";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import Magnetic from "./Magnetic";

function productFacts(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string" || typeof item === "number") return String(item);
      if (item && typeof item === "object") {
        return Object.entries(item).map(([key, detail]) => `${key}: ${String(detail)}`).join(" · ");
      }
      return "";
    }).filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, detail]) => `${key}: ${String(detail)}`);
  }
  return [];
}

export default function ProductPanel({ product: p }: { product: Product }) {
  const add = useCart((s) => s.add);
  const wish = useWishlist();
  const sizes = productSizes(p);
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const facts = [...productFacts(p.product_details), ...productFacts(p.product_specifications)];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <p className="eyebrow">{p.category_group ?? "Collection"}{p.subcategory ? ` · ${p.subcategory}` : ""}</p>
      <h1 style={{ fontSize: "clamp(44px, 5vw, 72px)", lineHeight: 1 }}>{p.name}</h1>
      <div style={{ display: "flex", gap: 14, alignItems: "baseline", color: "var(--gold)", fontSize: 22 }}>
        <span>{format(p.price, p.currency ?? undefined)}</span>
        {p.initial_price !== null && p.initial_price !== undefined && p.initial_price > p.price &&
          <del style={{ color: "var(--dim)", fontSize: 15 }}>{format(p.initial_price, p.currency ?? undefined)}</del>}
      </div>
      {p.rating !== null && p.rating !== undefined &&
        <p style={{ color: "var(--mute)" }}>★ {p.rating.toFixed(1)}{p.ratings_count ? ` · ${p.ratings_count.toLocaleString()} ratings` : ""}</p>}
      {p.discount !== null && p.discount !== undefined && p.discount > 0 &&
        <p style={{ color: "var(--gold)", fontSize: 12 }}>{p.discount}% off</p>}
      <p style={{ color: "var(--mute)", lineHeight: 1.8, maxWidth: 460 }}>{p.description || "Product details are not available."}</p>
      {sizes.length > 0 && (
        <label style={{ display: "grid", gap: 8, maxWidth: 220, color: "var(--mute)", fontSize: 12, letterSpacing: ".16em" }}>
          SIZE
          <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} style={{ padding: 12, background: "var(--glass)", color: "var(--ivory)", border: "1px solid var(--glass-line)", borderRadius: 12 }}>
            {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <Magnetic><button onClick={() => add(p, selectedSize || undefined)} style={{ padding: "18px 44px", background: "var(--gold)", color: "#0b0a09", border: 0, borderRadius: 40, fontSize: 12, letterSpacing: ".3em", textTransform: "uppercase", cursor: "pointer" }}>Add to bag</button></Magnetic>
        <button onClick={() => wish.toggle(p.id)} aria-label="Wishlist" style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid var(--glass-line)", background: "var(--glass)", color: wish.ids.includes(p.id) ? "var(--gold)" : "var(--mute)", cursor: "pointer", fontSize: 18 }}>{wish.ids.includes(p.id) ? "♥" : "♡"}</button>
      </div>
      {facts.length > 0 && (
        <dl style={{ display: "grid", gap: 8, color: "var(--dim)", fontSize: 13, lineHeight: 1.6 }}>
          {facts.map((fact, index) => <div key={`${index}-${fact}`}>{fact}</div>)}
        </dl>
      )}
    </div>
  );
}
