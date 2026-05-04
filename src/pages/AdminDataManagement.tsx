import { useEffect, useState, useCallback } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ProjectForm } from "../components/admin/ProjectForm";
import { OpportunityForm } from "../components/admin/OpportunityForm";
import { ImportGithub } from "../components/admin/ImportGithub";

type Project = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  url: string;
  githubUrl: string | null;
  language: string | null;
  category: string | null;
  status: string;
  _count: { opportunities: number; evidences: number };
};

type Opportunity = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  rewardValue: string | null;
  status: string;
  project: { id: string; name: string; slug: string } | null;
};

type Tab = "projects" | "opportunities";

export function AdminDataManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; id: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showImportGithub, setShowImportGithub] = useState(false);

  const flash = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "projects") {
        const data = await apiFetch<Project[]>("/api/admin/projects");
        setProjects(data);
      } else {
        const data = await apiFetch<Opportunity[]>("/api/admin/opportunities");
        setOpportunities(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function deleteItem(type: Tab, id: string) {
    try {
      await apiFetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
      if (type === "projects") {
        setProjects((prev) => (prev || []).filter((p) => p.id !== id));
      } else {
        setOpportunities((prev) => (prev || []).filter((o) => o.id !== id));
      }
      flash("Deleted successfully");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#141414] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-mono font-bold text-xs tracking-widest uppercase">
            / Data Management
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest border border-[#141414] rounded-sm transition-colors ${
                activeTab === "projects"
                  ? "bg-[#141414] text-[#E4E3E0]"
                  : "bg-white text-[#141414] hover:bg-gray-50"
              }`}
            >
              Projects
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("opportunities")}
              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest border border-[#141414] rounded-sm transition-colors ${
                activeTab === "opportunities"
                  ? "bg-[#141414] text-[#E4E3E0]"
                  : "bg-white text-[#141414] hover:bg-gray-50"
              }`}
            >
              Opportunities
            </button>
            {activeTab === "projects" && (
              <button
                type="button"
                onClick={() => setShowImportGithub(true)}
                className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest bg-blue-600 text-white border border-[#141414] rounded-sm hover:bg-blue-700 transition-colors"
              >
                📥 Import from GitHub
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (activeTab === "projects") {
                  setShowProjectForm(true);
                } else {
                  setShowOpportunityForm(true);
                }
              }}
              className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest bg-green-600 text-white border border-[#141414] rounded-sm hover:bg-green-700 transition-colors"
            >
              + Add New
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#F2F2F0]">
        {toast && (
          <div
            role="status"
            className="fixed bottom-6 right-6 bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-sm font-mono text-[11px] uppercase tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] z-50"
          >
            {toast}
          </div>
        )}

        {loading ? (
          <LoadingState rows={4} message="Loading data..." />
        ) : error ? (
          <ErrorState title="Load failed" message={error} onRetry={fetchData} />
        ) : activeTab === "projects" ? (
          !projects || projects.length === 0 ? (
            <EmptyState title="No projects" message="No projects found in the database." />
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="border border-[#141414] bg-white shadow-[4px_4px_0_0_#141414] rounded-md overflow-hidden">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest bg-[#141414] text-[#E4E3E0] px-5 py-4 font-mono">
                  <div className="col-span-3">Project Name</div>
                  <div className="col-span-2">Language</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Stats</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="grid grid-cols-12 text-[12px] p-5 border-b border-gray-200 items-center last:border-b-0"
                  >
                    <div className="col-span-3">
                      <div className="font-bold font-serif text-[16px]">{project.name}</div>
                      <div className="text-[10px] font-mono opacity-50 mt-0.5">{project.slug}</div>
                    </div>
                    <div className="col-span-2 font-mono text-[11px]">{project.language || "—"}</div>
                    <div className="col-span-2 font-mono text-[11px]">{project.category || "—"}</div>
                    <div className="col-span-2 text-[11px] font-mono">
                      <div>{project._count.opportunities} opps</div>
                      <div className="opacity-50">{project._count.evidences} evidences</div>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`font-bold px-2 py-1 border rounded-sm text-[10px] ${
                          project.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ type: "projects", id: project.id, name: project.name })
                        }
                        className="text-red-600 hover:text-red-800 font-mono text-[10px] uppercase tracking-widest"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : !opportunities || opportunities.length === 0 ? (
          <EmptyState title="No opportunities" message="No opportunities found in the database." />
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="border border-[#141414] bg-white shadow-[4px_4px_0_0_#141414] rounded-md overflow-hidden">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest bg-[#141414] text-[#E4E3E0] px-5 py-4 font-mono">
                <div className="col-span-4">Opportunity Title</div>
                <div className="col-span-2">Project</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Reward</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="grid grid-cols-12 text-[12px] p-5 border-b border-gray-200 items-center last:border-b-0"
                >
                  <div className="col-span-4">
                    <div className="font-bold font-serif text-[16px]">{opp.title}</div>
                    <div className="text-[10px] font-mono opacity-50 mt-0.5">{opp.slug}</div>
                  </div>
                  <div className="col-span-2 font-mono text-[11px]">
                    {opp.project?.name || "—"}
                  </div>
                  <div className="col-span-2 font-mono text-[11px]">{opp.type}</div>
                  <div className="col-span-2 font-mono text-[11px]">{opp.rewardValue || "—"}</div>
                  <div className="col-span-1">
                    <span
                      className={`font-bold px-2 py-1 border rounded-sm text-[10px] ${
                        opp.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : opp.status === "CANDIDATE"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                      }`}
                    >
                      {opp.status}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ type: "opportunities", id: opp.id, name: opp.title })
                      }
                      className="text-red-600 hover:text-red-800 font-mono text-[10px] uppercase tracking-widest"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete this ${deleteTarget?.type === "projects" ? "project" : "opportunity"}?`}
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteItem(deleteTarget.type, deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />

      {showProjectForm && (
        <ProjectForm
          onSuccess={() => {
            setShowProjectForm(false);
            fetchData();
            flash("Project created successfully");
          }}
          onCancel={() => setShowProjectForm(false)}
        />
      )}

      {showOpportunityForm && (
        <OpportunityForm
          onSuccess={() => {
            setShowOpportunityForm(false);
            fetchData();
            flash("Opportunity created successfully");
          }}
          onCancel={() => setShowOpportunityForm(false)}
        />
      )}

      {showImportGithub && (
        <ImportGithub
          onSuccess={() => {
            setShowImportGithub(false);
            fetchData();
            flash("GitHub import completed");
          }}
          onCancel={() => setShowImportGithub(false)}
        />
      )}
    </div>
  );
}
