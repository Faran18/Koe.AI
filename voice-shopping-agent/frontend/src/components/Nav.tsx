"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import Magnetic from "./Magnetic";
import MobileMenu from "./MobileMenu";

export default function Nav() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const toggle = useCart((s) => s.toggle);
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { document.documentElement.dataset.theme = light ? "light" : "dark"; }, [light]);
  const link = { fontSize: 12, letterSpacing: ".28em", textTransform: "uppercase" as const, color: "var(--mute)" };
  return (
    <header style={{ position: "fixed", inset: "20px 28px auto", zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px" }} className="glass">
      <Link href="/" style={{ fontFamily: "var(--font-serif)", fontSize: 22, letterSpacing: ".5em" }}>VELORA</Link>
      <nav className="nav-links" style={{ display: "flex", gap: 36, alignItems: "center" }}>
        <Magnetic><Link href="/shop" style={link}>Collections</Link></Magnetic>
        <Link href="/journal" style={link}>Journal</Link>
        <Link href="/search" style={link}>Search</Link>
        <Link href="/account" style={link}>Account</Link>
        <button onClick={() => setLight(!light)} aria-label="Toggle theme" style={{ ...link, background: "none", border: 0, cursor: "pointer" }}>{light ? "Dusk" : "Dawn"}</button>
      </nav>
      <button onClick={() => toggle()} style={{ ...link, color: "var(--gold)", background: "none", border: 0, cursor: "pointer" }}>Bag ({mounted ? count : 0})</button>
      <MobileMenu />
    </header>
  );
}
