import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function ReviewPage() {
  await requireAdmin();
  const [items, submissions] = await Promise.all([
    prisma.reviewQueueItem.findMany({ where: { status: "open" }, include: { opportunity: { include: { project: true, evidence: true } } }, orderBy: [{ priority: "asc" }, { createdAt: "desc" }], take: 100 }),
    prisma.submission.findMany({ where: { status: "received" }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <section className="container-shell pb-16">
      <h1 className="text-5xl font-black">Review queue</h1>
      <div className="mt-6 grid gap-5">
        {items.map((item) => <article key={item.id} className="glass rounded-[30px] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-moss">{item.priority} / {item.entityType}</p>
              <h2 className="mt-2 text-2xl font-black">{item.opportunity?.title ?? item.entityId}</h2>
              <p className="mt-2 text-sm text-ink/62">{item.reason}</p>
              {item.opportunity ? <p className="mt-2 text-sm text-ink/62">Project: {item.opportunity.project.name} / status: {item.opportunity.status} / score: {item.opportunity.organicScore}</p> : null}
            </div>
            {item.opportunity ? <div className="flex flex-wrap gap-2">
              <Link href={`/opportunities/${item.opportunity.slug}`} className="rounded-full bg-white/70 px-4 py-2 text-sm font-black">Preview</Link>
              <form action={`/api/admin/opportunities/${item.opportunity.id}/publish`} method="post"><button className="rounded-full bg-moss px-4 py-2 text-sm font-black text-white">Publish</button></form>
              <form action={`/api/admin/opportunities/${item.opportunity.id}/reject`} method="post" className="flex gap-2"><input name="reason" placeholder="reason" className="w-32 rounded-full bg-white/70 px-3 text-sm" /><button className="rounded-full bg-ink px-4 py-2 text-sm font-black text-sand">Reject</button></form>
            </div> : null}
          </div>
        </article>)}
        {!items.length ? <div className="glass rounded-[30px] p-8 text-center font-bold">No open review items.</div> : null}
      </div>

      <h2 className="mt-10 text-3xl font-black">Received submissions</h2>
      <div className="mt-4 grid gap-3">
        {submissions.map((submission) => <div key={submission.id} className="glass rounded-[24px] p-4 text-sm"><p className="font-black">{submission.type}: <a href={submission.url} target="_blank" rel="noreferrer" className="text-moss">{submission.url}</a></p><p className="mt-1 text-ink/60">{submission.note}</p></div>)}
      </div>
    </section>
  );
}
