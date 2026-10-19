import Link from "next/link";
import PageShell from "@/components/PageShell";
import { JOURNAL } from "@/content/site";
export const metadata = { title: "Journal — VELORA" };
export default function Journal() {
  return (
    <PageShell eyebrow="Journal" title={<>Notes from the <em style={{ color: "var(--gold)" }}>atelier</em></>}>
      {JOURNAL.map((j, i) => (
        <Link key={j.slug} href={`/journal/${j.slug}`} style={{ display: "grid", gridTemplateColumns: "60px 1fr auto", alignItems: "baseline", gap: 20, padding: "28px 0", borderBottom: "1px solid var(--glass-line)" }}>
          <span style={{ color: "var(--gold)" }}>0{i + 1}</span><span style={{ fontFamily: "var(--font-serif)", fontSize: 38, color: "var(--ivory)" }}>{j.title}</span><span className="eyebrow">{j.tag}</span>
        </Link>
      ))}
    </PageShell>
  );
}
