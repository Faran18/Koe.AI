"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [["Collections", "/shop"], ["Journal", "/journal"], ["Search", "/search"], ["Wishlist", "/wishlist"], ["Account", "/account"], ["About", "/about"]];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return (
    <>
      <button className="menu-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} style={{ background: "none", border: "1px solid var(--glass-line)", borderRadius: "50%", width: 44, height: 44, color: "var(--ivory)", cursor: "pointer", fontSize: 16, position: "relative", zIndex: 120 }}>{open ? "✕" : "☰"}</button>
      <AnimatePresence>
        {open && (
          <motion.nav aria-label="Menu" initial={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }} animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }} exit={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 110, background: "var(--ink)", display: "grid", alignContent: "center", gap: 6, padding: "0 32px" }}>
            {LINKS.map(([n, h], i) => (
              <motion.div key={h} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <Link href={h} style={{ fontFamily: "var(--font-serif)", fontSize: 44, lineHeight: 1.25 }}>{n}</Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
