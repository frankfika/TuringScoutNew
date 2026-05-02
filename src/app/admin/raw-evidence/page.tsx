import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function RawEvidencePage() {
  await requireAdmin();
  const [evidence, sources] = await Promise.all([
    prisma.rawEvidence.findMany({ include: { source: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.source.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <section className="container-shell grid gap-6 pb-16 lg:grid-cols-[380px_1fr]">
      <form action="/api/admin/raw-evidence/import" method="post" className="glass rounded-[30px] p-6 lg:sticky lg:top-28 lg:self-start">
        <h1 className="text-3xl font-black">Import evidence</h1>
        <label className="mt-4 block"><span className="text-sm font-black">Source</span><select name="sourceId" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white/70 px-3 py-2"><option value="">Manual import</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label>
        <Field name="sourceUrl" label="Source URL" required />
        <Field name="rawTitle" label="Raw title" />
        <label className="mt-3 block"><span className="text-sm font-black">Excerpt</span><textarea name="rawTextExcerpt" rows={5} className="mt-1 w-full rounded-2xl border border-ink/10 bg-white/70 px-3 py-2" /></label>
        <button className="mt-4 rounded-full bg-ink px-5 py-3 font-black text-sand">Import</button>
      </form>
      <div>
        <h1 className="mb-5 text-5xl font-black">Raw evidence</h1>
        <div className="grid gap-4">{evidence.map((raw) => <article key={raw.id} className="glass rounded-[28px] p-5"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xl font-black">{raw.rawTitle ?? raw.sourceUrl}</p><p className="mt-1 break-all text-sm text-ink/62">{raw.sourceUrl}</p><p className="mt-2 text-sm text-ink/55">{raw.sourceName ?? raw.source?.name} / fetch {raw.fetchStatus} / extraction {raw.extractionStatus} / review {raw.reviewStatus}</p><p className="mt-2 text-sm text-ink/55">{raw.rawTextExcerpt}</p></div><form action={`/api/admin/raw-evidence/${raw.id}/extract`} method="post"><button className="rounded-full bg-moss px-4 py-2 text-sm font-black text-white">Extract draft</button></form></div></article>)}</div>
      </div>
    </section>
  );
}
function Field({ name, label, required }: { name: string; label: string; required?: boolean }) { return <label className="mt-3 block"><span className="text-sm font-black">{label}</span><input name={name} required={required} className="mt-1 w-full rounded-2xl border border-ink/10 bg-white/70 px-3 py-2" /></label>; }
