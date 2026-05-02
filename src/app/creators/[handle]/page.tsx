import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CreatorProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const normalized = `@${handle.replace(/^@/, "")}`;
  const creator = await prisma.creator.findFirst({ where: { OR: [{ handle: normalized }, { handle }], status: "visible" }, include: { creatorContent: { include: { project: true, opportunity: true } }, proofSubmissions: true, attributionEvents: true } });
  if (!creator) notFound();
  return <section className="container-shell py-12"><div className="glass rounded-[34px] p-8"><p className="text-sm font-black uppercase tracking-[0.24em] text-moss">Creator profile</p><h1 className="mt-2 text-6xl font-black">{creator.handle ?? creator.displayName}</h1><p className="mt-3 text-ink/60">{creator.role} / quality {creator.qualityScore ?? "curated"}</p></div><div className="mt-6 grid gap-5 md:grid-cols-3"><Metric label="Content credits" value={creator.creatorContent.length} /><Metric label="Proofs" value={creator.proofSubmissions.length} /><Metric label="Attribution events" value={creator.attributionEvents.length} /></div><div className="glass mt-6 rounded-[30px] p-6"><h2 className="text-2xl font-black">Visible contributions</h2><div className="mt-4 grid gap-3">{creator.creatorContent.map((content) => <a key={content.id} href={content.contentUrl} target="_blank" className="rounded-2xl bg-white/50 p-4"><p className="font-black">{content.publicCreditLabel?.replaceAll("_", " ")}: {content.project?.name ?? content.opportunity?.title}</p><p className="text-sm text-ink/60">{content.summary}</p></a>)}</div></div></section>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="glass rounded-[26px] p-5"><p className="text-sm text-ink/50">{label}</p><p className="mt-2 text-4xl font-black">{value}</p></div>; }
