import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  await requireAdmin();
  const [openReview, opportunities, submissions, rawEvidence, clicks, sourceRuns] = await Promise.all([
    prisma.reviewQueueItem.count({ where: { status: "open" } }),
    prisma.opportunity.count({ where: { status: "published" } }),
    prisma.submission.count({ where: { status: "received" } }),
    prisma.rawEvidence.count(),
    prisma.outboundClick.count(),
    prisma.sourceJobRun.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { source: true } }),
  ]);

  return (
    <section className="container-shell pb-16">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-black uppercase tracking-[0.24em] text-moss">Founder workbench</p><h1 className="mt-2 text-5xl font-black">Admin dashboard</h1></div>
        <form action="/api/admin/score/recalculate" method="post"><button className="rounded-full bg-ember px-5 py-3 font-black text-white">Recalculate scores</button></form>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Open review" value={openReview} href="/admin/review" />
        <Metric label="Published" value={opportunities} href="/admin/opportunities" />
        <Metric label="Submissions" value={submissions} href="/admin/submissions" />
        <Metric label="Raw evidence" value={rawEvidence} href="/admin/raw-evidence" />
        <Metric label="Outbound clicks" value={clicks} href="/admin/analytics" />
      </div>
      <div className="glass mt-6 rounded-[30px] p-6">
        <h2 className="text-2xl font-black">Recent source runs</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{sourceRuns.map((run) => <tr key={run.id} className="border-t border-ink/10"><td className="py-3 font-bold">{run.source.name}</td><td>{run.status}</td><td>{run.rawEvidenceCreated} raw / {run.candidatesCreated} candidates</td><td>{run.errorMessage}</td></tr>)}</tbody></table></div>
      </div>
    </section>
  );
}

function Metric({ label, value, href }: { label: string; value: number; href: string }) {
  return <Link href={href} className="glass rounded-[26px] p-5 transition hover:-translate-y-1"><p className="text-sm text-ink/50">{label}</p><p className="mt-2 text-4xl font-black">{value}</p></Link>;
}
