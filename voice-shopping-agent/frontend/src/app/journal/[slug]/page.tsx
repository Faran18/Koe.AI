import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { JOURNAL } from "@/content/site";
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const a = JOURNAL.find((j) => j.slug === (await params).slug);
  if (!a) notFound();
  return <PageShell eyebrow={a.tag} title={a.title}>{a.body.map((p, i) => <p key={i}>{p}</p>)}</PageShell>;
}
