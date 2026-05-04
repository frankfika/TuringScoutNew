import { useState, FormEvent } from "react";
import { apiFetch } from "../../lib/api";

type ImportResult = {
  repo: string;
  success: boolean;
  action?: string;
  slug?: string;
  error?: string;
};

type ImportGithubProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function ImportGithub({ onSuccess, onCancel }: ImportGithubProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [repoUrls, setRepoUrls] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const repos = repoUrls
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (repos.length === 0) {
        setError("Please enter at least one GitHub repository URL");
        setLoading(false);
        return;
      }

      const response = await apiFetch<{ results: ImportResult[] }>("/api/admin/import-github", {
        method: "POST",
        body: JSON.stringify({ repos }),
      });

      setResults(response.results);

      const successCount = response.results.filter((r) => r.success).length;
      if (successCount > 0) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import repositories");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0_0_#141414] rounded-md max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b-2 border-[#141414] bg-[#E4E3E0] px-6 py-4">
          <h2 className="font-serif font-bold text-xl">Batch Import from GitHub</h2>
          <p className="text-sm opacity-70 mt-1">
            Import real project data from GitHub repositories
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          {!results && (
            <>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest mb-2 font-bold">
                  GitHub Repository URLs (one per line)
                </label>
                <textarea
                  rows={10}
                  value={repoUrls}
                  onChange={(e) => setRepoUrls(e.target.value)}
                  className="w-full border border-[#141414] px-3 py-2 rounded-sm font-mono text-sm"
                  placeholder={`https://github.com/langchain-ai/langchain
https://github.com/microsoft/autogen
https://github.com/joaomdmoura/crewAI
https://github.com/OpenInterpreter/open-interpreter`}
                />
                <p className="text-xs opacity-60 mt-2">
                  Enter GitHub repository URLs, one per line. The system will fetch real data from GitHub API.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#141414] text-[#E4E3E0] px-6 py-3 text-xs uppercase font-bold tracking-widest hover:bg-[#2a2a2a] transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] border border-[#141414] rounded-sm disabled:opacity-50"
                >
                  {loading ? "Importing..." : "Import from GitHub"}
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
            </>
          )}

          {results && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-sm text-sm">
                Import completed: {results.filter((r) => r.success).length} succeeded, {results.filter((r) => !r.success).length} failed
              </div>

              <div className="border border-[#141414] rounded-sm overflow-hidden">
                <div className="bg-[#141414] text-[#E4E3E0] px-4 py-2 text-xs font-mono uppercase tracking-widest font-bold">
                  Import Results
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-3 border-b border-gray-200 last:border-b-0 ${
                        result.success ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm truncate">{result.repo}</div>
                          {result.success && result.slug && (
                            <div className="text-xs opacity-70 mt-1">
                              {result.action === "created" ? "✓ Created" : "✓ Updated"} as {result.slug}
                            </div>
                          )}
                          {!result.success && result.error && (
                            <div className="text-xs text-red-600 mt-1">✗ {result.error}</div>
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-sm ${
                            result.success
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {result.success ? "SUCCESS" : "FAILED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-[#141414] text-[#E4E3E0] px-6 py-3 text-xs uppercase font-bold tracking-widest hover:bg-[#2a2a2a] transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] border border-[#141414] rounded-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
