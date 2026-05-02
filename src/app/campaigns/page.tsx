import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageIntro } from "@/components/PageIntro";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({ where: { status: "published" }, include: { project: true, tasks: true, proofSubmissions: true }, orderBy: { createdAt: "desc" } });
  return <><PageIntro eyebrow="V3 campaigns" title="Quality-reviewed adoption campaigns." description="Campaigns are sponsored/paid when applicable, reviewed manually, and focused on useful adoption work rather than fake engagement." /><section className="container-shell grid gap-5 pb-16 md:grid-cols-2">{campaigns.map((campaign) => <Link key={campaign.id} href={`/campaigns/${campaign.slug}`} className="glass rounded-[30px] p-6 transition hover:-translate-y-1"><p className="text-sm font-black uppercase tracking-[0.22em] text-moss">{campaign.campaignType} / sponsored disclosed</p><h2 className="mt-3 text-3xl font-black">{campaign.title}</h2><p className="mt-3 text-ink/65">{campaign.project.name}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/60">{campaign.brief}</p><p className="mt-4 text-sm font-bold">{campaign.tasks.length} tasks / {campaign.proofSubmissions.length} proofs pending or reviewed</p></Link>)}</section></>;
}
