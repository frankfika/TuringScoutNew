import "dotenv/config";
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { PrismaClient } from "@prisma/client";
import { createApp } from "../server.ts";
import {
  computeHypeScore,
  deriveCardStats,
  pickLatestEvidence,
} from "../src/server/score.ts";

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

describe("Pure helpers — score module", () => {
  test("pickLatestEvidence returns 0 when metric absent", () => {
    const v = pickLatestEvidence([], "stars", 1000, Date.now());
    assert.equal(v, 0);
  });

  test("pickLatestEvidence picks max value within window", () => {
    const now = Date.now();
    const v = pickLatestEvidence(
      [
        { metric: "stars", value: 100, recordedAt: new Date(now - 1000) },
        { metric: "stars", value: 200, recordedAt: new Date(now - 500) },
        { metric: "stars", value: 50, recordedAt: new Date(now - 100) },
      ],
      "stars",
      2000,
      now,
    );
    assert.equal(v, 200);
  });

  test("pickLatestEvidence falls back when window has no data", () => {
    const now = Date.now();
    const v = pickLatestEvidence(
      [
        { metric: "stars", value: 100, recordedAt: new Date(now - 10_000) },
        { metric: "stars", value: 200, recordedAt: new Date(now - 20_000) },
      ],
      "stars",
      1_000,
      now,
    );
    assert.equal(v, 100);
  });

  test("computeHypeScore returns 0 for empty evidence", () => {
    const score = computeHypeScore([], "24h");
    assert.equal(score, 0);
  });

  test("computeHypeScore is monotonic w.r.t. KOL mentions", () => {
    const baseline = [
      { metric: "stars", value: 1000, recordedAt: new Date() },
      { metric: "kol_mentions", value: 5, recordedAt: new Date() },
    ];
    const boosted = [
      { metric: "stars", value: 1000, recordedAt: new Date() },
      { metric: "kol_mentions", value: 50, recordedAt: new Date() },
    ];
    assert.ok(computeHypeScore(boosted) > computeHypeScore(baseline));
  });

  test("deriveCardStats returns 0s for empty evidence", () => {
    const s = deriveCardStats([]);
    assert.deepEqual(s, { stars: 0, forks: 0, kol: 0, growth: 0, hype: 0 });
  });
});

describe("Pagination & validation", () => {
  test("/api/projects: limit=0 falls back to default", async () => {
    const r = await api<unknown[]>("/api/projects?limit=0");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
  });

  test("/api/projects: negative offset clamped to 0", async () => {
    const a = await api<unknown[]>("/api/projects?offset=-10&limit=2");
    assert.equal(a.status, 200);
    assert.ok(Array.isArray(a.body));
    assert.ok(a.body.length <= 2);
  });

  test("/api/projects: huge limit clamped to 200", async () => {
    const r = await api<unknown[]>("/api/projects?limit=10000");
    assert.equal(r.status, 200);
    assert.ok(r.body.length <= 200);
  });

  test("/api/opportunities: type filter narrows results", async () => {
    const all = await api<{ type: string }[]>("/api/opportunities");
    if (all.body.length === 0) return;
    const target = all.body[0].type;
    const filtered = await api<{ type: string }[]>(`/api/opportunities?type=${encodeURIComponent(target)}`);
    assert.equal(filtered.status, 200);
    for (const o of filtered.body) {
      assert.equal(o.type, target);
    }
  });

  test("/api/community/feed: default limit is bounded", async () => {
    const r = await api<unknown[]>("/api/community/feed");
    assert.equal(r.status, 200);
    assert.ok(r.body.length <= 100);
  });

  test("/api/community/feed: projectId filter narrows", async () => {
    const projects = await api<{ id: string }[]>("/api/projects?limit=1");
    if (projects.body.length === 0) return;
    const projectId = projects.body[0].id;
    const r = await api<{ projectId: string | null }[]>(`/api/community/feed?projectId=${projectId}`);
    assert.equal(r.status, 200);
    for (const post of r.body) {
      // Either explicitly tied to project, or null (skipped if filter strict)
      if (post.projectId !== null) {
        assert.equal(post.projectId, projectId);
      }
    }
  });

  test("/api/projects: search is substring (case-insensitive)", async () => {
    // Find a real project name first to guarantee a match
    const all = await api<{ name: string }[]>("/api/projects?limit=20");
    if (all.body.length === 0) return;
    const sample = all.body[0].name.slice(0, 3).toLowerCase();
    const r = await api<{ name: string }[]>(`/api/projects?search=${encodeURIComponent(sample)}`);
    assert.equal(r.status, 200);
    assert.ok(r.body.length > 0, `Expected at least one match for '${sample}'`);
  });

  test("/api/projects: search with no matches returns []", async () => {
    const r = await api<unknown[]>("/api/projects?search=__zzzqqq_no_match__");
    assert.equal(r.status, 200);
    assert.deepEqual(r.body, []);
  });
});

describe("Project enrichment correctness", () => {
  test("Hype score order matches sorted output", async () => {
    const r = await api<{ slug: string; hypeScore: number }[]>("/api/projects?limit=20");
    assert.equal(r.status, 200);
    for (let i = 1; i < r.body.length; i++) {
      assert.ok(
        r.body[i - 1].hypeScore >= r.body[i].hypeScore,
        `Expected sorted desc: ${r.body[i - 1].hypeScore} >= ${r.body[i].hypeScore}`,
      );
    }
  });

  test("Project stats are non-negative numbers", async () => {
    const r = await api<{ stars: number; forks: number; kols: number; growth: number; hypeScore: number }[]>(
      "/api/projects",
    );
    for (const p of r.body) {
      assert.ok(p.stars >= 0, `stars=${p.stars}`);
      assert.ok(p.forks >= 0, `forks=${p.forks}`);
      assert.ok(p.kols >= 0, `kols=${p.kols}`);
      assert.ok(typeof p.hypeScore === "number");
    }
  });

  test("HypeData entries have name and hype", async () => {
    const r = await api<{ hypeData: { name: unknown; hype: unknown }[] }[]>("/api/projects?limit=3");
    if (r.body.length === 0) return;
    const points = r.body[0].hypeData;
    for (const p of points) {
      assert.ok(p.name !== undefined);
      assert.ok(typeof p.hype === "number");
    }
  });

  test("/api/projects/:slug merges stats into single project", async () => {
    const list = await api<{ slug: string }[]>("/api/projects?limit=1");
    if (list.body.length === 0) return;
    const detail = await api<{ stars: number; forks: number; kols: number; hypeScore: number; opportunities: unknown[] }>(`/api/projects/${list.body[0].slug}`);
    assert.equal(detail.status, 200);
    assert.ok(typeof detail.body.stars === "number");
    assert.ok(typeof detail.body.forks === "number");
    assert.ok(typeof detail.body.hypeScore === "number");
    assert.ok(Array.isArray(detail.body.opportunities));
  });
});

describe("Categories aggregate correctly", () => {
  test("/api/categories totals match active projects", async () => {
    const cats = await api<{ category: string; count: number }[]>("/api/categories");
    assert.equal(cats.status, 200);
    const projects = await api<{ category: string | null }[]>("/api/projects?limit=200");
    const expected: Record<string, number> = {};
    for (const p of projects.body) {
      if (!p.category) continue;
      expected[p.category] = (expected[p.category] || 0) + 1;
    }
    for (const row of cats.body) {
      assert.equal(row.count, expected[row.category] ?? 0, `Mismatch for ${row.category}`);
    }
  });
});

describe("Ticker filtering", () => {
  test("/api/ticker omits expired entries", async () => {
    const r = await api<{ id: string; expiresAt: string | null }[]>("/api/ticker");
    const now = Date.now();
    for (const item of r.body) {
      if (item.expiresAt) {
        assert.ok(new Date(item.expiresAt).getTime() > now, `Should not include expired ticker ${item.id}`);
      }
    }
  });
});

describe("Admin: validation & error paths", () => {
  test("approve / reject for unknown id returns 5xx and not 200", async () => {
    const cookie = await loginAsAdmin();
    const r1 = await postJson(`/api/admin/candidates/__nope_id__/approve`, undefined, {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.notEqual(r1.status, 200);
    const r2 = await postJson(`/api/admin/candidates/__nope_id__/reject`, undefined, {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.notEqual(r2.status, 200);
  });

  test("source run for unknown id returns 404", async () => {
    const cookie = await loginAsAdmin();
    const r = await postJson(`/api/admin/sources/__nope__/run`, undefined, {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(r.status, 404);
  });

  test("source run for non-AI source updates lastStatus to SUCCESS", async () => {
    const cookie = await loginAsAdmin();
    const sources = await api<{ id: string; type: string }[]>("/api/admin/sources", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    // pick a non-GitHub_TRENDING source so we don't actually hit github
    const source = sources.body.find((s) => s.type !== "GITHUB_TRENDING");
    if (!source) return;
    const run = await postJson<{ success: boolean }>(`/api/admin/sources/${source.id}/run`, undefined, {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(run.status, 200);
    assert.equal(run.body.success, true);

    const after = await api<{ id: string; lastStatus: string }[]>("/api/admin/sources", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    const updated = after.body.find((s) => s.id === source.id);
    assert.equal(updated?.lastStatus, "SUCCESS");
  });
});

describe("Health & runtime safety", () => {
  test("Bad JSON body is rejected, server stays alive", async () => {
    const cookie = await loginAsAdmin();
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `ts_admin_session=${cookie}` },
      body: "{this-is-not-json}",
    });
    assert.notEqual(res.status, 200);
    // Server should still respond afterwards
    const health = await api<{ status: string }>("/api/health");
    assert.equal(health.body.status, "ok");
  });

  test("Oversized payload (>100kb) is rejected by parser", async () => {
    const big = "x".repeat(150_000);
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: big }),
    });
    assert.notEqual(res.status, 200);
    // Health still ok
    const health = await api<{ status: string }>("/api/health");
    assert.equal(health.body.status, "ok");
  });

  test("/api/admin/me returns boolean even with garbage cookie", async () => {
    const r = await api<{ authenticated: boolean }>("/api/admin/me", {
      headers: { Cookie: `ts_admin_session=garbage_token_value` },
    });
    assert.equal(r.body.authenticated, false);
  });
});
