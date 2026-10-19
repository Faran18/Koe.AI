"use client";
import { useState } from "react";
import PageShell from "@/components/PageShell";
const SIZES = ["XS", "S", "M", "L", "XL"];
const f = { height: 52, borderRadius: 14, border: "1px solid var(--glass-line)", background: "var(--glass)", color: "var(--ivory)", padding: "0 18px", fontFamily: "inherit", fontSize: 15, width: "100%" } as const;
export default function SizeGuide() {
  const [h, setH] = useState(170), [w, setW] = useState(65), [fit, setFit] = useState("regular");
  const score = ((h - 150) / 12 + (w - 45) / 14) / 2 + (fit === "relaxed" ? 0.8 : 0);
  const size = SIZES[Math.min(4, Math.max(0, Math.round(score)))];
  return (
    <PageShell eyebrow="Fit Assistant" title={<>Find your <em style={{ color: "var(--gold)" }}>size</em></>}>
      <div className="glass" style={{ padding: 32, display: "grid", gap: 20, maxWidth: 560 }}>
        <label>Height: {h} cm<input type="range" min={145} max={205} value={h} onChange={(e) => setH(+e.target.value)} style={{ width: "100%", accentColor: "#c9a96a" }} /></label>
        <label>Weight: {w} kg<input type="range" min={40} max={130} value={w} onChange={(e) => setW(+e.target.value)} style={{ width: "100%", accentColor: "#c9a96a" }} /></label>
        <label>Preferred fit<select value={fit} onChange={(e) => setFit(e.target.value)} style={f}><option value="regular">Regular</option><option value="relaxed">Relaxed</option></select></label>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 64, color: "var(--gold)" }}>{size}</div>
        <p style={{ fontSize: 14, margin: 0 }}>A starting estimate from height and weight only. Each piece's cut varies, so ask the Concierge if you are between sizes.</p>
      </div>
    </PageShell>
  );
}
