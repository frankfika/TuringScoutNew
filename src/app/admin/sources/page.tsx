import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/categories";

export default async function SourcesPage() {
  await requireAdmin();
  const sources = await prisma.source.findMany({ include: { jobRuns: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { rawEvidence: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <section className="container-shell grid gap-6 pb-16 lg:grid-cols-[380px_1fr]">
      <form action="/api/admin/sources" method="post" className="glass rounded-[30px] p-6 lg:sticky lg:top-28 lg:self-start">
        <h1 className="text-3xl font-black">Create source</h1>
        <Field name="name" label="Name" required />
        <Field name="urlOrQuery" label="URL or query" required />
        <Select name="sourceType" label="Source type" options={["github", "website", "docs", "blog", "rss", "hn", "huggingface", "manual", "submission"]} />
        <Select name="categoryHint" label="Category" options={categories.map((c) => c.slug)} />
        <Select name="priority" label="Priority" options={["high", "medium", "low"]} />
        <Select name="frequency" label="Frequency" options={["daily", "weekly", "manual", "submitted_only"]} />
        <Select name="fetchMethod" label="Fetch method" options={["api", "rss", "public_page", "manual", "submitted_only"]} />
        <label className="mt-3 block"><span className="text-sm font-black">Allowed use notes</span><textarea name="allowedUseNotes" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white/70 px-3 py-2" rows={4} /></label>
        <button className="mt-4 rounded-full bg-ink px-5 py-3 font-black text-sand">Create</button>
      </form>
      <div>
        <h1 className="mb-5 text-5xl font-black">Sources</h1>
        <div className="grid gap-4">{sources.map((source) => <article key={source.id} className="glass rounded-[28px] p-5"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xl font-black">{source.name}</p><p className="mt-1 break-all text-sm text-ink/62">{source.urlOrQuery}</p><p className="mt-2 text-sm text-ink/55">{source.sourceType} / {source.fetchMethod} / {source.frequency} / raw {source._count.rawEvidence}</p><p className="mt-2 text-sm text-ink/55">{source.allowedUseNotes}</p></div><form action={`/api/admin/sources/${source.id}/run`} method="post"><button className="rounded-full bg-ember px-4 py-2 text-sm font-black text-white">Run now</button></form></div><p className="mt-3 text-xs text-ink/50">Last run: {source.jobRuns[0]?.status ?? "never"}</p></article>)}</div>
      </div>
    </section>
  );
}

function Field({ name, label, required }: { name: string; label: string; required?: boolean }) { return <label className="mt-3 block"><span className="text-sm font-black">{label}</span><input name={name} required={required} className="mt-1 w-full rounded-2xl border border-ink/10 bg-white/70 px-3 py-2" /></label>; }
function Select({ name, label, options }: { name: string; label: string; options: string[] }) { return <label className="mt-3 block"><span className="text-sm font-black">{label}</span><select name={name} className="mt-1 w-full rounded-2xl border border-ink/10 bg-white/70 px-3 py-2">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
