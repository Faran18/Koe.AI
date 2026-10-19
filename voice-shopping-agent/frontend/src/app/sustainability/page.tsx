import PageShell from "@/components/PageShell";
import { SUSTAIN } from "@/content/site";
export const metadata = { title: "Sustainability — VELORA" };
export default function Sustainability() {
  return (
    <PageShell eyebrow="Materials & Care" title={<>Less, <em style={{ color: "var(--gold)" }}>made well</em></>}>
      {SUSTAIN.map((s) => <section key={s.h} className="glass" style={{ padding: 28, marginBottom: 20 }}><h2 style={{ fontSize: 32, color: "var(--ivory)" }}>{s.h}</h2><p>{s.p}</p></section>)}
    </PageShell>
  );
}
