import { useState, useEffect, FormEvent } from "react";
import { apiFetch } from "@lib/api";

type OpportunityFormData = {
  slug: string;
  projectId: string;
  title: string;
  description: string;
  type: string;
  rewardValue: string;
  requirements: string;
  actionUrl: string;
  status: string;
};

type OpportunityFormProps = {
  opportunityId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const OPPORTUNITY_TYPES = [
  "OPEN_SOURCE",
  "COMPETITION",
  "POINTS_REWARD",
  "FREE_TRIAL",
];

const STATUSES = ["CANDIDATE", "PUBLISHED", "REJECTED"];

export function OpportunityForm({ opportunityId, onSuccess, onCancel }: OpportunityFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState<OpportunityFormData>({
    slug: "",
    projectId: "",
    title: "",
    description: "",
    type: "COMPETITION",
    rewardValue: "",
    requirements: "",
    actionUrl: "",
    status: "CANDIDATE",
  });

  useEffect(() => {
    // Load projects list
    apiFetch<any[]>("/api/projects")
      .then((data) => {
        setProjects(data.map((p) => ({ id: p.id, name: p.name })));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      });

    if (opportunityId) {
      // Load existing opportunity data
      apiFetch<any>(`/api/opportunities/${opportunityId}`)
        .then((opp) => {
          setFormData({
            slug: opp.slug,
            projectId: opp.projectId,
            title: opp.title,
            description: opp.description || "",
            type: opp.type,
            rewardValue: opp.rewardValue || "",
            requirements: opp.requirements || "",
            actionUrl: opp.actionUrl,
            status: opp.status,
          });
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load opportunity");
        });
    }
  }, [opportunityId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (opportunityId) {
        await apiFetch(`/api/admin/opportunities/${opportunityId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/api/admin/opportunities", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save opportunity");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0_0_#141414] rounded-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b-2 border-[#141414] bg-[#E4E3E0] px-6 py-4">
          <h2 className="font-serif font-bold text-xl">
            {opportunityId ? "Edit Opportunity" : "Add New Opportunity"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Slug *
            </label>
            <input
              type="text"
              required
              disabled={!!opportunityId}
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm font-mono text-sm disabled:bg-gray-100"
              placeholder="langchain-bounty"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Project *
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm"
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm"
              placeholder="Integration Bounty: Add Provider X"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm"
              placeholder="Open bounty for contributors to add support for emerging LLM providers."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-[#141414] px-3 py-2 rounded-sm"
              >
                {OPPORTUNITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
                Reward Value
              </label>
              <input
                type="text"
                value={formData.rewardValue}
                onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                className="w-full border border-[#141414] px-3 py-2 rounded-sm"
                placeholder="$500 USDC"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Requirements
            </label>
            <textarea
              rows={2}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm"
              placeholder="Open PR to langchain-ai/langchain"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Action URL *
            </label>
            <input
              type="url"
              required
              value={formData.actionUrl}
              onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm font-mono text-sm"
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#141414] text-[#E4E3E0] px-6 py-3 text-xs uppercase font-bold tracking-widest hover:bg-[#2a2a2a] transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] border border-[#141414] rounded-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : opportunityId ? "Update Opportunity" : "Create Opportunity"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-white border border-[#141414] text-[#141414] px-6 py-3 text-xs uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] rounded-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
