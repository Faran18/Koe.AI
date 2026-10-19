import PageShell from "@/components/PageShell";
export const metadata = { title: "About — VELORA" };
export default function About() {
  return (
    <PageShell eyebrow="The House" title={<>Made for the <em style={{ color: "var(--gold)" }}>quiet hours</em></>}>
      <p>VELORA is a digital fashion house for tailored streetwear. We design in small chapters, each built around a mood rather than a trend.</p>
      <p>Every piece is shown in motion, because cloth is meant to move. [ADD FOUNDING STORY, TEAM AND ATELIER DETAILS]</p>
    </PageShell>
  );
}
