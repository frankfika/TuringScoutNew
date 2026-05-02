import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminCampaignsPage() {
  await requireAdmin();
  const campaigns = await prisma.campaign.findMany({ include: { project: true, tasks: true, proofSubmissions: true }, orderBy: { createdAt: "desc" } });
  return <section className="container-shell pb-16"><h1 className="text-5xl font-black">Campaigns</h1><div className="mt-6 grid gap-4">{campaigns.map((campaign) => <article key={campaign.id} className="glass rounded-[28px] p-5"><p className="text-xl font-black">{campaign.title}</p><p className="mt-1 text-sm text-ink/60">{campaign.project.name} / {campaign.campaignType} / {campaign.status} / sponsored={String(campaign.isSponsored)}</p><p className="mt-2 text-sm text-ink/60">{campaign.tasks.length} tasks / {campaign.proofSubmissions.length} proofs</p></article>)}</div></section>;
}
