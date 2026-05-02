import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminReportsPage() {
  await requireAdmin();
  const [reports, projects] = await Promise.all([
    prisma.projectReport.findMany({ include: { project: true }, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ where: { status: "published" }, orderBy: { name: "asc" }, take: 100 }),
  ]);
  return <section className="container-shell pb-16"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><h1 className="text-5xl font-black">Reports</h1><form action="/api/admin/reports/generate" method="post" className="glass flex flex-wrap gap-2 rounded-full p-2"><select name="projectId" className="rounded-full bg-white/70 px-4 py-2"><option value="">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><button className="rounded-full bg-ember px-4 py-2 text-sm font-black text-white">Generate</button></form></div><div className="mt-6 grid gap-4">{reports.map((report) => <article key={report.id} className="glass rounded-[28px] p-5"><p className="text-xl font-black">{report.title}</p><p className="mt-1 text-sm text-ink/60">{report.project.name} / {report.status}</p><pre className="mt-3 max-h-56 overflow-auto rounded-2xl bg-ink p-4 text-xs text-sand">{JSON.stringify(report.metrics, null, 2)}</pre></article>)}</div></section>;
}
