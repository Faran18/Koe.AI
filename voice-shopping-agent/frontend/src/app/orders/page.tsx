"use client";
import { useEffect } from "react";
import { useOrders } from "@/store/orders";
import { format } from "@/lib/currency";

export default function Orders() {
  const { orders, loading, error, load } = useOrders();
  useEffect(() => { void load(); }, [load]);
  return (
    <main className="page">
      <p className="eyebrow">Orders</p><h1 style={{ fontSize: "clamp(48px, 7vw, 96px)", margin: "16px 0 40px" }}>Your <em style={{ color: "var(--gold)" }}>orders</em></h1>
      {error && <p role="alert" style={{ color: "var(--gold)" }}>{error}</p>}
      {loading && !orders.length && <p style={{ color: "var(--mute)" }}>Loading your orders…</p>}
      {!loading && !error && !orders.length && <p style={{ color: "var(--mute)" }}>No orders yet.</p>}
      {orders.map((order) => (
        <section key={order.id} className="glass" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}><strong>{order.id}</strong><span style={{ color: "var(--gold)" }}>{format(order.total, order.lines[0]?.currency)}</span></div>
          <p style={{ color: "var(--mute)", fontSize: 14 }}>{new Date(order.placedAt).toLocaleDateString()} · {order.status}</p>
          <ul style={{ color: "var(--mute)", lineHeight: 1.8 }}>
            {order.lines.map((line) => <li key={line.itemId}>{line.title}{line.size ? ` (${line.size})` : ""} × {line.qty}</li>)}
          </ul>
        </section>
      ))}
    </main>
  );
}
