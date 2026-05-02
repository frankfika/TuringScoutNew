import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { asStringArray, scoreFor } from "@/lib/format";

export default async function AdminOpportunitiesPage() {
  await requireAdmin();
  const opportunities = await prisma.opportunity.findMany({ include: { project: true, evidence: true }, orderBy: [{ status: "asc" }, { organicScore: "desc" }], take: 200 });
  return (
    <section className="container-shell pb-16">
      <h1 className="text-5xl font-black">Opportunities</h1>
      <div className="mt-6 overflow-x-auto glass rounded-[30px] p-2">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead><tr className="text-ink/50"><th className="p-3">Title</th><th>Status</th><th>Score</th><th>Risk</th><th>Evidence</th><th>Actions</th></tr></thead>
          <tbody>{opportunities.map((opp) => <tr key={opp.id} className="border-t border-ink/10"><td className="p-3"><p className="font-black">{opp.title}</p><p className="text-ink/55">{opp.project.name}</p></td><td>{opp.status}</td><td>{Math.round(scoreFor(opp.organicScore, opp.adminScoreOverride))}</td><td>{asStringArray(opp.riskLabels).join(", ")}</td><td>{opp.evidence.length}</td><td><div className="flex flex-wrap gap-2"><Link href={`/opportunities/${opp.slug}`} className="rounded-full bg-white/70 px-3 py-1 font-bold">View</Link><form action={`/api/admin/opportunities/${opp.id}/expire`} method="post"><button className="rounded-full bg-amber-100 px-3 py-1 font-bold">Expire</button></form></div></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
