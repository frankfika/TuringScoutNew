import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  const [saved, opportunities, proofs, claims] = await Promise.all([
    prisma.savedOpportunity.findMany({ where: { userId: user.id }, include: { opportunity: { include: { project: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.opportunity.findMany({ where: { status: "published" }, include: { project: true }, orderBy: { organicScore: "desc" }, take: 8 }),
    prisma.proofSubmission.findMany({ where: { OR: [{ userEmail: user.email }, { creatorId: user.creatorId ?? "" }] }, orderBy: { createdAt: "desc" } }),
    prisma.projectClaim.findMany({ where: { contactEmail: user.email }, include: { project: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return <section className="container-shell pb-16"><div className="glass rounded-[34px] p-7"><p className="text-sm font-black uppercase tracking-[0.24em] text-moss">V2 profile</p><h1 className="mt-2 text-5xl font-black">{user.displayName}</h1><p className="mt-2 text-ink/60">{user.email} / {user.creator?.handle}</p><form action="/api/auth/logout" method="post"><button className="mt-4 rounded-full bg-white/70 px-4 py-2 font-black">Logout</button></form></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><Panel title="Save or mark progress">{opportunities.map((opp) => <form key={opp.id} action="/api/me/save" method="post" className="rounded-2xl bg-white/50 p-4"><input type="hidden" name="opportunityId" value={opp.id} /><p className="font-black">{opp.project.name}: {opp.title}</p><select name="status" className="mt-2 rounded-xl bg-white px-3 py-2"><option value="saved">saved</option><option value="attempted">attempted</option><option value="completed">completed</option></select><input name="proofUrl" placeholder="proof URL optional" className="ml-2 mt-2 rounded-xl bg-white px-3 py-2" /><button className="ml-2 rounded-full bg-moss px-4 py-2 text-sm font-black text-white">Save</button></form>)}</Panel><Panel title="Saved / attempted">{saved.map((item) => <Link key={item.id} href={`/opportunities/${item.opportunity.slug}`} className="block rounded-2xl bg-white/50 p-4"><p className="font-black">{item.status}: {item.opportunity.project.name}</p><p className="text-sm text-ink/60">{item.opportunity.title}</p></Link>)}</Panel><Panel title="Proof submissions">{proofs.map((proof) => <a key={proof.id} href={proof.proofUrl} className="block rounded-2xl bg-white/50 p-4 text-sm" target="_blank">{proof.status}: {proof.proofUrl}</a>)}</Panel><Panel title="Project claims">{claims.map((claim) => <div key={claim.id} className="rounded-2xl bg-white/50 p-4 text-sm">{claim.status}: {claim.project.name}</div>)}</Panel></div></section>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="glass rounded-[30px] p-6"><h2 className="text-2xl font-black">{title}</h2><div className="mt-4 grid gap-3">{children}</div></div>; }
