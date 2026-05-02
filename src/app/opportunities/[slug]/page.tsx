import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { asSteps, asStringArray, formatMinutes } from "@/lib/format";
import { getOpportunityBySlug } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  return {
    title: opportunity ? `${opportunity.title} - ${opportunity.project.name} | TuringScout` : "Opportunity | TuringScout",
    description: opportunity?.summary ?? undefined,
  };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity || opportunity.status !== "published") notFound();

  const risks = asStringArray(opportunity.riskLabels);
  const utility = asStringArray(opportunity.utilityLabels);
  const steps = asSteps(opportunity.taskSteps);

  return (
    <section className="container-shell grid gap-6 py-12 lg:grid-cols-[1fr_360px]">
      <article className="glass rounded-[34px] p-6 md:p-9">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-moss">{opportunity.project.name}</p>
        <h1 className="mt-4 text-balance text-4xl font-black tracking-tight md:text-6xl">{opportunity.title}</h1>
        <p className="mt-5 text-pretty text-lg leading-8 text-ink/68">{opportunity.summary}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge value={opportunity.trustLabel} />
          {risks.map((risk) => <Badge key={risk} value={risk} />)}
          {utility.map((item) => <Badge key={item} value={item} />)}
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <Fact label="Reward" value={opportunity.rewardDescription ?? opportunity.rewardType ?? "Upside varies"} />
          <Fact label="Effort" value={formatMinutes(opportunity.estimatedMinutes)} />
          <Fact label="Difficulty" value={opportunity.difficulty ?? "Mixed"} />
        </div>

        <Section title="What to do">
          <ol className="space-y-3">
            {steps.map((step, index) => <li key={step} className="rounded-2xl bg-white/50 p-4"><span className="font-black text-moss">{index + 1}.</span> {step}</li>)}
          </ol>
        </Section>

        <Section title="Why ranked">
          <p className="leading-8 text-ink/70">{opportunity.whyRanked}</p>
        </Section>

        <Section title="Official sources">
          <div className="grid gap-3">
            {opportunity.evidence.map((evidence) => (
              <a key={evidence.id} href={evidence.sourceUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-ink/10 bg-white/45 p-4 transition hover:bg-white/70">
                <p className="font-black">{evidence.title ?? evidence.sourceType}</p>
                <p className="mt-1 break-all text-sm text-ink/58">{evidence.sourceUrl}</p>
                {evidence.aiSummary ? <p className="mt-2 text-sm leading-6 text-ink/62">AI Summary: {evidence.aiSummary}</p> : null}
              </a>
            ))}
          </div>
        </Section>

        <Section title="Useful creator context">
          {opportunity.creatorContent.length ? (
            <div className="grid gap-3">
              {opportunity.creatorContent.map((content) => (
                <a key={content.id} href={content.contentUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-white/45 p-4">
                  <p className="font-black">{content.publicCreditLabel?.replaceAll("_", " ") ?? "Creator proof"}: {content.creator?.handle ?? content.creator?.displayName}</p>
                  <p className="mt-1 text-sm text-ink/62">{content.summary}</p>
                </a>
              ))}
            </div>
          ) : <p className="text-ink/62">No approved creator context yet. Official sources remain separate.</p>}
        </Section>
      </article>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-[30px] p-6">
          <Link href={`/go/opportunity/${opportunity.id}?module=opportunity_detail`} className="block rounded-full bg-ember px-5 py-4 text-center font-black text-white transition hover:-translate-y-0.5 hover:bg-ink">
            {opportunity.primaryCtaLabel}
          </Link>
          <Link href={`/projects/${opportunity.project.slug}`} className="mt-3 block rounded-full border border-ink/10 bg-white/55 px-5 py-3 text-center font-black">View project</Link>
        </div>
        <div className="glass rounded-[30px] p-6 text-sm leading-6 text-ink/64">
          <p className="font-black text-ink">Risk note</p>
          <p className="mt-2">Rewards, credits, airdrops, access, or public project claims are never guaranteed. Check official terms before acting.</p>
        </div>
      </aside>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl bg-white/50 p-5"><p className="text-sm text-ink/48">{label}</p><p className="mt-2 font-black">{value}</p></div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10"><h2 className="mb-4 text-2xl font-black">{title}</h2>{children}</section>;
}
