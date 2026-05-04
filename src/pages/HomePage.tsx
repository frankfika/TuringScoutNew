import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { apiFetch, buildQueryString, useApi } from "../lib/api";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

type ProjectCard = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  stars: number;
  forks: number;
  kols: number;
  growth: number;
  hypeScore: number;
  isHot: boolean;
  hypeData: { name: string; hype: number }[];
  opportunityCount: number;
};

type CategoryRow = { category: string; count: number };

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

type OpportunitySummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  rewardValue: string | null;
  project: { id: string; name: string; slug: string } | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  LLM_ORCHESTRATION: "LLM Orchestration",
  DEFI_TRADING: "DeFi & Trading",
  SOCIAL_BOTS: "Social Bots",
  COMPUTER_VISION: "Computer Vision",
  REINFORCEMENT_LEARNING: "Reinforcement Learning",
  NFT_GAMING: "NFT & Gaming",
  DATA_INDEXING: "Data Indexing",
  INFRASTRUCTURE: "Infrastructure",
};

const CATEGORY_ICON: Record<string, string> = {
  LLM_ORCHESTRATION: "🧠",
  DEFI_TRADING: "💸",
  SOCIAL_BOTS: "💬",
  COMPUTER_VISION: "👁️",
  REINFORCEMENT_LEARNING: "🤖",
  NFT_GAMING: "🎮",
  DATA_INDEXING: "📊",
  INFRASTRUCTURE: "🏗️",
};

const TIMEFRAMES = [
  { id: "24h", label: "24H Hot" },
  { id: "48h", label: "48H Hot" },
  { id: "7d", label: "7 Day Trend" },
  { id: "all", label: "All Time" },
];

const FEED_POLL_MS = 10_000;

function timeAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function HomePage() {
  const [activeTag, setActiveTag] = useState<string>("ALL");
  const [activeTimeframe, setActiveTimeframe] = useState<string>("24h");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || (target?.isContentEditable ?? false);
      if (isEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const projectsPath = useMemo(() => {
    const qs = buildQueryString({
      timeframe: activeTimeframe,
      category: activeTag === "ALL" ? null : activeTag,
      search: searchQuery || null,
      limit: 60,
    });
    return `/api/projects${qs}`;
  }, [activeTag, activeTimeframe, searchQuery]);

  const projectsApi = useApi<ProjectCard[]>(projectsPath);
  const categoriesApi = useApi<CategoryRow[]>("/api/categories");
  const opportunitiesApi = useApi<OpportunitySummary[]>("/api/opportunities?limit=3");

  // Community feed: polling 10s, paused when tab hidden
  const [feedItems, setFeedItems] = useState<CommunityPost[]>([]);
  const [feedError, setFeedError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function pull() {
      try {
        const data = await apiFetch<CommunityPost[]>("/api/community/feed?limit=20");
        if (!cancelled) {
          setFeedItems(data);
          setFeedError(null);
        }
      } catch (err) {
        if (!cancelled) setFeedError(err instanceof Error ? err.message : "Feed unavailable");
      } finally {
        if (!cancelled) {
          if (document.visibilityState === "visible") {
            timer = setTimeout(pull, FEED_POLL_MS);
          }
        }
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible" && !timer) {
        pull();
      }
    }

    pull();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const projects = projectsApi.data || [];
  const categories = categoriesApi.data || [];

  const tags = useMemo(() => {
    const dynamic = categories.map((c) => ({
      id: c.category,
      label: CATEGORY_LABEL[c.category] || c.category,
      count: c.count,
    }));
    return [{ id: "ALL", label: "All", count: projects.length }, ...dynamic];
  }, [categories, projects.length]);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-10 gap-6 relative">
      {/* Hero / Search / Community Feed */}
      <div className="relative border border-[#141414] shadow-sm rounded-md overflow-hidden bg-white mb-2">
        <div className="absolute top-2 right-2 flex gap-1 z-20" aria-hidden="true">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
        </div>

        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#141414] min-h-[260px]">
          <div className="flex-1 p-6 lg:p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/50 flex flex-col justify-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold flex items-center gap-3 text-[#141414]">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              Agent Launchpad
            </h2>
            <div className="text-sm font-sans text-[#333] max-w-xl">
              The autonomous-agent radar. Discover, evaluate and back the AI frameworks the rest of the
              market hasn&apos;t noticed yet.
            </div>

            <div className="w-full max-w-md relative z-10 pt-2">
              <label htmlFor="ts-search" className="sr-only">Search projects</label>
              <input
                id="ts-search"
                ref={searchRef}
                type="search"
                placeholder="Search projects, tags, descriptions..."
                className="w-full border border-[#141414] bg-white py-2.5 pl-8 pr-3 rounded-sm text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:opacity-40 shadow-[2px_2px_0_0_#141414]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <div
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 text-sm opacity-40 font-mono font-bold pointer-events-none"
              >
                /
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono mt-2">
              <span className="opacity-60 flex items-center">Trending tags:</span>
              {tags.slice(1, 5).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setActiveTag(tag.id)}
                  className="px-2 py-0.5 border border-dashed border-gray-400 rounded-sm hover:border-[#141414] hover:bg-[#141414] hover:text-white transition-colors bg-white/50 backdrop-blur-sm text-gray-700"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-[45%] xl:w-[50%] bg-[#F8F9FA] flex flex-col relative overflow-hidden lg:border-l border-t lg:border-t-0 border-[#141414]">
            <div className="flex justify-between items-center z-10 relative bg-white border-b border-[#141414] p-3 px-4">
              <div className="font-serif text-[14px] font-bold text-[#141414] flex items-center gap-2">
                <span className="text-blue-500 text-lg">✦</span> Community Feed
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest mr-2">Live</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative min-h-[200px]">
              <div className="absolute inset-0 overflow-y-auto hidden-scrollbar p-0 flex flex-col">
                {feedError && feedItems.length === 0 ? (
                  <ErrorState
                    title="Feed unavailable"
                    message={feedError}
                  />
                ) : feedItems.length === 0 ? (
                  <EmptyState
                    title="No signals yet"
                    message="Community chatter will appear here once the radar warms up."
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
                          <div className="mt-2.5 flex items-center justify-between text-gray-400 text-[11px] font-mono">
                            {item.type === "ai_summary" ? (
                              <div className="text-[10px] font-mono bg-white border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-sm">
                                Signal: <span className="font-bold">{item.rating || "Detected"}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <span>♡ {item.likes}</span>
                                <span>↻ {item.retweets}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tag + Timeframe controls */}
      <div className="flex flex-col xl:flex-row gap-6 w-full relative z-10">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex flex-col gap-4 mb-2">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#141414] pb-4">
              <div
                role="tablist"
                aria-label="Filter projects by category"
                className="flex flex-wrap gap-2 text-[11px] uppercase tracking-widest font-bold"
              >
                {tags.map((tag) => {
                  const selected = activeTag === tag.id;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-pressed={selected}
                      onClick={() => setActiveTag(tag.id)}
                      className={`px-3 py-1.5 transition-all duration-200 border border-[#141414] rounded-sm ${
                        selected
                          ? "bg-[#141414] text-[#E4E3E0] shadow-[2px_2px_0_0_#141414]"
                          : "bg-white text-[#141414] hover:bg-gray-100"
                      }`}
                    >
                      {tag.label}
                      {tag.count !== undefined && (
                        <span className="ml-2 opacity-60 font-mono">{tag.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div
                role="tablist"
                aria-label="Time range"
                className="flex bg-[#E4E3E0] p-1 border border-[#141414] rounded-sm text-[10px] font-mono tracking-widest uppercase font-bold shrink-0"
              >
                {TIMEFRAMES.map((tf) => {
                  const selected = activeTimeframe === tf.id;
                  return (
                    <button
                      key={tf.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-pressed={selected}
                      onClick={() => setActiveTimeframe(tf.id)}
                      className={`px-3 py-1.5 transition-all rounded-sm ${
                        selected
                          ? "bg-white text-[#141414] shadow-sm"
                          : "text-gray-500 hover:text-[#141414]"
                      }`}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            role="region"
            aria-label="Project list"
            aria-busy={projectsApi.loading}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 flex-1 content-start relative z-10"
          >
            {projectsApi.loading ? (
              <div className="col-span-full">
                <LoadingState rows={4} message="Loading projects" />
              </div>
            ) : projectsApi.error ? (
              <div className="col-span-full">
                <ErrorState
                  title="Could not load projects"
                  message={projectsApi.error.message}
                  onRetry={projectsApi.refetch}
                />
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title="No projects match your filters"
                  message="Try clearing the search or switching to a different category."
                />
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  className="flex flex-col p-5 bg-white border border-[#141414] hover:shadow-[4px_4px_0_0_#141414] transition-all duration-200 cursor-pointer group rounded-md hover:-translate-y-1 hover:-translate-x-1"
                >
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-2xl border border-[#141414]"
                        aria-hidden="true"
                      >
                        {CATEGORY_ICON[project.category || ""] || "AG"}
                      </div>
                      {project.opportunityCount > 0 && (
                        <div className="flex flex-col justify-center">
                          <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-sm font-mono text-[9px] uppercase font-bold w-max mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></span>
                            Active Launch
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-wrap justify-end items-center gap-1">
                      {project.isHot && (
                        <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded-sm font-mono text-[10px] font-bold border border-orange-300 flex items-center gap-1 shadow-sm">
                          <span aria-hidden="true">🔥</span> HOT
                        </div>
                      )}
                      {project.opportunityCount > 0 && (
                        <div className="px-2 py-1 bg-green-100 text-green-800 rounded-sm font-mono text-[10px] font-bold border border-green-200">
                          {project.opportunityCount} {project.opportunityCount === 1 ? "Reward" : "Rewards"}
                        </div>
                      )}
                      <div className="px-2 py-1 bg-white text-[#141414] rounded-sm font-mono text-[10px] font-bold border border-[#141414] shadow-[1px_1px_0_0_#141414]">
                        KOLs: {project.kols}
                      </div>
                      <div className="px-2 py-1 bg-[#141414] text-[#E4E3E0] rounded-sm font-mono text-[10px] font-bold border border-[#141414] shadow-[1px_1px_0_0_#141414]">
                        Hype: {project.hypeScore}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 mt-1">
                    <div className="font-bold tracking-tight text-[18px] leading-snug font-serif flex items-center gap-2 flex-wrap">
                      {project.name}
                      {project.category && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-widest ml-1">
                          {CATEGORY_LABEL[project.category] || project.category}
                        </span>
                      )}
                    </div>
                    <div className="font-sans text-[13px] mt-2 opacity-80 line-clamp-2 leading-relaxed mb-3">
                      {project.description}
                    </div>
                    <div className="flex flex-col gap-2 mt-auto pt-2 bg-gray-50/50 p-2 rounded-sm border border-dashed border-gray-200">
                      <div className="flex justify-between items-center text-[10px] text-[#555] font-mono">
                        <div className="flex gap-3">
                          <div className="flex items-center gap-1"><span className="text-gray-400" aria-hidden="true">★</span> {project.stars.toLocaleString()}</div>
                          <div className="flex items-center gap-1"><span className="text-gray-400" aria-hidden="true">⑂</span> {project.forks.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 font-bold">
                          <span className="text-green-500" aria-hidden="true">↑</span> {project.growth}% (24h)
                        </div>
                      </div>
                      {project.hypeData.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div
                            className="text-[9px] uppercase tracking-widest font-bold opacity-40 font-mono rotate-180"
                            style={{ writingMode: "vertical-rl" }}
                          >
                            Hype
                          </div>
                          <div className="h-8 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={project.hypeData}>
                                <YAxis domain={["dataMin - 10", "dataMax + 10"]} hide />
                                <Line
                                  type="monotone"
                                  dataKey="hype"
                                  stroke="#dc2626"
                                  strokeWidth={1.5}
                                  dot={false}
                                  isAnimationActive={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#141414] flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#141414] group-hover:bg-[#141414] group-hover:text-white transition-colors -mx-5 -mb-5 p-3 px-5 rounded-b-md">
                    <span>Explore Project Insights</span>
                    <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <aside className="w-full xl:w-[320px] flex-shrink-0 flex flex-col gap-6">
          <div className="border border-[#141414] bg-white rounded-md shadow-[4px_4px_0_0_#141414] overflow-hidden flex flex-col">
            <div className="p-3 border-b border-[#141414] bg-yellow-100 flex items-center justify-between">
              <span className="font-serif text-[14px] font-bold text-yellow-900 tracking-wide flex items-center gap-2">
                <span className="bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded-sm text-[10px] uppercase tracking-widest leading-none border border-yellow-500 shadow-sm">
                  Drop
                </span>
                Active Perks &amp; Bounties
              </span>
            </div>
            <div className="bg-white p-4 text-[12px] font-sans flex flex-col gap-3 flex-1 relative">
              {opportunitiesApi.loading ? (
                <LoadingState rows={3} message="Loading opportunities" className="p-0" />
              ) : opportunitiesApi.error ? (
                <ErrorState
                  title="Could not load perks"
                  message={opportunitiesApi.error.message}
                  onRetry={opportunitiesApi.refetch}
                />
              ) : (opportunitiesApi.data || []).length === 0 ? (
                <EmptyState
                  title="No active perks"
                  message="New bounties surface as soon as the AI radar approves them."
                  className="p-6"
                />
              ) : (
                <>
                  {(opportunitiesApi.data || []).map((opp, i) => {
                    const palette =
                      i === 0
                        ? "bg-yellow-50 hover:bg-yellow-100 border-dashed"
                        : i === 1
                          ? "bg-blue-50 hover:bg-blue-100 border-dashed"
                          : "bg-white hover:bg-gray-50 border-solid";
                    return (
                      <Link
                        key={opp.id}
                        to={`/opportunities/${opp.slug}`}
                        className={`block p-3 border border-[#141414] ${palette} transition-colors rounded-sm group hover:shadow-sm`}
                      >
                        {i === 0 && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 z-10 font-mono tracking-widest">
                            HOT
                          </div>
                        )}
                        <div className="font-bold text-[#141414] text-[13px] mb-1 group-hover:underline">
                          {opp.title}
                        </div>
                        <div className="opacity-80 leading-relaxed text-[11px] line-clamp-2">
                          {opp.description}
                        </div>
                        {opp.project?.name && (
                          <div className="mt-1 text-[10px] font-mono uppercase tracking-widest opacity-50">
                            {opp.project.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
