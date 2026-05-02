import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/categories";
import { PageIntro } from "@/components/PageIntro";

export default async function IntelligencePage() {
  const [reports, trends, projects] = await Promise.all([
    prisma.projectReport.findMany({ where: { status: "published" }, include: { project: true }, orderBy: { updatedAt: "desc" }, take: 12 }),
    prisma.categoryTrendSnapshot.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.project.findMany({ where: { status: "published" }, include: { opportunities: true, creatorContent: true, evidence: true }, take: 8 }),
  ]);
  return <><PageIntro eyebrow="V4 Intelligence" title="Evidence graph as a data product." description="Project, category, creator, and campaign intelligence generated from TuringScout's evidence and attribution graph." /><section className="container-shell pb-16"><div className="grid gap-5 md:grid-cols-4">{categories.map((c) => <Link key={c.slug} href={`/api/v1/categories/${c.slug}`} className="glass rounded-[26px] p-5"><p className="text-sm font-black text-moss">API</p><p className="mt-2 font-black">{c.name}</p></Link>)}</div><Panel title="Project reports">{reports.map((report) => <Link key={report.id} href={`/reports/${report.slug}`} className="block rounded-2xl bg-white/50 p-4"><p className="font-black">{report.title}</p><p className="text-sm text-ink/60">{report.summary}</p></Link>)}</Panel><Panel title="Latest trend snapshots">{trends.map((trend) => <div key={trend.id} className="rounded-2xl bg-white/50 p-4"><p className="font-black">{trend.category}: {trend.opportunityCount} opportunities</p><p className="text-sm text-ink/60">Average score {Math.round(trend.averageScore)}</p></div>)}</Panel><Panel title="Project dashboard candidates">{projects.map((project) => <Link key={project.id} href={`/api/v1/reports/project/${project.slug}`} className="block rounded-2xl bg-white/50 p-4"><p className="font-black">{project.name}</p><p className="text-sm text-ink/60">{project.opportunities.length} opps / {project.creatorContent.length} creator credits / {project.evidence.length} evidence</p></Link>)}</Panel></section></>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="glass mt-6 rounded-[30px] p-6"><h2 className="text-2xl font-black">{title}</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{children}</div></div>; }
