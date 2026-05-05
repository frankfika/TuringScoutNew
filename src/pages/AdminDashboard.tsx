import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "@lib/api";
import { LoadingState } from "@components/ui/LoadingState";
import { ErrorState } from "@components/ui/ErrorState";
import { EmptyState } from "@components/ui/EmptyState";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { AdminDataManagement } from "./AdminDataManagement";

type Candidate = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  createdAt: string;
  project: { id: string; name: string; slug: string } | null;
  aiReviews: {
    id: string;
    totalScore: number;
    suitableFor: string | null;
  }[];
};

type Source = {
  id: string;
  name: string;
  type: string;
  schedule: string | null;
  isActive: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
};

const ICONS: Record<string, string> = {
  FREE_TRIAL: "🔓",
  OPEN_SOURCE: "📦",
  POINTS_REWARD: "💰",
  COMPETITION: "⚔️",
};

const STATUS_BADGE: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700 border-green-300",
  RUNNING: "bg-yellow-100 text-yellow-700 border-yellow-300 animate-pulse",
  FAILURE: "bg-red-100 text-red-700 border-red-300",
  PENDING: "bg-gray-100 text-gray-600 border-gray-300",
};

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "Never";
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function describeSchedule(schedule: string | null): string {
  if (!schedule) return "On-demand";
  const trimmed = schedule.trim();
  if (trimmed === "0 * * * *") return "Every hour";
  if (trimmed === "*/15 * * * *") return "Every 15 min";
  if (trimmed === "0 */6 * * *") return "Every 6 hours";
  if (trimmed === "0 0 * * *") return "Daily";
  return trimmed;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"review" | "sources" | "data">("review");

  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget] = useState<Candidate | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<"approve" | "reject" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleAuthFailure = useCallback(() => {
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const flash = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "review") {
        const data = await apiFetch<Candidate[]>("/api/admin/candidates");
        setCandidates(data);
      } else {
        const data = await apiFetch<Source[]>("/api/admin/sources");
        setSources(data);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthFailure();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [activeTab, handleAuthFailure]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setBusy = (id: string, on: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  async function approve(id: string) {
    setBusy(id, true);
    try {
      await apiFetch(`/api/admin/candidates/${id}/approve`, { method: "POST" });
      setCandidates((prev) => (prev || []).filter((c) => c.id !== id));
      flash("Approved");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) handleAuthFailure();
      else flash(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setBusy(id, false);
    }
  }

  async function reject(id: string) {
    setBusy(id, true);
    try {
      await apiFetch(`/api/admin/candidates/${id}/reject`, { method: "POST" });
      setCandidates((prev) => (prev || []).filter((c) => c.id !== id));
      flash("Rejected");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) handleAuthFailure();
      else flash(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setBusy(id, false);
    }
  }

  async function bulkApprove() {
    setBulkConfirm(null);
    const ids = (candidates || []).map((c) => c.id);
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await approve(id);
    }
  }

  async function bulkReject() {
    setBulkConfirm(null);
    const ids = (candidates || []).map((c) => c.id);
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await reject(id);
    }
  }

  async function runSource(id: string) {
    setBusy(id, true);
    try {
      await apiFetch(`/api/admin/sources/${id}/run`, { method: "POST" });
      flash("Source triggered");
      // Re-fetch to update lastStatus
      const data = await apiFetch<Source[]>("/api/admin/sources");
      setSources(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) handleAuthFailure();
      else flash(err instanceof Error ? err.message : "Run failed");
    } finally {
      setBusy(id, false);
    }
  }

  async function logout() {
    try {
      await apiFetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore
    }
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex flex-1 h-full bg-[#E4E3E0] text-[#141414] font-sans">
      <div className="w-64 border-r border-[#141414] bg-[#DCDAD5] flex flex-col z-20 relative shadow-sm">
        <div className="p-5 border-b border-[#141414] font-serif font-bold text-xl tracking-tight bg-[#D1CFCA]">
          Admin Ops
        </div>
        <nav
          role="tablist"
          aria-label="Admin sections"
          className="flex-1 text-[11px] flex flex-col font-mono font-bold uppercase tracking-widest pt-2"
        >
          {[
            { id: "review" as const, label: "01. Pending Reviews" },
            { id: "sources" as const, label: "02. Node Config" },
            { id: "data" as const, label: "03. Data Management" },
          ].map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 mx-2 rounded-md mb-1 text-left hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors border border-transparent hover:border-[#141414] ${
                  selected ? "bg-[#141414] text-[#E4E3E0] border-[#141414]" : ""
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="m-3 p-3 border border-[#141414] bg-white rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
        >
          Sign Out
        </button>
        <Link
          to="/"
          className="p-4 border-t border-[#141414] text-[10px] text-center font-mono hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors block"
        >
          ← Exit to main
        </Link>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#F2F2F0] relative z-10">
        <div className="flex items-center justify-between border-b border-[#141414] h-14 bg-white px-6">
          <div className="font-mono font-bold text-xs tracking-widest uppercase">
            / {activeTab === "review" ? "AI Evaluation Pool" : "System Nodes Config"}
          </div>
          {activeTab === "review" && candidates && candidates.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBulkConfirm("approve")}
                className="px-3 py-1.5 bg-green-600 text-white border border-[#141414] rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-green-700"
              >
                Approve all ({candidates.length})
              </button>
              <button
                type="button"
                onClick={() => setBulkConfirm("reject")}
                className="px-3 py-1.5 bg-white text-red-600 border border-red-600 rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white"
              >
                Reject all
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto relative">
          {toast && (
            <div
              role="status"
              className="fixed bottom-6 right-6 bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-sm font-mono text-[11px] uppercase tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] z-50"
            >
              {toast}
            </div>
          )}
          {activeTab === "data" ? (
            <AdminDataManagement />
          ) : loading ? (
            <LoadingState rows={4} message="Synchronizing" />
          ) : error ? (
            <ErrorState title="Load failed" message={error} onRetry={fetchData} />
          ) : activeTab === "review" ? (
            !candidates || candidates.length === 0 ? (
              <EmptyState
                title="Inbox zero"
                message="No pending objects in the evaluation pool."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {candidates.map((opp) => (
                  <div
                    key={opp.id}
                    className="border border-[#141414] bg-white p-5 shadow-[4px_4px_0_0_#141414] rounded-md flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                      <div className="flex gap-2 text-base font-bold items-start font-serif leading-tight">
                        <span className="text-2xl mt-0.5" aria-hidden="true">
                          {ICONS[opp.type] || "•"}
                        </span>
                        <span>
                          {opp.project?.name || "—"} /{" "}
                          <span className="opacity-60">{opp.title}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono opacity-50 bg-gray-100 self-start px-2 py-1 rounded-sm mb-3 border border-gray-200">
                      {timeAgo(opp.createdAt)}
                    </div>
                    {opp.description && (
                      <div className="text-[13px] mb-4 border-l-4 border-indigo-400 bg-indigo-50 px-3 py-2 italic opacity-90 flex-1 rounded-r-sm">
                        {opp.description}
                      </div>
                    )}
                    {opp.aiReviews?.[0] && (
                      <div className="bg-blue-50 p-4 text-[11px] mb-5 border border-blue-200 rounded-md">
                        <div className="font-bold text-blue-800 mb-2 font-mono flex gap-2 items-center text-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true"></span>
                          AI Score: {opp.aiReviews[0].totalScore}
                        </div>
                        {opp.aiReviews[0].suitableFor && (
                          <div className="line-clamp-2 opacity-80 text-blue-900 border-t border-blue-200/50 pt-2 font-serif italic text-[13px]">
                            &gt; {opp.aiReviews[0].suitableFor}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-3 font-mono mt-auto">
                      <button
                        type="button"
                        onClick={() => approve(opp.id)}
                        disabled={busyIds.has(opp.id)}
                        className="flex-1 bg-green-500 text-white px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-green-600 transition-colors shadow-[2px_2px_0_0_#141414] border border-[#141414] rounded-sm disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(opp)}
                        disabled={busyIds.has(opp.id)}
                        className="flex-1 bg-white border border-[#141414] text-[#141414] px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-colors shadow-[2px_2px_0_0_#141414] rounded-sm disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : !sources || sources.length === 0 ? (
            <EmptyState title="No sources" message="No data sources configured." />
          ) : (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-4">
              <div className="border border-[#141414] bg-white shadow-[4px_4px_0_0_#141414] rounded-md overflow-hidden">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest bg-[#141414] text-[#E4E3E0] px-5 py-4 font-mono">
                  <div className="col-span-4">Node Name</div>
                  <div className="col-span-3">Schedule</div>
                  <div className="col-span-3 border-l border-gray-700 pl-4">Last Sync</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>
                {sources.map((source) => {
                  const status = source.lastStatus || "PENDING";
                  return (
                    <div
                      key={source.id}
                      className="grid grid-cols-12 text-[12px] p-5 border-b border-gray-200 items-center last:border-b-0"
                    >
                      <div className="font-bold col-span-4 font-serif text-[16px]">
                        {source.name}
                        <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-0.5">
                          {source.type}
                        </div>
                      </div>
                      <div className="col-span-3 font-mono text-[11px] bg-white self-center px-2 py-1 rounded-sm w-max border border-gray-300 shadow-sm">
                        {describeSchedule(source.schedule)}
                      </div>
                      <div className="col-span-3 text-[11px] flex flex-col items-start gap-1.5 border-l border-gray-200 pl-4 font-mono">
                        <div className="text-gray-500">{timeAgo(source.lastRunAt)}</div>
                        <span
                          className={`font-bold px-1.5 py-0.5 border rounded-sm text-[10px] ${
                            STATUS_BADGE[status] || STATUS_BADGE.PENDING
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className="text-right col-span-2">
                        <button
                          type="button"
                          onClick={() => runSource(source.id)}
                          disabled={busyIds.has(source.id) || status === "RUNNING"}
                          className="bg-blue-600 text-white px-4 py-2.5 text-[10px] uppercase font-bold tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-[2px_2px_0_0_#141414] border border-[#141414] rounded-sm"
                        >
                          {status === "RUNNING" ? "Running" : "Run"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject this candidate?"
        message={
          rejectTarget
            ? `“${rejectTarget.title}” will be marked as REJECTED. This action cannot be undone from the UI.`
            : ""
        }
        confirmLabel="Reject"
        cancelLabel="Keep"
        destructive
        onCancel={() => setRejectTarget(null)}
        onConfirm={() => {
          const target = rejectTarget;
          setRejectTarget(null);
          if (target) reject(target.id);
        }}
      />

      <ConfirmDialog
        open={bulkConfirm === "approve"}
        title="Approve all pending candidates?"
        message={`${candidates?.length || 0} candidates will be published.`}
        confirmLabel="Approve all"
        onCancel={() => setBulkConfirm(null)}
        onConfirm={bulkApprove}
      />

      <ConfirmDialog
        open={bulkConfirm === "reject"}
        title="Reject all pending candidates?"
        message={`${candidates?.length || 0} candidates will be rejected.`}
        confirmLabel="Reject all"
        destructive
        onCancel={() => setBulkConfirm(null)}
        onConfirm={bulkReject}
      />
    </div>
  );
}
