"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
const f = { height: 52, borderRadius: 14, border: "1px solid var(--glass-line)", background: "var(--glass)", color: "var(--ivory)", padding: "0 18px", fontFamily: "inherit", fontSize: 15, width: "100%" } as const;

export default function Login() {
  const router = useRouter();
  const [up, setUp] = useState(false), [email, setEmail] = useState(""), [pw, setPw] = useState(""), [name, setName] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const sb = createClient();
    if (up) {
      const { data, error } = await sb.auth.signUp({ email, password: pw, options: { data: { name }, emailRedirectTo: `${location.origin}/auth/callback` } });
      if (error) setMsg(error.message);
      else if (data.session) router.push("/account");
      else setMsg("Check your inbox to confirm your email, then sign in.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message); else router.push("/account");
    }
    setBusy(false);
  }

  return (
    <main className="page">
      <p className="eyebrow">{up ? "Join" : "Welcome back"}</p>
      <h1 style={{ fontSize: "clamp(48px, 7vw, 96px)", margin: "16px 0 40px" }}>{up ? <>Create your <em style={{ color: "var(--gold)" }}>account</em></> : <>Sign <em style={{ color: "var(--gold)" }}>in</em></>}</h1>
      {!supabaseConfigured ? <p style={{ color: "var(--mute)" }}>Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.</p> : (
        <form onSubmit={submit} style={{ display: "grid", gap: 16, maxWidth: 460 }}>
          {up && <input aria-label="Name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={f} />}
          <input required type="email" aria-label="Email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={f} />
          <input required type="password" minLength={6} aria-label="Password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} style={f} />
          <button disabled={busy} style={{ height: 56, borderRadius: 40, border: 0, background: "var(--gold)", color: "#0b0a09", letterSpacing: ".3em", fontSize: 12, textTransform: "uppercase", cursor: "pointer" }}>{up ? "Create account" : "Sign in"}</button>
          {msg && <p role="status" style={{ color: "var(--mute)", fontSize: 14, margin: 0 }}>{msg}</p>}
          <button type="button" onClick={() => { setUp(!up); setMsg(""); }} style={{ background: "none", border: 0, color: "var(--gold)", cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit" }}>{up ? "Already have an account? Sign in" : "New here? Create an account"}</button>
        </form>)}
    </main>
  );
}
