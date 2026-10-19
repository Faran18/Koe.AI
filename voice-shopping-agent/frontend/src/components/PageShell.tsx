export default function PageShell({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="page">
      <p className="eyebrow">{eyebrow}</p>
      <h1 style={{ fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 0.95, margin: "16px 0 48px" }}>{title}</h1>
      <div style={{ color: "var(--mute)", lineHeight: 1.85, fontSize: 17 }}>{children}</div>
    </main>
  );
}
