import Link from "next/link";
import { Badge } from "@/components/Badge";
import { asStringArray, formatMinutes, scoreFor } from "@/lib/format";

type CardOpportunity = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  rewardType: string | null;
  estimatedMinutes: number | null;
  difficulty: string | null;
  trustLabel: string;
  riskLabels: unknown;
  utilityLabels: unknown;
  primaryCtaLabel: string;
  organicScore: number | null;
  adminScoreOverride: number | null;
  whyRanked: string | null;
  project: { name: string; slug: string; category: string | null };
  creatorContent?: Array<{ creator?: { handle: string | null; displayName: string } | null }>;
};

export function OpportunityCard({ opportunity, rank, module = "card" }: { opportunity: CardOpportunity; rank?: number; module?: string }) {
  const risks = asStringArray(opportunity.riskLabels);
  const utility = asStringArray(opportunity.utilityLabels);
  const scout = opportunity.creatorContent?.[0]?.creator;
  const score = Math.round(scoreFor(opportunity.organicScore, opportunity.adminScoreOverride));

  return (
    <article className="glass group flex h-full flex-col rounded-[28px] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-moss">#{rank ?? score} / {opportunity.project.name}</p>
          <Link href={`/opportunities/${opportunity.slug}`} className="mt-3 block text-balance text-2xl font-black leading-tight tracking-tight group-hover:text-moss">
            {opportunity.title}
          </Link>
        </div>
        <span className="rounded-2xl bg-ink px-3 py-2 text-sm font-black text-sand">{score}</span>
      </div>

      <p className="mt-4 line-clamp-3 text-pretty leading-7 text-ink/68">{opportunity.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge value={opportunity.trustLabel} />
        {risks.slice(0, 2).map((risk) => <Badge key={risk} value={risk} />)}
        {utility.slice(0, 2).map((item) => <Badge key={item} value={item} />)}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-2xl bg-white/50 p-3"><p className="text-ink/45">Reward</p><p className="font-bold">{opportunity.rewardType?.replaceAll("_", " ") ?? "Upside"}</p></div>
        <div className="rounded-2xl bg-white/50 p-3"><p className="text-ink/45">Effort</p><p className="font-bold">{formatMinutes(opportunity.estimatedMinutes)}</p></div>
        <div className="rounded-2xl bg-white/50 p-3"><p className="text-ink/45">Level</p><p className="font-bold">{opportunity.difficulty ?? "mixed"}</p></div>
      </div>

      {opportunity.whyRanked ? <p className="mt-5 border-l-2 border-moss/40 pl-4 text-sm leading-6 text-ink/64">{opportunity.whyRanked}</p> : null}

      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-ink/55">{scout ? `Spotted by ${scout.handle ?? scout.displayName}` : "Source-backed listing"}</p>
        <Link href={`/go/opportunity/${opportunity.id}?module=${module}`} className="rounded-full bg-ember px-4 py-2 text-center text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-ink">
          {opportunity.primaryCtaLabel}
        </Link>
      </div>
    </article>
  );
}
