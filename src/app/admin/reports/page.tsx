import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminReportsPage() {
  await requireAdmin();
  const reports = await prisma.projectReport.findMany({ include: { project: true }, orderBy: { updatedAt: "desc" } });
  return <section className="container-shell pb-16"><h1 className="text-5xl font-black">Reports</h1><div className="mt-6 grid gap-4">{reports.map((report) => <article key={report.id} className="glass rounded-[28px] p-5"><p className="text-xl font-black">{report.title}</p><p className="mt-1 text-sm text-ink/60">{report.project.name} / {report.status}</p><pre className="mt-3 max-h-56 overflow-auto rounded-2xl bg-ink p-4 text-xs text-sand">{JSON.stringify(report.metrics, null, 2)}</pre></article>)}</div></section>;
}
