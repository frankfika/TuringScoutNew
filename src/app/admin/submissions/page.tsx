import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function SubmissionsPage() {
  await requireAdmin();
  const submissions = await prisma.submission.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return <section className="container-shell pb-16"><h1 className="text-5xl font-black">Submissions</h1><div className="mt-6 grid gap-4">{submissions.map((sub) => <article key={sub.id} className="glass rounded-[26px] p-5"><p className="font-black">{sub.type} / {sub.status}</p><a href={sub.url} className="mt-1 block break-all text-sm text-moss" target="_blank" rel="noreferrer">{sub.url}</a><p className="mt-2 text-sm text-ink/60">{sub.note}</p><p className="mt-2 text-xs text-ink/40">Private contact stored, never shown publicly: {sub.contactEmail ? "yes" : "no"}</p></article>)}</div></section>;
}
