import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AutomationPage() {
  await requireAdmin();
  const [tasks, digests, notifications, pendingRaw, openReviews] = await Promise.all([
    prisma.automationTask.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.digestDraft.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.notificationDraft.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.rawEvidence.count({ where: { extractionStatus: "pending" } }),
    prisma.reviewQueueItem.count({ where: { status: "open" } }),
  ]);
  return <section className="container-shell pb-16"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-black uppercase tracking-[0.24em] text-moss">V1.5</p><h1 className="text-5xl font-black">Automation hardening</h1></div><form action="/api/admin/automation/run" method="post"><button className="rounded-full bg-ember px-5 py-3 font-black text-white">Run batch automation</button></form></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Metric label="Pending raw extraction" value={pendingRaw} /><Metric label="Open review queue" value={openReviews} /></div><Panel title="Digest drafts">{digests.map((d) => <Row key={d.id} title={d.title} detail={d.body} />)}</Panel><Panel title="Notification drafts">{notifications.map((n) => <Row key={n.id} title={n.subject} detail={`${n.targetType}: ${n.body}`} />)}</Panel><Panel title="Automation tasks">{tasks.map((t) => <Row key={t.id} title={`${t.taskType} / ${t.status}`} detail={JSON.stringify(t.result ?? t.error ?? t.payload)} />)}</Panel></section>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="glass rounded-[26px] p-5"><p className="text-sm text-ink/50">{label}</p><p className="mt-2 text-4xl font-black">{value}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="glass mt-6 rounded-[30px] p-6"><h2 className="text-2xl font-black">{title}</h2><div className="mt-4 grid gap-3">{children}</div></div>; }
function Row({ title, detail }: { title: string; detail?: string | null }) { return <div className="rounded-2xl bg-white/50 p-4"><p className="font-black">{title}</p>{detail ? <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-ink/60">{detail}</p> : null}</div>; }
