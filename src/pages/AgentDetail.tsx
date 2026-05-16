import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useApi } from "@lib/api";
import { LoadingState } from "@components/ui/LoadingState";
import { ErrorState } from "@components/ui/ErrorState";
import { EmptyState } from "@components/ui/EmptyState";
import { PaymentFlow } from "@components/PaymentFlow";

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
  const [taskArtifacts, setTaskArtifacts] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Check wallet connection status
  useEffect(() => {
    async function checkWallet() {
      try {
        const res = await fetch("/api/wallet/me");
        const data = await res.json();
        setWalletConnected(data.authenticated);
      } catch {
        setWalletConnected(false);
      }
    }
    checkWallet();
  }, []);

  // Poll task status
  useEffect(() => {
    if (!taskResult?.taskId) return;
    if (taskResult.status === "completed" || taskResult.status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/a2a/tasks/${taskResult.taskId}`);
        const data = await res.json();
        if (data.status === "completed" || data.status === "failed") {
          setTaskResult((prev) => (prev ? { ...prev, status: data.status } : prev));
          setTaskArtifacts(data.artifacts || []);
          clearInterval(interval);
        } else if (data.status === "working") {
          setTaskResult((prev) => (prev ? { ...prev, status: data.status } : prev));
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskResult?.taskId, taskResult?.status]);

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
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono text-[10px] uppercase tracking-widest font-bold opacity-70">
                Send Task (A2A)
              </h2>
              {walletConnected ? (
                <span className="text-[10px] font-mono bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Wallet Connected
                </span>
              ) : (
                <span className="text-[10px] font-mono bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-0.5">
                  Connect wallet for paid services
                </span>
              )}
            </div>
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

            {taskResult?.status === "payment_required" && taskResult.requirements && taskResult.paymentId && (
              <PaymentFlow
                paymentId={taskResult.paymentId}
                requirements={taskResult.requirements}
                onSuccess={() => {
                  setTaskResult((prev) => (prev ? { ...prev, status: "submitted" } : { status: "submitted" }));
                  setMessage("");
                }}
                onCancel={() => {
                  setTaskResult(null);
                  setTaskArtifacts([]);
                }}
              />
            )}

            {(taskResult?.status === "submitted" || taskResult?.status === "awaiting_payment") && (
              <div className="mt-4 border border-blue-300 bg-blue-50 rounded-sm p-4">
                <div className="text-sm font-mono text-blue-800 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Task {taskResult.taskId?.slice(0, 8)}… {taskResult.status === "awaiting_payment" ? "awaiting payment" : "submitted"}
                </div>
              </div>
            )}

            {taskResult?.status === "working" && (
              <div className="mt-4 border border-yellow-300 bg-yellow-50 rounded-sm p-4">
                <div className="text-sm font-mono text-yellow-800 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  Agent is working on your task…
                </div>
              </div>
            )}

            {taskResult?.status === "completed" && (
              <div className="mt-4 border border-green-300 bg-green-50 rounded-sm p-4 space-y-3">
                <div className="text-sm font-mono text-green-800 flex items-center gap-2">
                  <span>✅</span>
                  <span>Task completed! ID: {taskResult.taskId?.slice(0, 8)}…</span>
                </div>
                {taskArtifacts.map((art, i) => (
                  <div key={i} className="bg-white border border-green-200 rounded-sm p-3 text-sm whitespace-pre-wrap">
                    {art.content}
                  </div>
                ))}
              </div>
            )}

            {taskResult?.status === "failed" && (
              <div className="mt-4 border border-red-300 bg-red-50 rounded-sm p-4 text-sm text-red-800">
                <span>❌</span> Task failed
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
