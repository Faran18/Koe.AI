import Link from "next/link";
const cols = [
  { t: "House", l: [["About", "/about"], ["Journal", "/journal"], ["Sustainability", "/sustainability"]] },
  { t: "Care", l: [["Size Guide", "/size-guide"], ["FAQ", "/faq"], ["Contact", "/contact"]] },
  { t: "You", l: [["Account", "/account"], ["Wishlist", "/wishlist"], ["Orders", "/orders"], ["Search", "/search"]] },
  { t: "Legal", l: [["Privacy", "/privacy"], ["Terms", "/terms"]] },
];
export default function Footer() {
  return (
    <footer className="footer" style={{ borderTop: "1px solid var(--glass-line)", padding: "64px 56px 48px", display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", gap: 32 }}>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, letterSpacing: ".5em" }}>VELORA</div>
      {cols.map((c) => (
        <nav key={c.t} aria-label={c.t} style={{ display: "grid", gap: 10, alignContent: "start", fontSize: 13, color: "var(--mute)" }}>
          <span className="eyebrow">{c.t}</span>{c.l.map(([n, h]) => <Link key={h} href={h}>{n}</Link>)}
        </nav>
      ))}
    </footer>
  );
}
