import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApi } from "../lib/api";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

type AgentDetailData = {
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
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    priceUsd: number;
    acceptedChains: string;
    acceptedToken: string;
    endpointPath: string;
    status: string;
  }>;
  createdAt: string;
};

type TaskResponse = {
  taskId?: string;
  status?: string;
  error?: string;
  paymentId?: string;
  requirements?: {
    chain: string;
    token: string;
    amountUsd: number;
    amountToken: string;
    payee: string;
    expiresAt: string;
  };
};

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: agent, error, loading, refetch } = useApi<AgentDetailData>(`/api/agents/${id}`);
  const { data: services } = useApi<AgentDetailData["services"]>(`/api/agents/${id}/services`);

  const [taskLoading, setTaskLoading] = useState(false);
  const [taskResult, setTaskResult] = useState<TaskResponse | null>(null);
  const [message, setMessage] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  async function sendTask() {
    if (!message.trim() || !id) return;
    setTaskLoading(true);
    setTaskResult(null);
    try {
      const res = await fetch(`/api/a2a/tasks/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: id, message: message.trim(), serviceId: selectedService }),
      });
      const body = (await res.json()) as TaskResponse;
      if (res.status === 402) {
        setTaskResult({ ...body, status: "payment_required" });
      } else if (res.status === 202) {
        setTaskResult({ ...body, status: "submitted" });
        setMessage("");
      } else {
        setTaskResult({ error: body.error || "Unknown error", status: "error" });
      }
    } catch (e) {
      setTaskResult({ error: String(e), status: "error" });
    } finally {
      setTaskLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="border-b border-[#141414] bg-white px-4 md:px-8 lg:px-12 py-4 md:py-5 lg:py-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/agents"
            className="text-[11px] font-mono uppercase tracking-widest opacity-60 hover:opacity-100 mb-3 inline-block"
          >
            ← Back to marketplace
          </Link>
          {loading && <LoadingState message="Loading agent..." />}
          {error && <ErrorState message={error.message} onRetry={refetch} />}
          {agent && (
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold rounded-sm text-lg">
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="font-serif font-bold text-2xl text-[#141414]">{agent.name}</h1>
                <p className="text-sm opacity-60 mt-1">{agent.description}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] font-mono uppercase tracking-wider opacity-50">
                  <span>v{agent.version}</span>
                  <span className={`w-2 h-2 rounded-full ${agent.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"}`} />
                  <span>{agent.status}</span>
                  {agent.project && (
                    <Link to={`/projects/${agent.project.slug}`} className="hover:underline">
                      Project: {agent.project.name}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-[#E4E3E0] p-4 md:p-6 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Services */}
          <section>
            <h2 className="font-mono text-[10px] uppercase tracking-widest font-bold mb-3 opacity-70">Services</h2>
            {services?.length === 0 && <EmptyState message="No services published yet." />}
            <div className="space-y-3">
              {services?.map((svc) => {
                const chains = safeJsonParse<string[]>(svc.acceptedChains, []);
                return (
                  <div
                    key={svc.id}
                    className={`bg-white border border-[#141414] shadow-[3px_3px_0_0_#141414] rounded-sm p-4 ${
                      selectedService === svc.id ? "ring-2 ring-blue-300" : ""
                    }`}
                    onClick={() => setSelectedService(svc.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm">{svc.name}</h3>
                      <div className="flex items-center gap-2">
                        {svc.priceUsd > 0 ? (
                          <span className="text-[10px] font-mono font-bold bg-[#141414] text-white px-2 py-0.5">
                            ${svc.priceUsd} {svc.acceptedToken}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold bg-green-100 text-green-800 border border-green-300 px-2 py-0.5">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs opacity-60 mb-2">{svc.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono opacity-50">
                      <span>Chains:</span>
                      {chains.map((c) => (
                        <span key={c} className="border border-[#141414] px-1.5 py-0.5 bg-[#F2F2F0]">
                          {c.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interaction panel */}
          <section className="bg-white border border-[#141414] shadow-[4px_4px_0_0_#141414] rounded-sm p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-widest font-bold mb-3 opacity-70">
              Send Task (A2A)
            </h2>
            <div className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to this agent..."
                rows={3}
                className="w-full border border-[#141414] bg-white py-2 px-3 rounded-sm text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-[2px_2px_0_0_#141414] resize-none"
              />
              <button
                onClick={sendTask}
                disabled={taskLoading || !message.trim()}
                className="bg-[#141414] text-white font-mono uppercase tracking-widest font-bold py-2.5 px-5 rounded-sm border border-[#141414] shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed text-[11px]"
              >
                {taskLoading ? "Sending..." : "Send Task"}
              </button>
            </div>

            {taskResult?.status === "payment_required" && taskResult.requirements && (
              <div className="mt-4 border border-orange-300 bg-orange-50 rounded-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-orange-200 text-orange-800 px-2 py-0.5">
                    402 PAYMENT REQUIRED
                  </span>
                </div>
                <div className="text-sm space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="opacity-60">Amount</span>
                    <span className="font-bold">
                      ${taskResult.requirements.amountUsd} {taskResult.requirements.token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Chain</span>
                    <span className="font-bold">{taskResult.requirements.chain.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Payee</span>
                    <span className="font-bold truncate max-w-[200px]">{taskResult.requirements.payee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Expires</span>
                    <span>{new Date(taskResult.requirements.expiresAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <p className="text-[10px] opacity-50 mt-2">
                  Pay on-chain, then submit txHash to /api/payments/verify with paymentId{" "}
                  {taskResult.paymentId}
                </p>
              </div>
            )}

            {taskResult?.status === "submitted" && (
              <div className="mt-4 border border-green-300 bg-green-50 rounded-sm p-4">
                <div className="text-sm font-mono text-green-800">
                  Task submitted! ID: <span className="font-bold">{taskResult.taskId}</span>
                </div>
                <p className="text-[10px] opacity-50 mt-1">
                  Poll <code>/api/a2a/tasks/{taskResult.taskId}</code> for status.
                </p>
              </div>
            )}

            {taskResult?.error && (
              <div className="mt-4 border border-red-300 bg-red-50 rounded-sm p-4 text-sm text-red-800">
                {taskResult.error}
              </div>
            )}
          </section>
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
