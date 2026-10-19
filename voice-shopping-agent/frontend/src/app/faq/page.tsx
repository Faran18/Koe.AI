import PageShell from "@/components/PageShell";
import { FAQ } from "@/content/site";
export const metadata = { title: "FAQ — VELORA" };
export default function Faq() {
  return (
    <PageShell eyebrow="Care" title={<>Questions, <em style={{ color: "var(--gold)" }}>answered</em></>}>
      {FAQ.map((f) => (
        <details key={f.q} style={{ borderBottom: "1px solid var(--glass-line)", padding: "20px 0" }}>
          <summary style={{ cursor: "pointer", fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ivory)" }}>{f.q}</summary>
          <p style={{ margin: "12px 0 0" }}>{f.a}</p>
        </details>
      ))}
    </PageShell>
  );
}
