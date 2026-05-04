import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../lib/api";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

type AgentItem = {
  id: string;
  name: string;
  description: string | null;
  version: string;
  endpointUrl: string;
  avatarUrl: string | null;
  status: string;
  walletSolana: string | null;
  walletEvm: string | null;
  walletHtx: string | null;
  capabilities: string;
  project: { slug: string; name: string } | null;
  createdAt: string;
};

export function AgentMarketplace() {
  const { data: agents, error, loading, refetch } = useApi<AgentItem[]>("/api/agents");
  const [search, setSearch] = useState("");

  const filtered = agents?.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.description ?? "").toLowerCase().includes(q) ||
      (a.project?.name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="border-b border-[#141414] bg-white px-4 md:px-8 lg:px-12 py-4 md:py-5 lg:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif font-bold text-2xl text-[#141414]">Agent Marketplace</h1>
              <p className="text-sm opacity-60 mt-1 font-mono">
                Discover A2A-enabled agents. Pay with Solana, EVM, or HTX via x402.
              </p>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 border border-[#141414] px-3 py-1 bg-[#F2F2F0]">
              A2A Protocol
            </div>
          </div>
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-[#141414] bg-white py-2 px-3 rounded-sm text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-[2px_2px_0_0_#141414]"
          />
        </div>
      </div>

      <div className="flex-1 bg-[#E4E3E0] p-4 md:p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {loading && <LoadingState message="Loading agents..." />}
          {error && <ErrorState message={error.message} onRetry={refetch} />}
          {!loading && !error && filtered?.length === 0 && (
            <EmptyState message="No agents found." />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered?.map((agent) => {
              const caps = safeJsonParse<string[]>(agent.capabilities, []);
              return (
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className="bg-white border border-[#141414] shadow-[4px_4px_0_0_#141414] rounded-sm p-5 hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#141414] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold rounded-sm text-sm">
                        {agent.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#141414] group-hover:text-blue-700 transition-colors">
                          {agent.name}
                        </h3>
                        <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                          v{agent.version} · {agent.status}
                        </div>
                      </div>
                    </div>
                    {agent.project && (
                      <span className="text-[10px] font-mono border border-[#141414] px-2 py-0.5 bg-[#F2F2F0]">
                        {agent.project.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-70 mb-3 line-clamp-2">{agent.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {caps.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-mono uppercase tracking-wider bg-[#DCDAD5] border border-[#141414] px-1.5 py-0.5"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono opacity-50">
                    {agent.walletSolana && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        SOL
                      </span>
                    )}
                    {agent.walletEvm && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        EVM
                      </span>
                    )}
                    {agent.walletHtx && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        HTX
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
