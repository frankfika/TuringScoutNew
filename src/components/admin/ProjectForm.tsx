import { useState, useEffect, FormEvent } from "react";
import { apiFetch } from "@lib/api";

type ProjectFormData = {
  slug: string;
  name: string;
  description: string;
  url: string;
  githubUrl: string;
  language: string;
  topics: string[];
  category: string;
  status: string;
};

type ProjectFormProps = {
  projectId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const CATEGORIES = [
  "LLM_ORCHESTRATION",
  "SOCIAL_BOTS",
  "COMPUTER_VISION",
  "REINFORCEMENT_LEARNING",
  "CODE_AGENTS",
  "DEFI_TRADING",
];

const STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"];

export function ProjectForm({ projectId, onSuccess, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    slug: "",
    name: "",
    description: "",
    url: "",
    githubUrl: "",
    language: "",
    topics: [],
    category: "LLM_ORCHESTRATION",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (projectId) {
      // Load existing project data
      apiFetch<any>(`/api/projects/${projectId}`)
        .then((project) => {
          setFormData({
            slug: project.slug,
            name: project.name,
            description: project.description || "",
            url: project.url,
            githubUrl: project.githubUrl || "",
            language: project.language || "",
            topics: JSON.parse(project.topics || "[]"),
            category: project.category || "LLM_ORCHESTRATION",
            status: project.status || "ACTIVE",
          });
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load project");
        });
    }
  }, [projectId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (projectId) {
        await apiFetch(`/api/admin/projects/${projectId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/api/admin/projects", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0_0_#141414] rounded-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b-2 border-[#141414] bg-[#E4E3E0] px-6 py-4">
          <h2 className="font-serif font-bold text-xl">
            {projectId ? "Edit Project" : "Add New Project"}
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
              disabled={!!projectId}
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm font-mono text-sm disabled:bg-gray-100"
              placeholder="langchain"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-[#141414] px-3 py-2 rounded-sm"
              placeholder="LangChain"
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
              placeholder="Building applications with LLMs..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
                URL *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border border-[#141414] px-3 py-2 rounded-sm font-mono text-sm"
                placeholder="https://langchain.com"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
                GitHub URL
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full border border-[#141414] px-3 py-2 rounded-sm font-mono text-sm"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full border border-[#141414] px-3 py-2 rounded-sm"
                placeholder="Python"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-[#141414] px-3 py-2 rounded-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              value={formData.topics.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  topics: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                })
              }
              className="w-full border border-[#141414] px-3 py-2 rounded-sm font-mono text-sm"
              placeholder="llm, agents, ai"
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
              {loading ? "Saving..." : projectId ? "Update Project" : "Create Project"}
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
