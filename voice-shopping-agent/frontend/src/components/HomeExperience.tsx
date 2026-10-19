"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Product } from "@/lib/types";
import { format } from "@/lib/currency";
import Magnetic from "./Magnetic";
import Countdown from "./Countdown";

const ClothViewer = dynamic(() => import("./ClothViewer"), { ssr: false });
const reveal = { initial: { y: 80, opacity: 0 }, whileInView: { y: 0, opacity: 1 }, viewport: { once: true }, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const } };

export default function HomeExperience({ hero, rail }: { hero: Product; rail: Product[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", `-${Math.max(rail.length - 2, 1) * 22}%`]);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 160]);
  const titleY = useTransform(scrollY, [0, 800], [0, -120]);

  return (
    <main>
      {/* 01 — Prologue */}
      <section style={{ position: "relative", height: "100vh", overflow: "hidden", display: "grid", alignItems: "center" }}>
        <motion.div style={{ y: bgY, position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 70% at 68% 55%, #2a2217 0%, var(--ink) 70%)" }} />
        <div className="hero-art" style={{ position: "absolute", left: "52%", top: "12%", width: "34vw", height: "78vh", borderRadius: "999px 999px 8px 8px", border: "1px solid rgba(201,169,106,.4)", boxShadow: "inset 0 0 90px rgba(201,169,106,.08)" }} />
        <div className="hero-art" style={{ position: "absolute", left: "50%", top: "8%", width: "38vw", height: "84vh" }}><ClothViewer src={hero.image_url} /></div>
        <motion.div style={{ y: titleY, position: "relative", padding: "0 56px", maxWidth: 900, pointerEvents: "none" }}>
          <motion.p {...reveal} className="eyebrow">Autumn Chapter I</motion.p>
          <motion.h1 {...reveal} transition={{ ...reveal.transition, delay: 0.15 }} style={{ fontSize: "clamp(64px, 10vw, 148px)", lineHeight: 0.9, margin: "20px 0 36px" }}>
            Wear<br /><em style={{ color: "var(--gold)" }}>the quiet</em><br />hours.
          </motion.h1>
          <div style={{ pointerEvents: "auto" }}><Magnetic>
            <Link href="/shop" style={{ display: "inline-block", padding: "16px 36px", border: "1px solid var(--gold)", color: "var(--gold)", borderRadius: 40, fontSize: 12, letterSpacing: ".3em", textTransform: "uppercase" }}>Enter the atelier</Link>
          </Magnetic></div>
        </motion.div>
      </section>

      {/* 02 — Horizontal collection, driven by vertical scroll */}
      <section ref={railRef} style={{ height: `${rail.length * 55}vh`, position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
          <div style={{ padding: "0 56px" }}><p className="eyebrow">The Collection</p><h2 style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>Pieces, <em>in sequence</em></h2></div>
          <motion.div style={{ x, display: "flex", gap: 40, paddingLeft: 56 }}>
            {rail.map((p, i) => (
              <Link key={p.id} href={`/product/${p.id}`} style={{ flex: "0 0 auto", width: "20vw", minWidth: 240, marginTop: i % 2 ? 60 : 0 }}>
                <div style={{ aspectRatio: "3/4", borderRadius: "999px 999px 10px 10px", background: "linear-gradient(180deg, var(--ink-2), transparent)", border: "1px solid var(--glass-line)", position: "relative", overflow: "hidden" }}>
                  <Image src={p.image_url} alt={p.name} fill sizes="22vw" style={{ objectFit: "contain", padding: 24 }} />
                </div>
                <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--mute)" }}>
                  <span>{p.name}</span><span style={{ color: "var(--gold)" }}>{format(p.price, p.currency ?? undefined)}</span>
                </div>
                <div style={{ marginTop: 5, color: "var(--dim)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>{p.category_group}{p.subcategory ? ` · ${p.subcategory}` : ""}{p.rating ? ` · ${p.rating}★` : ""}</div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 03 — Limited drop */}
      <section style={{ minHeight: "80vh", display: "grid", placeItems: "center", textAlign: "center", padding: 56 }}>
        <motion.div {...reveal} className="glass drop-box" style={{ padding: "72px 96px", maxWidth: 900 }}>
          <p className="eyebrow">Drop 02 opens in</p>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 7vw, 96px)", margin: "24px 0" }}><Countdown to="2026-11-01T18:00:00Z" /></div>
          <p style={{ color: "var(--mute)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>Forty pieces. Never restocked. Early access is for the bag-holders.</p>
          <Magnetic><Link href="/shop?sort=rating" style={{ padding: "16px 36px", background: "var(--gold)", color: "#0b0a09", borderRadius: 40, fontSize: 12, letterSpacing: ".3em", textTransform: "uppercase" }}>Preview the drop</Link></Magnetic>
        </motion.div>
      </section>
    </main>
  );
}
