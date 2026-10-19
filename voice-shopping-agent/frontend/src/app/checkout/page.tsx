"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { placeOrder } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useOrders, type Order } from "@/store/orders";
import { format } from "@/lib/currency";

const field = { height: 52, borderRadius: 14, border: "1px solid var(--glass-line)", background: "var(--glass)", color: "var(--ivory)", padding: "0 18px", fontFamily: "inherit", fontSize: 15, width: "100%" } as const;

export default function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const addOrder = useOrders((state) => state.add);
  const [done, setDone] = useState<Order | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = subtotal();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lines.length || busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const shippingAddress = [
      String(form.get("full_name") ?? ""),
      String(form.get("address") ?? ""),
      `${String(form.get("city") ?? "")} ${String(form.get("postal_code") ?? "")}`.trim(),
    ].join(", ");
    try {
      setDone(addOrder(await placeOrder(shippingAddress), email));
      clear();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not place the order.");
    } finally {
      setBusy(false);
    }
  }

  if (done) return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div className="glass" style={{ padding: "64px 48px", maxWidth: 560 }}>
        <p className="eyebrow">Order {done.id}</p>
        <h1 style={{ fontSize: 56, margin: "16px 0" }}>Thank you. <em>It is yours.</em></h1>
        <p style={{ color: "var(--mute)", lineHeight: 1.7 }}>Your order has been recorded. The order total is {format(done.total, done.lines[0]?.currency)}; payment and delivery are handled according to the store's available options.</p>
        <Link href="/orders" style={{ display: "inline-block", marginTop: 28, color: "var(--gold)", letterSpacing: ".3em", fontSize: 12, textTransform: "uppercase" }}>View your order</Link>
      </div>
    </main>
  );

  return (
    <main className="checkout-main" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, padding: "140px 56px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <p className="eyebrow">Checkout</p><h1 style={{ fontSize: 56, marginBottom: 12 }}>Almost <em>yours</em></h1>
        <input required type="email" placeholder="Email" aria-label="Email" value={email} onChange={(event) => setEmail(event.target.value)} style={field} />
        <input required name="full_name" placeholder="Full name" aria-label="Full name" style={field} />
        <input required name="address" placeholder="Address" aria-label="Address" style={field} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><input required name="city" placeholder="City" aria-label="City" style={field} /><input required name="postal_code" placeholder="Postal code" aria-label="Postal code" style={field} /></div>
        <div className="glass" style={{ padding: 20, color: "var(--mute)", fontSize: 14, borderRadius: 14 }}>The order is created in the store database. Shipping charges and payment are not collected by this checkout endpoint.</div>
        {error && <p role="alert" style={{ color: "var(--gold)" }}>{error}</p>}
        <button type="submit" disabled={!lines.length || busy} style={{ height: 58, borderRadius: 40, border: 0, background: "var(--gold)", color: "#0b0a09", fontSize: 12, letterSpacing: ".3em", textTransform: "uppercase", cursor: "pointer", opacity: lines.length && !busy ? 1 : 0.4 }}>{busy ? "Placing order…" : `Place order · ${format(total, lines[0]?.currency)}`}</button>
      </form>
      <aside className="glass" style={{ padding: 32, alignSelf: "start", display: "grid", gap: 16 }}>
        <h2 style={{ fontSize: 30 }}>Summary</h2>
        {lines.map((line) => <div key={line.itemId} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--mute)" }}><span>{line.title}{line.size ? ` · ${line.size}` : ""} × {line.qty}</span><span>{format(line.price * line.qty, line.currency)}</span></div>)}
        {!lines.length && <p style={{ color: "var(--mute)" }}>Your bag is empty.</p>}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--mute)" }}><span>Shipping</span><span>Not included</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--gold)", fontSize: 18, borderTop: "1px solid var(--glass-line)", paddingTop: 16 }}><span>Order subtotal</span><span>{format(total, lines[0]?.currency)}</span></div>
      </aside>
    </main>
  );
}
