import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await prisma.projectReport.findUnique({ where: { slug }, include: { project: true } });
  if (!report || report.status !== "published") notFound();
  return <section className="container-shell py-12"><article className="glass rounded-[34px] p-8"><p className="text-sm font-black uppercase tracking-[0.24em] text-moss">Project intelligence report</p><h1 className="mt-3 text-5xl font-black">{report.title}</h1><p className="mt-5 text-lg leading-8 text-ink/68">{report.summary}</p><pre className="mt-8 overflow-auto rounded-3xl bg-ink p-5 text-sm text-sand">{JSON.stringify({ metrics: report.metrics, recommendations: report.recommendations }, null, 2)}</pre><p className="mt-5 text-sm text-ink/55">Attribution uses correlated lift language only. This report does not claim exact causal impact.</p></article></section>;
}
