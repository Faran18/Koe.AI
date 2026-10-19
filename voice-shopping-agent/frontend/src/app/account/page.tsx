"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@/store/profile";
import { useOrders } from "@/store/orders";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/lib/hooks";
import { useUser } from "@/lib/supabase/useUser";
import { createClient } from "@/lib/supabase/client";
const f = { height: 52, borderRadius: 14, border: "1px solid var(--glass-line)", background: "var(--glass)", color: "var(--ivory)", padding: "0 18px", fontFamily: "inherit", fontSize: 15, width: "100%" } as const;

export default function Account() {
  const p = useProfile(), ready = useHydrated(), user = useUser(), [msg, setMsg] = useState("");
  const orders = useOrders((s) => s.orders.length), loadOrders = useOrders((s) => s.load), saved = useWishlist((s) => s.ids.length);
  useEffect(() => { void loadOrders(); }, [loadOrders]);
  if (!ready || user === undefined) return <main className="page" />;

  async function save() {
    if (!user) return;
    const { error } = await createClient().from("profiles").upsert({ id: user.id, name: p.name, size: p.size, email: user.email });
    setMsg(error ? error.message : "Saved.");
  }

  return (
    <main className="page">
      <p className="eyebrow">Account</p><h1 style={{ fontSize: "clamp(48px, 7vw, 96px)", margin: "16px 0 40px" }}>{p.name ? <>Welcome, <em style={{ color: "var(--gold)" }}>{p.name}</em></> : "Your account"}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
        <Link href="/orders" className="glass" style={{ padding: 28 }}><div className="eyebrow">Orders</div><div style={{ fontFamily: "var(--font-serif)", fontSize: 48 }}>{orders}</div></Link>
        <Link href="/wishlist" className="glass" style={{ padding: 28 }}><div className="eyebrow">Wishlist</div><div style={{ fontFamily: "var(--font-serif)", fontSize: 48 }}>{saved}</div></Link>
      </div>
      {!user && <p style={{ color: "var(--mute)", marginBottom: 24 }}>You are browsing as a guest. <Link href="/login" style={{ color: "var(--gold)" }}>Sign in</Link> to keep your profile across devices. Your cart and order history are managed by the store backend.</p>}
      <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
        <input aria-label="Name" placeholder="Name" value={p.name} onChange={(e) => p.save({ name: e.target.value })} style={f} />
        <input aria-label="Email" type="email" placeholder="Email" value={user?.email ?? p.email} readOnly={!!user} onChange={(e) => p.save({ email: e.target.value })} style={f} />
        <select aria-label="Usual size" value={p.size} onChange={(e) => p.save({ size: e.target.value })} style={f}>{["XS", "S", "M", "L", "XL"].map((s) => <option key={s}>{s}</option>)}</select>
        {user && <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={save} style={{ height: 52, padding: "0 32px", borderRadius: 40, border: 0, background: "var(--gold)", color: "#0b0a09", letterSpacing: ".3em", fontSize: 12, textTransform: "uppercase", cursor: "pointer" }}>Save</button>
          <button onClick={() => createClient().auth.signOut()} style={{ height: 52, padding: "0 28px", borderRadius: 40, border: "1px solid var(--glass-line)", background: "none", color: "var(--mute)", cursor: "pointer" }}>Sign out</button>
          <span role="status" style={{ color: "var(--mute)", fontSize: 14 }}>{msg}</span></div>}
      </div>
    </main>
  );
}
