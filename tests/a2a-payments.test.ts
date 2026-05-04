import "dotenv/config";
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { PrismaClient } from "@prisma/client";
import { createApp } from "../server.ts";

let prisma: PrismaClient;
let baseUrl: string;
let httpServer: import("node:http").Server;

before(async () => {
  prisma = new PrismaClient();
  const app = createApp(prisma, null);
  httpServer = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => httpServer.once("listening", () => resolve()));
  const addr = httpServer.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  await prisma.$disconnect();
});

async function api<T = unknown>(path: string, init?: RequestInit): Promise<{ status: number; body: T; headers: Headers }> {
  const res = await fetch(`${baseUrl}${path}`, init);
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body: body as T, headers: res.headers };
}

async function postJson<T = unknown>(path: string, payload?: unknown, init?: RequestInit) {
  return api<T>(path, {
    method: "POST",
    body: payload === undefined ? undefined : JSON.stringify(payload),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> || {}),
    },
  });
}

function extractCookie(headers: Headers, name: string): string | null {
  const setCookie = headers.getSetCookie?.() || [headers.get("set-cookie") || ""];
  for (const c of setCookie) {
    if (!c) continue;
    const m = c.match(new RegExp(`${name}=([^;]+)`));
    if (m) return m[1];
  }
  return null;
}

async function loginAsAdmin(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "turingscout-admin";
  const r = await postJson("/api/admin/login", { password });
  const c = extractCookie(r.headers, "ts_admin_session");
  if (!c) throw new Error(`Admin login failed (status ${r.status})`);
  return c;
}

describe("Agent discovery — public endpoints", () => {
  test("GET /api/agents returns array of active agents", async () => {
    const r = await api<{ id: string; name: string; status: string }[]>("/api/agents");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    assert.ok(r.body.length > 0, "Expected seeded agents");
    for (const a of r.body) {
      assert.equal(a.status, "ACTIVE");
    }
  });

  test("GET /api/agents/:id returns agent with services", async () => {
    const list = await api<{ id: string }[]>("/api/agents");
    assert.ok(list.body.length > 0);
    const id = list.body[0].id;
    const r = await api<{ id: string; name: string; services: unknown[] }>(`/api/agents/${id}`);
    assert.equal(r.status, 200);
    assert.ok(typeof r.body.name === "string");
    assert.ok(Array.isArray(r.body.services));
  });

  test("GET /api/agents/:id/services returns array", async () => {
    const list = await api<{ id: string }[]>("/api/agents");
    const id = list.body[0].id;
    const r = await api<unknown[]>(`/api/agents/${id}/services`);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
  });

  test("GET /api/agents/__nope__ returns 404", async () => {
    const r = await api("/api/agents/__nope__");
    assert.equal(r.status, 404);
  });
});

async function findAgentWithFreeService(): Promise<string | null> {
  const agents = await api<{ id: string }[]>("/api/agents");
  for (const a of agents.body) {
    const svcs = await api<{ priceUsd: number }[]>(`/api/agents/${a.id}/services`);
    if (svcs.body.some((s) => s.priceUsd === 0)) return a.id;
  }
  return null;
}

async function findAgentWithPaidService(): Promise<string | null> {
  const agents = await api<{ id: string }[]>("/api/agents");
  for (const a of agents.body) {
    const svcs = await api<{ priceUsd: number }[]>(`/api/agents/${a.id}/services`);
    if (svcs.body.some((s) => s.priceUsd > 0)) return a.id;
  }
  return null;
}

describe("A2A Task lifecycle", () => {
  test("POST /api/a2a/tasks/send without payment returns 202 for free service", async () => {
    const agentId = await findAgentWithFreeService();
    assert.ok(agentId, "No agent with free service found");
    const r = await postJson<{ taskId: string; status: string }>("/api/a2a/tasks/send", {
      agentId: agentId!,
      message: "Hello agent",
    });
    assert.equal(r.status, 202);
    assert.ok(r.body.taskId);
    assert.equal(r.body.status, "submitted");
  });

  test("GET /api/a2a/tasks/:id returns task status", async () => {
    const agentId = await findAgentWithFreeService();
    assert.ok(agentId, "No agent with free service found");
    const send = await postJson<{ taskId: string }>("/api/a2a/tasks/send", {
      agentId: agentId!,
      message: "Ping",
    });
    const taskId = send.body.taskId;
    const r = await api<{ id: string; status: string }>(`/api/a2a/tasks/${taskId}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.id, taskId);
    assert.ok(["submitted", "working", "completed"].includes(r.body.status));
  });

  test("POST /api/a2a/tasks/send for paid service returns 402 with requirements", async () => {
    const paidAgentId = await findAgentWithPaidService();
    if (!paidAgentId) return; // skip if none seeded
    const r = await postJson<{ error: string; paymentId: string; requirements: unknown }>("/api/a2a/tasks/send", {
      agentId: paidAgentId,
      message: "Paid request",
    });
    assert.equal(r.status, 402);
    assert.equal(r.body.error, "payment_required");
    assert.ok(r.body.paymentId);
    assert.ok(r.body.requirements);
  });

  test("POST /api/a2a/tasks/:id/cancel cancels a submitted task", async () => {
    const agentId = await findAgentWithFreeService();
    assert.ok(agentId, "No agent with free service found");
    const send = await postJson<{ taskId: string }>("/api/a2a/tasks/send", {
      agentId: agentId!,
      message: "Cancel me",
    });
    const taskId = send.body.taskId;
    const cancel = await postJson<{ success: boolean; task: { status: string } }>(`/api/a2a/tasks/${taskId}/cancel`);
    assert.equal(cancel.status, 200);
    assert.equal(cancel.body.success, true);
    assert.equal(cancel.body.task.status, "canceled");
  });

  test("POST /api/a2a/tasks/:id/cancel on completed task returns 409", async () => {
    const agentId = await findAgentWithFreeService();
    assert.ok(agentId, "No agent with free service found");
    const send = await postJson<{ taskId: string }>("/api/a2a/tasks/send", {
      agentId: agentId!,
      message: "Complete fast",
    });
    const taskId = send.body.taskId;
    // Poll until completed (up to 5s)
    for (let i = 0; i < 10; i++) {
      const t = await api<{ status: string }>(`/api/a2a/tasks/${taskId}`);
      if (t.body.status === "completed") break;
      await new Promise((r) => setTimeout(r, 500));
    }
    const cancel = await postJson(`/api/a2a/tasks/${taskId}/cancel`);
    assert.equal(cancel.status, 409);
  });
});

describe("x402 Payment lifecycle", () => {
  test("POST /api/payments/request creates a payment", async () => {
    const r = await postJson<{ paymentId: string; requirements: { chain: string; amountUsd: number } }>(
      "/api/payments/request",
      {
        chain: "solana",
        token: "USDC",
        amountUsd: 1.5,
        payerAddress: "PayerSoLanA1111111111111111111111111111111",
      },
    );
    assert.equal(r.status, 200);
    assert.ok(r.body.paymentId);
    assert.equal(r.body.requirements.chain, "solana");
    assert.equal(r.body.requirements.amountUsd, 1.5);
  });

  test("GET /api/payments/:id returns payment status", async () => {
    const created = await postJson<{ paymentId: string }>("/api/payments/request", {
      chain: "evm",
      token: "USDC",
      amountUsd: 2.0,
      payerAddress: "0xPayerEvm000000000000000000000000000000001",
    });
    const id = created.body.paymentId;
    const r = await api<{ id: string; status: string; chain: string }>(`/api/payments/${id}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.id, id);
    assert.equal(r.body.status, "PENDING");
  });

  test("POST /api/payments/verify with fake txHash fails gracefully", async () => {
    const created = await postJson<{ paymentId: string }>("/api/payments/request", {
      chain: "solana",
      token: "USDC",
      amountUsd: 0.1,
      payerAddress: "FakeSoLanA1111111111111111111111111111111",
    });
    const id = created.body.paymentId;
    const r = await postJson<{ error: string; detail?: string }>("/api/payments/verify", {
      paymentId: id,
      txHash: "fake_tx_hash_12345",
    });
    // Should fail verification but not crash
    assert.notEqual(r.status, 200);
    assert.ok(r.body.error);
  });

  test("Payment request missing required fields returns 400", async () => {
    const r = await postJson("/api/payments/request", { chain: "solana" });
    assert.equal(r.status, 400);
  });
});

describe("Admin: Agent management", () => {
  test("POST /api/admin/agents requires admin auth", async () => {
    const r = await postJson("/api/admin/agents", { name: "Test", endpointUrl: "https://test.com" });
    assert.equal(r.status, 401);
  });

  test("POST /api/admin/agents creates agent when admin", async () => {
    const cookie = await loginAsAdmin();
    const r = await postJson<{ id: string; name: string; error?: string }>(
      "/api/admin/agents",
      {
        name: "TestAdminAgent",
        description: "Created by test",
        endpointUrl: "https://test.agent/a2a",
        walletSolana: "TestSoLanA1111111111111111111111111111111",
      },
      { headers: { Cookie: `ts_admin_session=${cookie}` } },
    );
    if (r.status !== 201) {
      console.log("DEBUG /api/admin/agents response:", r.status, r.body);
    }
    assert.equal(r.status, 201);
    assert.equal(r.body.name, "TestAdminAgent");
  });

  test("POST /api/admin/agents/:id/services creates service", async () => {
    const cookie = await loginAsAdmin();
    const agent = await postJson<{ id: string }>(
      "/api/admin/agents",
      { name: "SvcAgent", endpointUrl: "https://svc.agent/a2a" },
      { headers: { Cookie: `ts_admin_session=${cookie}` } },
    );
    const r = await postJson<{ id: string; name: string; priceUsd: number }>(
      `/api/admin/agents/${agent.body.id}/services`,
      {
        name: "Premium Audit",
        description: "Deep audit",
        priceUsd: 5.0,
        endpointPath: "/audit",
        acceptedChains: ["solana", "evm"],
      },
      { headers: { Cookie: `ts_admin_session=${cookie}` } },
    );
    assert.equal(r.status, 201);
    assert.equal(r.body.name, "Premium Audit");
    assert.equal(r.body.priceUsd, 5.0);
  });
});
