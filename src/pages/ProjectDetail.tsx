import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiFetch, safeJsonParse, useApi } from "@lib/api";
import { LoadingState } from "@components/ui/LoadingState";
import { ErrorState } from "@components/ui/ErrorState";
import { EmptyState } from "@components/ui/EmptyState";

type Opportunity = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  createdAt: string;
};

type AIReview = {
  id: string;
  highlights: string;
  suitableFor: string | null;
  comparisons: string;
  totalScore: number;
  dimensionScores: string;
};

type ScoreSnapshot = {
  id: string;
  calculatedAt: string;
  totalScore: number;
};

type Project = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  url: string | null;
  githubUrl: string | null;
  language: string | null;
  topics: string | null;
  category: string | null;
  stars: number;
  forks: number;
  kols: number;
  growth: number;
  hypeScore: number;
  opportunities: Opportunity[];
  aiReviews: AIReview[];
  scoreSnapshots: ScoreSnapshot[];
};

type CommunityPost = {
  id: string;
  type: string;
  author: string | null;
  handle: string | null;
  avatar: string | null;
  content: string;
  rating: string | null;
  likes: number;
  retweets: number;
  publishedAt: string;
};

const OPP_ICONS: Record<string, string> = {
  FREE_TRIAL: "🔓",
  OPEN_SOURCE: "📦",
  POINTS_REWARD: "💰",
  COMPETITION: "⚔️",
};

const FEED_POLL_MS = 15_000;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return "";
  }
}

function timeAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function ProjectDetail() {
  const { slug } = useParams();
  const projectApi = useApi<Project>(slug ? `/api/projects/${slug}` : null, [slug]);

  const [feedItems, setFeedItems] = useState<CommunityPost[]>([]);
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function pull() {
      try {
        const data = await apiFetch<CommunityPost[]>(
          `/api/community/feed?projectSlug=${encodeURIComponent(slug as string)}&limit=15`,
        );
        if (!cancelled) {
          setFeedItems(data);
          setFeedError(null);
        }
      } catch (err) {
        if (!cancelled) setFeedError(err instanceof Error ? err.message : "Feed unavailable");
      } finally {
        if (!cancelled && document.visibilityState === "visible") {
          timer = setTimeout(pull, FEED_POLL_MS);
        }
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible" && !timer) pull();
    }

    pull();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [slug]);

  if (projectApi.loading && !projectApi.data) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingState rows={6} message="Loading project intel" />
      </div>
    );
  }

  if (projectApi.error) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          title="Could not load project"
          message={projectApi.error.message}
          onRetry={projectApi.refetch}
        />
      </div>
    );
  }

  const project = projectApi.data;
  if (!project) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState title="Project not found" message="The project you requested does not exist." />
      </div>
    );
  }

  const aiReview = project.aiReviews?.[0];
  const highlights = safeJsonParse<string[]>(aiReview?.highlights ?? null, []);
  const comparisons = safeJsonParse<{ name: string; difference: string }[]>(
    aiReview?.comparisons ?? null,
    [],
  );
  const dimensions = safeJsonParse<Record<string, { score: number; explanation?: string }>>(
    aiReview?.dimensionScores ?? null,
    {},
  );
  const topics = safeJsonParse<string[]>(project.topics, []);

  const hypeChart = project.scoreSnapshots.map((s) => ({
    name: formatDate(s.calculatedAt),
    hype: Math.round(s.totalScore),
  }));

  const opportunities = project.opportunities || [];
  const launchpadOpen = opportunities.length > 0;

  return (
    <div className="p-4 md:p-6 lg:p-10 flex flex-col gap-6 pb-20 relative bg-[#F2F2F0] w-full max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="text-[11px] uppercase tracking-widest font-bold text-[#141414] border border-[#141414] px-4 py-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors bg-white rounded-full shadow-sm flex items-center w-max gap-2 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform" aria-hidden="true">←</span>
          Back to Radar
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
            Synced • Hype {project.hypeScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 auto-rows-auto">
        {/* Hero */}
        <div className="sm:col-span-12 lg:col-span-8 border border-[#141414] p-6 lg:p-10 bg-white relative shadow-[4px_4px_0_0_#141414] rounded-md flex flex-col">
          {project.category && (
            <div className="absolute top-0 right-0 bg-[#141414] text-[#E4E3E0] px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest hidden sm:block rounded-bl-md">
              {project.category}
            </div>
          )}
          <div className="flex-1 w-full max-w-2xl">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-[#141414] mb-4">
              {project.name}
            </h1>
            {project.description && (
              <p className="font-sans text-[15px] sm:text-[17px] leading-relaxed opacity-90 text-[#333] mb-6">
                {project.description}
              </p>
            )}

            {(topics.length > 0 || project.language) && (
              <div className="flex flex-wrap gap-2 mb-8">
                {project.language && (
                  <span className="px-2 py-1 bg-blue-50/50 border border-blue-200 text-blue-800 text-[10px] rounded-sm font-mono uppercase font-bold tracking-wider">
                    {project.language}
                  </span>
                )}
                {topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 bg-gray-50 border border-gray-300 text-[#141414] text-[10px] rounded-sm font-mono uppercase font-bold tracking-wider"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 font-mono text-[11px] font-bold uppercase tracking-widest">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-[#141414] px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span aria-hidden="true">🌍</span> Website
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-[#141414] bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-sm hover:opacity-90 transition-colors shadow-[2px_2px_0_0_rgba(20,20,20,0.5)]"
                >
                  <span aria-hidden="true">{"</>"}</span> GitHub
                </a>
              )}
            </div>

            {/* Real metrics */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Stars" value={project.stars.toLocaleString()} />
              <Stat label="Forks" value={project.forks.toLocaleString()} />
              <Stat label="KOLs" value={String(project.kols)} />
              <Stat label="24H Growth" value={`${project.growth}%`} accent />
            </div>

            {/* Hype Index Chart from real ScoreSnapshots */}
            {hypeChart.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-[12px] uppercase tracking-widest font-bold mb-4 font-mono text-[#141414] flex items-center gap-2">
                  <span aria-hidden="true">📈</span> Hype Index Trend
                </h3>
                <div className="h-[160px] w-full" style={{ position: "relative", left: "-15px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hypeChart}>
                      <XAxis
                        dataKey="name"
                        fontSize={10}
                        fontFamily="monospace"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#141414",
                          border: "none",
                          borderRadius: "4px",
                          color: "#E4E3E0",
                          fontSize: "12px",
                          fontFamily: "monospace",
                        }}
                        itemStyle={{ color: "#E4E3E0" }}
                        cursor={{ stroke: "rgba(0,0,0,0.1)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="hype"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#ef4444", strokeWidth: 0 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Launchpad Status */}
        <div className="sm:col-span-12 lg:col-span-4 border border-[#141414] bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-[4px_4px_0_0_#141414] rounded-md flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div
            className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest rounded-bl-sm ${
              launchpadOpen ? "bg-green-500 text-white" : "bg-gray-400 text-white"
            }`}
          >
            {launchpadOpen ? "Live" : "Inactive"}
          </div>
          <h3 className="font-serif font-bold text-xl mb-2 flex justify-center items-center gap-2">
            {launchpadOpen ? "🚀 Launchpad Open" : "🛰 Tracking"}
          </h3>
          <p className="text-[12px] font-sans opacity-80 mb-6 max-w-[220px]">
            {launchpadOpen
              ? "Active opportunities are open for participation. Pick a bounty below."
              : "No live opportunities right now. We'll surface them as soon as the radar finds new ones."}
          </p>
          <div className="flex flex-col gap-2 w-full max-w-[260px]">
            <div className="flex justify-between items-center border-b border-indigo-200 pb-2 text-[11px] font-mono">
              <span className="opacity-60">Active Opportunities</span>
              <span className="font-bold text-indigo-700 text-sm">{opportunities.length}</span>
            </div>
            <div className="flex justify-between items-center border-b border-indigo-200 pb-2 text-[11px] font-mono">
              <span className="opacity-60">Hype Score</span>
              <span className="font-bold text-indigo-700">{project.hypeScore}</span>
            </div>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-[#141414] text-[#E4E3E0] font-bold font-mono tracking-widest uppercase py-3 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-0.5 transition-all text-xs rounded-sm hover:bg-black text-center"
              >
                View on GitHub
              </a>
            )}
          </div>
        </div>

        {/* AI review */}
        {aiReview && (
          <div className="sm:col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="border border-[#141414] bg-white shadow-[4px_4px_0_0_#141414] rounded-md overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full" aria-hidden="true"></div>
                  <span className="font-bold tracking-widest text-xs uppercase font-mono">
                    TuringScout Eval
                  </span>
                </div>
                <div className="font-mono text-[10px] opacity-60 bg-white/10 px-2 py-0.5 rounded-sm">
                  Score
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-5">
                <div className="flex items-end gap-3 justify-center mb-2">
                  <div className="text-6xl font-serif font-bold tracking-tighter text-[#141414] leading-none">
                    {aiReview.totalScore}
                  </div>
                  <div className="font-mono text-sm opacity-50 font-bold uppercase tracking-widest mb-1.5">
                    / 100
                  </div>
                </div>

                {aiReview.suitableFor && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm italic font-serif text-[13px] text-[#333] text-center mb-2 shadow-sm relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 font-mono text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border border-blue-200 shadow-sm rounded-sm">
                      Target
                    </span>
                    {aiReview.suitableFor}
                  </div>
                )}

                <div className="space-y-4 flex-1">
                  {Object.entries(dimensions)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([dim, data]) => (
                      <div
                        key={dim}
                        className="flex flex-col gap-1 text-[10px] uppercase font-bold tracking-widest font-mono"
                      >
                        <div className="flex justify-between w-full text-indigo-900">
                          <span>{dim}</span>
                          <span className="text-blue-700">{data.score}</span>
                        </div>
                        <div className="w-full flex items-center flex-shrink-0">
                          <div className="h-2.5 w-full bg-[#F2F2F0] overflow-hidden border border-[#141414] rounded-full shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 border-r border-[#141414]"
                              style={{ width: `${Math.max(0, Math.min(100, data.score))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {highlights.length > 0 && (
              <div className="border border-[#141414] bg-white shadow-[4px_4px_0_0_#141414] rounded-md p-6">
                <h3 className="text-[12px] uppercase tracking-widest font-bold mb-4 font-mono text-[#141414] flex items-center gap-2">
                  <span aria-hidden="true">✨</span> Core Highlights
                </h3>
                <ul className="space-y-3">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] font-sans">
                      <span className="text-indigo-500 font-bold font-mono mt-0.5" aria-hidden="true">/</span>
                      <span className="text-[#333] leading-snug">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div
          className={`sm:col-span-12 ${aiReview ? "lg:col-span-7" : "lg:col-span-12"} flex flex-col gap-6`}
        >
          {/* Opportunities */}
          <div className="border border-[#141414] bg-white shadow-[4px_4px_0_0_#141414] rounded-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#141414] bg-[#E4E3E0] flex justify-between items-center">
              <h2 className="font-serif font-bold text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></span>
                Bounties &amp; Objectives
              </h2>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
                {opportunities.length} Active
              </span>
            </div>
            <div className="p-4 md:p-6 bg-gray-50/50">
              {opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.map((opp) => (
                    <Link
                      key={opp.id}
                      to={`/opportunities/${opp.slug}`}
                      className="flex flex-col p-4 bg-white border border-[#141414] hover:shadow-[4px_4px_0_0_#141414] transition-all duration-200 cursor-pointer rounded-md hover:-translate-y-1 hover:-translate-x-1"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div
                          className="w-8 h-8 rounded-sm bg-gray-100 flex items-center justify-center text-lg border border-[#141414]"
                          aria-hidden="true"
                        >
                          {OPP_ICONS[opp.type] || "🔥"}
                        </div>
                        <div className="text-right font-mono opacity-60 text-[9px] bg-gray-100 px-2 py-0.5 rounded-sm border border-dashed border-[#141414] uppercase">
                          {timeAgo(opp.createdAt)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold tracking-tight text-[14px] leading-snug font-serif">
                          {opp.title}
                        </div>
                        <div className="font-sans text-[12px] mt-2 opacity-70 line-clamp-2 leading-relaxed">
                          {opp.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No active bounties"
                  message="There are no public opportunities for this project yet."
                />
              )}
            </div>
          </div>

          {/* Community Feed */}
          <div className="border border-[#141414] bg-[#F8F9FA] shadow-[4px_4px_0_0_#141414] rounded-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center bg-white border-b border-[#141414] p-3 px-4">
              <div className="font-serif text-[14px] font-bold text-[#141414] flex items-center gap-2">
                <span className="text-blue-500 text-lg" aria-hidden="true">✦</span>
                Project Community
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest mr-2">
                  Live
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative min-h-[180px] max-h-[360px]">
              <div className="absolute inset-0 overflow-y-auto hidden-scrollbar p-0 flex flex-col">
                {feedError && feedItems.length === 0 ? (
                  <ErrorState title="Feed unavailable" message={feedError} />
                ) : feedItems.length === 0 ? (
                  <EmptyState
                    title="No community signals yet"
                    message="Posts about this project will surface as the radar collects them."
                    className="m-4"
                  />
                ) : (
                  feedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 border-b border-gray-200 relative ${
                        item.type === "ai_summary" ? "bg-indigo-50/30" : "bg-white"
                      }`}
                    >
                      {item.type === "ai_summary" && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" aria-hidden="true"></div>
                      )}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-bold border flex-shrink-0 ${
                            item.type === "ai_summary"
                              ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                          aria-hidden="true"
                        >
                          {item.avatar || (item.author?.[0]?.toUpperCase() ?? "·")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-[13px] text-gray-900 truncate pr-2 flex items-center gap-1.5">
                              {item.author || "Anonymous"}
                              {item.type === "ai_summary" && (
                                <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-sm font-mono tracking-widest uppercase border border-indigo-200">
                                  AI Summary
                                </span>
                              )}
                              {item.handle && (
                                <span className="opacity-50 font-normal ml-1">{item.handle}</span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono whitespace-nowrap">
                              {timeAgo(item.publishedAt)}
                            </div>
                          </div>
                          <div
                            className={`text-[13px] leading-relaxed ${
                              item.type === "ai_summary"
                                ? "text-indigo-900 font-medium"
                                : "text-gray-700 font-sans"
                            }`}
                          >
                            {item.content}
                          </div>
                          {item.type !== "ai_summary" && (
                            <div className="mt-2.5 flex items-center gap-4 text-gray-400 text-[11px] font-mono">
                              <span>♡ {item.likes}</span>
                              <span>↻ {item.retweets}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Comparisons */}
          {comparisons.length > 0 && (
            <div className="border border-[#141414] bg-white shadow-[4px_4px_0_0_#141414] rounded-md p-5 md:p-6">
              <h3 className="text-[12px] uppercase tracking-widest font-bold mb-4 font-mono text-[#141414] flex items-center gap-2">
                <span aria-hidden="true">⚔️</span> Competitive Edge
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {comparisons.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-start bg-[#F2F2F0] p-4 rounded-sm border border-gray-200/50"
                  >
                    <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase font-bold tracking-widest whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      <span className="text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-sm">
                        {project.name}
                      </span>
                      <span className="opacity-50">vs</span>
                      <span className="text-gray-700 bg-white border border-gray-300 px-1.5 py-0.5 rounded-sm">
                        {c.name}
                      </span>
                    </div>
                    <span className="opacity-80 text-[12px] font-sans leading-relaxed">{c.difference}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-[#141414] bg-white p-3 rounded-sm shadow-[2px_2px_0_0_#141414]">
      <div className="text-[10px] font-mono uppercase tracking-widest opacity-60">{label}</div>
      <div className={`font-serif font-bold text-xl ${accent ? "text-green-600" : "text-[#141414]"}`}>
        {value}
      </div>
    </div>
  );
}
