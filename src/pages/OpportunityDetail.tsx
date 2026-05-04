import { useParams, Link } from "react-router-dom";
import { safeJsonParse, useApi } from "../lib/api";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

type AIReview = {
  id: string;
  highlights: string;
  suitableFor: string | null;
  comparisons: string;
  totalScore: number;
  dimensionScores: string;
};

type Opportunity = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  actionUrl: string;
  rewardValue: string | null;
  requirements: string | null;
  expiresAt: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
    slug: string;
  } | null;
  aiReviews: AIReview[];
};

const ICONS: Record<string, string> = {
  FREE_TRIAL: "🔓",
  OPEN_SOURCE: "📦",
  POINTS_REWARD: "💰",
  COMPETITION: "⚔️",
};

const TYPE_LABEL: Record<string, string> = {
  FREE_TRIAL: "Free Trial",
  OPEN_SOURCE: "Open Source Repo",
  POINTS_REWARD: "Points / Reward",
  COMPETITION: "Competition / Bounty",
};

function safeHostname(url: string | null | undefined): string {
  if (!url) return "—";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.length > 40 ? `${url.slice(0, 40)}…` : url;
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "Lifetime Active";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Lifetime Active";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "Lifetime Active";
  }
}

export function OpportunityDetail() {
  const { slug } = useParams();
  const oppApi = useApi<Opportunity>(slug ? `/api/opportunities/${slug}` : null, [slug]);

  if (oppApi.loading && !oppApi.data) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingState rows={5} message="Loading opportunity" />
      </div>
    );
  }

  if (oppApi.error) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          title="Could not load opportunity"
          message={oppApi.error.message}
          onRetry={oppApi.refetch}
        />
      </div>
    );
  }

  const opp = oppApi.data;
  if (!opp) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState title="Opportunity not found" message="This opportunity may have been removed." />
      </div>
    );
  }

  const aiReview = opp.aiReviews?.[0];
  const highlights = safeJsonParse<string[]>(aiReview?.highlights ?? null, []);
  const comparisons = safeJsonParse<{ name: string; difference: string }[]>(
    aiReview?.comparisons ?? null,
    [],
  );
  const dimensions = safeJsonParse<Record<string, { score: number; explanation?: string }>>(
    aiReview?.dimensionScores ?? null,
    {},
  );

  return (
    <div className="p-4 md:p-6 lg:p-10 flex flex-col gap-6 pb-20 relative bg-[#F2F2F0]">
      <div className="mb-2">
        <Link
          to="/"
          className="text-[11px] uppercase tracking-widest font-bold text-[#141414] border border-[#141414] px-4 py-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors bg-white rounded-full shadow-sm"
        >
          ← Back to Radar
        </Link>
      </div>

      <div className="border border-[#141414] p-6 sm:p-8 bg-white relative shadow-[4px_4px_0_0_#141414] rounded-md">
        <div className="absolute top-0 right-0 bg-[#141414] text-[#E4E3E0] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest hidden sm:block rounded-bl-md">
          {TYPE_LABEL[opp.type] || opp.type}
        </div>
        <div className="text-xl mb-4 flex items-center gap-4">
          <span className="text-5xl" aria-hidden="true">{ICONS[opp.type] || "🔥"}</span>
          <h1 className="font-serif font-bold text-2xl sm:text-4xl leading-tight tracking-tight text-[#141414]">
            {opp.project?.slug ? (
              <Link
                to={`/projects/${opp.project.slug}`}
                className="hover:underline decoration-2 underline-offset-4 text-blue-700"
              >
                {opp.project.name}
              </Link>
            ) : (
              opp.project?.name || "Unknown project"
            )}
            <span className="opacity-30 mx-1 font-light"> / </span>
            {opp.title}
          </h1>
        </div>
        {opp.description && (
          <p className="font-sans text-[15px] leading-relaxed border-l-4 border-blue-500 bg-blue-50 p-5 italic opacity-90 mt-6 rounded-r-md shadow-sm">
            {opp.description}
          </p>
        )}
      </div>

      {aiReview && (
        <div className="border border-[#141414] flex flex-col bg-white shadow-sm rounded-md overflow-hidden mt-2">
          <div className="flex items-center justify-between p-4 border-b border-[#141414] bg-[#E4E3E0]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 animate-pulse rounded-full" aria-hidden="true"></div>
              <span className="font-bold tracking-widest text-[#141414] text-xs uppercase font-mono">
                AI Evaluation Report
              </span>
            </div>
            <div className="font-mono text-[10px] text-[#141414] opacity-50 bg-white px-2 py-0.5 rounded-sm border border-[#141414]">
              SCORE
            </div>
          </div>

          <div className="p-5 sm:p-8 text-[13px] font-sans leading-relaxed space-y-8">
            {highlights.length > 0 && (
              <section>
                <h3 className="text-[12px] uppercase tracking-widest font-bold mb-4 font-mono border-b border-[#141414] pb-2 text-blue-800">
                  Core Highlights
                </h3>
                <ul className="space-y-3 p-5 border border-[#141414] bg-yellow-50 rounded-md">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-bold font-mono opacity-50 text-[#141414] bg-white border border-[#141414] px-1.5 rounded-sm shadow-sm">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[#141414] font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {aiReview.suitableFor && (
              <section>
                <h3 className="text-[12px] uppercase tracking-widest font-bold mb-4 font-mono border-b border-[#141414] pb-2 text-blue-800">
                  Target Audience
                </h3>
                <div className="bg-[#141414] text-white p-5 font-serif italic text-lg rounded-md shadow-inner">
                  &ldquo;{aiReview.suitableFor}&rdquo;
                </div>
              </section>
            )}

            {comparisons.length > 0 && (
              <section>
                <h3 className="text-[12px] uppercase tracking-widest font-bold mb-4 font-mono border-b border-[#141414] pb-2 text-blue-800">
                  Market Comparison
                </h3>
                <div className="space-y-4 p-5 border border-dashed border-[#141414] bg-white rounded-md">
                  {comparisons.map((c, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:gap-4 items-start bg-gray-50 p-3 rounded-sm border border-gray-200"
                    >
                      <strong className="flex-shrink-0 text-indigo-700 font-mono text-xs uppercase bg-indigo-100 px-2 py-1 rounded-sm border border-indigo-200">
                        {opp.project?.name || "This"} vs {c.name}
                      </strong>
                      <span className="opacity-90 leading-snug pt-1 sm:pt-0">{c.difference}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-6 border-b border-[#141414] pb-3">
                <h3 className="text-[12px] uppercase tracking-widest font-bold font-mono text-blue-800">
                  Evaluation Metrics
                </h3>
                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full border border-[#141414] shadow-[2px_2px_0_0_#141414]">
                  <span className="font-bold text-2xl tracking-tighter">{aiReview.totalScore}</span>
                  <span className="opacity-70 text-sm ml-1 font-mono">/100</span>
                </div>
              </div>
              <div className="space-y-6 p-6 border border-[#141414] bg-white rounded-md shadow-sm">
                {Object.entries(dimensions)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([dim, data]) => (
                    <div
                      key={dim}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-6 text-[11px] uppercase tracking-widest font-bold"
                    >
                      <div className="w-32 truncate font-mono text-indigo-900">{dim}</div>
                      <div className="flex-1 sm:w-48 flex items-center flex-shrink-0">
                        <div className="h-4 flex-1 bg-[#E4E3E0] mr-4 overflow-hidden border border-[#141414] rounded-full shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all border-r border-[#141414]"
                            style={{ width: `${Math.max(0, Math.min(100, data.score))}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-sm text-blue-700">{data.score}</span>
                      </div>
                      {data.explanation && (
                        <div
                          className="flex-1 text-[11px] normal-case tracking-normal opacity-70 font-sans line-clamp-2"
                          title={data.explanation}
                        >
                          {data.explanation}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-[12px] uppercase tracking-widest font-bold mb-4 mt-8 border-b border-[#141414] pb-2 font-mono text-blue-800">
          Action Requirements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RequirementCard label="Reward Value" value={opp.rewardValue || "—"} />
          <RequirementCard label="Requirement" value={opp.requirements || "—"} />
          <RequirementCard label="Expiration" value={formatDate(opp.expiresAt)} />
          <RequirementCard label="Target URL" value={safeHostname(opp.actionUrl)} accent />
        </div>
      </div>

      {opp.actionUrl && (
        <div className="mt-10">
          <a
            href={opp.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-600 text-white py-5 text-sm uppercase tracking-widest font-bold hover:bg-blue-700 transition-all shadow-[4px_4px_0_0_#141414] border border-[#141414] rounded-full"
          >
            Execute Action Now →
          </a>
        </div>
      )}
    </div>
  );
}

function RequirementCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white p-5 border border-[#141414] rounded-md shadow-[2px_2px_0_0_#141414]">
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2 font-mono opacity-60 text-blue-600">
        {label}
      </div>
      <div
        className={`text-sm font-bold font-serif text-lg break-words ${
          accent ? "underline underline-offset-4 decoration-2 text-indigo-600" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
