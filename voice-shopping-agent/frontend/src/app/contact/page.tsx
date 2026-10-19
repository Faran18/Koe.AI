"use client";
import { useState } from "react";
import PageShell from "@/components/PageShell";
const f = { height: 52, borderRadius: 14, border: "1px solid var(--glass-line)", background: "var(--glass)", color: "var(--ivory)", padding: "0 18px", fontFamily: "inherit", fontSize: 15, width: "100%" } as const;
export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell eyebrow="Care" title={<>Write to <em style={{ color: "var(--gold)" }}>us</em></>}>
      {sent ? <p>Thank you. We will reply within [X] business days. (Demo form: connect an email service in <code>/api</code> to deliver messages.)</p> : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "grid", gap: 16, maxWidth: 560 }}>
          <input required aria-label="Name" placeholder="Name" style={f} /><input required type="email" aria-label="Email" placeholder="Email" style={f} />
          <textarea required aria-label="Message" placeholder="How can we help?" rows={6} style={{ ...f, height: "auto", padding: 18 }} />
          <button style={{ height: 56, borderRadius: 40, border: 0, background: "var(--gold)", color: "#0b0a09", letterSpacing: ".3em", fontSize: 12, textTransform: "uppercase", cursor: "pointer" }}>Send</button>
        </form>)}
    </PageShell>
  );
}
