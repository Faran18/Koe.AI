"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { format } from "@/lib/currency";

export default function CartDrawer() {
  const { lines, open, toggle, remove, setQty, subtotal, refresh, error, loading } = useCart();
  useEffect(() => { void refresh(); }, [refresh]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div onClick={() => toggle(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 80 }} />
          <motion.aside role="dialog" aria-label="Bag" className="glass" initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", top: 20, right: 20, bottom: 20, width: 420, maxWidth: "calc(100vw - 40px)", zIndex: 90, padding: 28, display: "flex", flexDirection: "column", background: "var(--ink-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><h2 style={{ fontSize: 34 }}>Your <em>bag</em></h2><button onClick={() => toggle(false)} aria-label="Close" style={{ background: "none", border: 0, color: "var(--mute)", cursor: "pointer", fontSize: 18 }}>✕</button></div>
            <div style={{ flex: 1, overflowY: "auto", margin: "20px 0", display: "grid", gap: 18, alignContent: "start" }}>
              {error && <p role="alert" style={{ color: "var(--gold)" }}>{error}</p>}
              {loading && !lines.length && <p style={{ color: "var(--mute)" }}>Loading your bag…</p>}
              {!loading && !error && lines.length === 0 && <p style={{ color: "var(--mute)" }}>Nothing here yet. The collection is waiting.</p>}
              {lines.map((l) => (
                <div key={l.itemId} style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 14, alignItems: "center" }}>
                  <Image src={l.image} alt={l.title} width={72} height={72} style={{ borderRadius: 12, background: "var(--glass)" }} />
                  <div><div style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: "var(--dim)" }}>{l.size ? `Size ${l.size} · ` : ""}<button onClick={() => setQty(l.itemId, l.qty - 1)} aria-label="Less" style={q}>−</button> {l.qty} <button disabled={l.qty >= 20} onClick={() => setQty(l.itemId, l.qty + 1)} aria-label="More" style={q}>+</button> · <button onClick={() => remove(l.itemId)} style={{ ...q, textDecoration: "underline" }}>remove</button></div></div>
                  <div style={{ color: "var(--gold)" }}>{format(l.price * l.qty, l.currency)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 15 }}><span>Subtotal</span><span style={{ color: "var(--gold)" }}>{format(subtotal(), lines[0]?.currency)}</span></div>
            <Link href="/checkout" onClick={() => toggle(false)} aria-disabled={!lines.length} style={{ textAlign: "center", padding: 18, borderRadius: 40, background: "var(--gold)", color: "#0b0a09", fontSize: 12, letterSpacing: ".3em", textTransform: "uppercase", opacity: lines.length ? 1 : 0.4, pointerEvents: lines.length ? "auto" : "none" }}>Checkout</Link>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
const q = { background: "none", border: 0, color: "var(--ivory)", cursor: "pointer", padding: "0 4px", fontFamily: "inherit" } as const;
