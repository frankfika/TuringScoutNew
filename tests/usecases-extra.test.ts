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
    headers: { "Content-Type": "application/json", ...(init?.headers as Record<string, string> || {}) },
    body: payload === undefined ? undefined : JSON.stringify(payload),
    ...init,
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

describe("Source run — idempotency window", () => {
  test("running source while already RUNNING within window returns 202 + skipped", async () => {
    const cookie = await loginAsAdmin();
    const sources = await api<{ id: string; type: string }[]>("/api/admin/sources", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    const source = sources.body.find((s) => s.type !== "GITHUB_TRENDING");
    if (!source) return;

    // Force the source into a RUNNING state with a recent lastRunAt
    await prisma.source.update({
      where: { id: source.id },
      data: { lastStatus: "RUNNING", lastRunAt: new Date() },
    });

    const r = await postJson<{ skipped?: boolean; message: string }>(
      `/api/admin/sources/${source.id}/run`,
      undefined,
      { headers: { Cookie: `ts_admin_session=${cookie}` } },
    );
    assert.equal(r.status, 202);
    assert.equal(r.body.skipped, true);

    // Restore so other tests can run cleanly
    await prisma.source.update({
      where: { id: source.id },
      data: { lastStatus: "SUCCESS" },
    });
  });

  test("running source after backdating lastRunAt past window proceeds normally", async () => {
    const cookie = await loginAsAdmin();
    const sources = await api<{ id: string; type: string }[]>("/api/admin/sources", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    const source = sources.body.find((s) => s.type !== "GITHUB_TRENDING");
    if (!source) return;

    // Backdate by 10 minutes so idempotency window is past
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    await prisma.source.update({
      where: { id: source.id },
      data: { lastStatus: "RUNNING", lastRunAt: tenMinAgo },
    });

    const r = await postJson<{ success: boolean; skipped?: boolean }>(
      `/api/admin/sources/${source.id}/run`,
      undefined,
      { headers: { Cookie: `ts_admin_session=${cookie}` } },
    );
    assert.equal(r.status, 200);
    assert.equal(r.body.success, true);
    assert.notEqual(r.body.skipped, true);
  });
});

describe("Ticker — priority ordering", () => {
  test("/api/ticker returns items sorted by priority desc", async () => {
    const r = await api<{ id: string; priority: number }[]>("/api/ticker");
    assert.equal(r.status, 200);
    for (let i = 1; i < r.body.length; i++) {
      assert.ok(
        r.body[i - 1].priority >= r.body[i].priority,
        `Priority not monotonic desc: ${r.body[i - 1].priority} < ${r.body[i].priority}`,
      );
    }
  });

  test("/api/ticker length capped at 50", async () => {
    const r = await api<unknown[]>("/api/ticker");
    assert.ok(r.body.length <= 50);
  });
});

describe("Project detail — snapshot chronology", () => {
  test("/api/projects/:slug scoreSnapshots are ascending by calculatedAt", async () => {
    const list = await api<{ slug: string }[]>("/api/projects?limit=1");
    if (list.body.length === 0) return;
    const slug = list.body[0].slug;
    const detail = await api<{ scoreSnapshots: { calculatedAt: string }[] }>(`/api/projects/${slug}`);
    assert.equal(detail.status, 200);
    const snaps = detail.body.scoreSnapshots;
    for (let i = 1; i < snaps.length; i++) {
      const prev = new Date(snaps[i - 1].calculatedAt).getTime();
      const cur = new Date(snaps[i].calculatedAt).getTime();
      assert.ok(prev <= cur, `Out of order at index ${i}: ${prev} > ${cur}`);
    }
  });
});

describe("Admin — session TTL expiration", () => {
  test("Backdated expiresAt invalidates a previously-good session", async () => {
    const password = process.env.ADMIN_PASSWORD || "turingscout-admin";
    const login = await postJson("/api/admin/login", { password });
    const token = extractCookie(login.headers, "ts_admin_session");
    assert.ok(token);

    // Confirm it currently works
    const okBefore = await api<unknown[]>("/api/admin/candidates", {
      headers: { Cookie: `ts_admin_session=${token}` },
    });
    assert.equal(okBefore.status, 200);

    // Force the session to be expired in DB
    await prisma.adminSession.update({
      where: { token: token as string },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const after = await api<{ error: string }>("/api/admin/candidates", {
      headers: { Cookie: `ts_admin_session=${token}` },
    });
    assert.equal(after.status, 401);

    // The auth layer should also have garbage-collected the expired row
    const remaining = await prisma.adminSession.findUnique({ where: { token: token as string } });
    assert.equal(remaining, null);
  });
});

describe("Community feed — projectSlug resolution", () => {
  test("projectSlug filter returns only posts whose projectId resolves to that slug", async () => {
    const projects = await api<{ slug: string; id: string }[]>("/api/projects?limit=1");
    if (projects.body.length === 0) return;
    const { slug, id } = projects.body[0];
    const r = await api<{ projectId: string | null }[]>(`/api/community/feed?projectSlug=${encodeURIComponent(slug)}`);
    assert.equal(r.status, 200);
    for (const post of r.body) {
      assert.equal(post.projectId, id);
    }
  });
});

describe("Concurrency — public endpoints stay healthy under parallel load", () => {
  test("Eight parallel /api/projects calls all 200", async () => {
    const calls = Array.from({ length: 8 }, () => api<unknown[]>("/api/projects?limit=20"));
    const results = await Promise.all(calls);
    for (const r of results) {
      assert.equal(r.status, 200);
      assert.ok(Array.isArray(r.body));
    }
  });

  test("Mixed parallel calls do not interfere", async () => {
    const [a, b, c, d] = await Promise.all([
      api<unknown[]>("/api/projects"),
      api<unknown[]>("/api/opportunities"),
      api<unknown[]>("/api/community/feed"),
      api<unknown[]>("/api/ticker"),
    ]);
    assert.equal(a.status, 200);
    assert.equal(b.status, 200);
    assert.equal(c.status, 200);
    assert.equal(d.status, 200);
  });
});

describe("Content negotiation — JSON responses", () => {
  test("/api/health responds with application/json", async () => {
    const r = await api("/api/health");
    const ct = r.headers.get("content-type") || "";
    assert.ok(ct.includes("application/json"), `Expected JSON content-type, got '${ct}'`);
  });

  test("/api/projects responds with application/json", async () => {
    const r = await api("/api/projects?limit=1");
    const ct = r.headers.get("content-type") || "";
    assert.ok(ct.includes("application/json"));
  });

  test("/api/opportunities responds with application/json", async () => {
    const r = await api("/api/opportunities?limit=1");
    const ct = r.headers.get("content-type") || "";
    assert.ok(ct.includes("application/json"));
  });
});
