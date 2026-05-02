import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  await requireAdmin();
  const [events, clicksByCategory, topClicks] = await Promise.all([
    prisma.analyticsEvent.groupBy({ by: ["eventName"], _count: { eventName: true }, orderBy: { _count: { eventName: "desc" } } }),
    prisma.outboundClick.groupBy({ by: ["category"], _count: { category: true }, orderBy: { _count: { category: "desc" } } }),
    prisma.outboundClick.findMany({ include: { opportunity: { include: { project: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  return <section className="container-shell pb-16"><h1 className="text-5xl font-black">Analytics</h1><div className="mt-6 grid gap-5 md:grid-cols-2"><Panel title="Events">{events.map((e) => <Row key={e.eventName ?? "unknown"} label={e.eventName} value={e._count.eventName} />)}</Panel><Panel title="Clicks by category">{clicksByCategory.map((e) => <Row key={e.category ?? "unknown"} label={e.category ?? "unknown"} value={e._count.category} />)}</Panel></div><Panel title="Recent outbound clicks" className="mt-5">{topClicks.map((click) => <Row key={click.id} label={`${click.opportunity?.project.name ?? "unknown"} / ${click.sourceModule}`} value={click.createdAt.toLocaleString()} />)}</Panel></section>;
}
function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) { return <div className={`glass rounded-[30px] p-6 ${className}`}><h2 className="text-2xl font-black">{title}</h2><div className="mt-4 space-y-2">{children}</div></div>; }
function Row({ label, value }: { label: string; value: string | number }) { return <div className="flex justify-between gap-4 rounded-2xl bg-white/50 p-3 text-sm"><span className="font-bold">{label}</span><span>{value}</span></div>; }
