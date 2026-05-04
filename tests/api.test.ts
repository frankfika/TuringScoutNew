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

async function jsonGet<T = unknown>(path: string, init?: RequestInit): Promise<{ status: number; body: T; headers: Headers }> {
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

async function jsonPost<T = unknown>(path: string, payload?: unknown, init?: RequestInit): Promise<{ status: number; body: T; headers: Headers }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers as Record<string, string> || {}) },
    body: payload === undefined ? undefined : JSON.stringify(payload),
    ...init,
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body: body as T, headers: res.headers };
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

describe("Public endpoints", () => {
  test("GET /api/health returns ok and version", async () => {
    const r = await jsonGet<{ status: string; db: string; version: string }>("/api/health");
    assert.equal(r.status, 200);
    assert.equal(r.body.status, "ok");
    assert.equal(r.body.db, "ok");
    assert.ok(r.body.version);
  });

  test("GET /api/categories returns array of {category, count}", async () => {
    const r = await jsonGet<{ category: string; count: number }[]>("/api/categories");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    if (r.body.length > 0) {
      assert.ok(typeof r.body[0].category === "string");
      assert.ok(typeof r.body[0].count === "number");
    }
  });

  test("GET /api/projects returns enriched project list", async () => {
    const r = await jsonGet<Array<{ slug: string; hypeScore: number; hypeData: unknown[]; opportunityCount: number }>>("/api/projects");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    assert.ok(r.body.length > 0, "Expect at least one seeded project");
    const p = r.body[0];
    assert.ok(typeof p.slug === "string");
    assert.ok(typeof p.hypeScore === "number");
    assert.ok(Array.isArray(p.hypeData));
    assert.ok(typeof p.opportunityCount === "number");
  });

  test("GET /api/projects supports timeframe filter", async () => {
    for (const tf of ["24h", "48h", "7d", "all"]) {
      const r = await jsonGet(`/api/projects?timeframe=${tf}`);
      assert.equal(r.status, 200);
    }
  });

  test("GET /api/projects supports search filter", async () => {
    const r = await jsonGet<{ slug: string }[]>(`/api/projects?search=lang`);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
  });

  test("GET /api/projects supports category filter", async () => {
    const cats = await jsonGet<{ category: string }[]>("/api/categories");
    if (cats.body.length === 0) return;
    const cat = cats.body[0].category;
    const r = await jsonGet<{ category: string | null }[]>(`/api/projects?category=${encodeURIComponent(cat)}`);
    assert.equal(r.status, 200);
    for (const p of r.body) {
      assert.equal(p.category, cat);
    }
  });

  test("GET /api/projects respects limit", async () => {
    const r = await jsonGet<unknown[]>(`/api/projects?limit=2`);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    assert.ok(r.body.length <= 2);
  });

  test("GET /api/projects/:slug returns project detail or 404", async () => {
    const list = await jsonGet<{ slug: string }[]>("/api/projects?limit=1");
    if (list.body.length === 0) return;
    const slug = list.body[0].slug;
    const r = await jsonGet<{ slug: string; opportunities: unknown[]; scoreSnapshots: unknown[] }>(`/api/projects/${slug}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.slug, slug);
    assert.ok(Array.isArray(r.body.opportunities));
    assert.ok(Array.isArray(r.body.scoreSnapshots));
  });

  test("GET /api/projects/:slug returns 404 for unknown slug", async () => {
    const r = await jsonGet<{ error: string }>(`/api/projects/__definitely_does_not_exist__`);
    assert.equal(r.status, 404);
    assert.ok(r.body.error);
  });

  test("GET /api/opportunities returns published opportunities", async () => {
    const r = await jsonGet<{ slug: string; status: string; project: unknown }[]>("/api/opportunities");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    for (const o of r.body) {
      assert.equal(o.status, "PUBLISHED");
    }
  });

  test("GET /api/opportunities/:slug returns 404 for unknown", async () => {
    const r = await jsonGet(`/api/opportunities/__nope__`);
    assert.equal(r.status, 404);
  });

  test("GET /api/opportunities/:slug returns detail for known slug", async () => {
    const list = await jsonGet<{ slug: string }[]>("/api/opportunities?limit=1");
    if (list.body.length === 0) return;
    const slug = list.body[0].slug;
    const r = await jsonGet<{ slug: string; project: unknown; aiReviews: unknown[] }>(`/api/opportunities/${slug}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.slug, slug);
    assert.ok(Array.isArray(r.body.aiReviews));
  });

  test("GET /api/community/feed returns posts", async () => {
    const r = await jsonGet<{ id: string; content: string; type: string }[]>("/api/community/feed?limit=5");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    assert.ok(r.body.length <= 5);
  });

  test("GET /api/community/feed returns [] for unknown projectSlug", async () => {
    const r = await jsonGet<unknown[]>("/api/community/feed?projectSlug=__nope__");
    assert.equal(r.status, 200);
    assert.deepEqual(r.body, []);
  });

  test("GET /api/ticker returns active ticker items", async () => {
    const r = await jsonGet<{ id: string; text: string }[]>("/api/ticker");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
  });
});

describe("Admin auth lifecycle", () => {
  test("Unauthenticated /api/admin/candidates returns 401", async () => {
    const r = await jsonGet("/api/admin/candidates");
    assert.equal(r.status, 401);
  });

  test("Unauthenticated /api/admin/sources returns 401", async () => {
    const r = await jsonGet("/api/admin/sources");
    assert.equal(r.status, 401);
  });

  test("Bad password rejects login", async () => {
    const r = await jsonPost("/api/admin/login", { password: "wrong" });
    assert.equal(r.status, 401);
  });

  test("Empty password rejects login", async () => {
    const r = await jsonPost("/api/admin/login", {});
    assert.equal(r.status, 401);
  });

  test("/api/admin/me reports unauthenticated when no cookie", async () => {
    const r = await jsonGet<{ authenticated: boolean }>("/api/admin/me");
    assert.equal(r.status, 200);
    assert.equal(r.body.authenticated, false);
  });

  test("Login → access protected → logout → 401", async () => {
    const password = process.env.ADMIN_PASSWORD || "turingscout-admin";
    const login = await jsonPost("/api/admin/login", { password });
    assert.equal(login.status, 200);
    const cookie = extractCookie(login.headers, "ts_admin_session");
    assert.ok(cookie, "Expect session cookie");

    // Access protected
    const candidates = await jsonGet<unknown[]>("/api/admin/candidates", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(candidates.status, 200);
    assert.ok(Array.isArray(candidates.body));

    const sources = await jsonGet<unknown[]>("/api/admin/sources", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(sources.status, 200);
    assert.ok(Array.isArray(sources.body));

    // /api/admin/me should be authenticated
    const me = await jsonGet<{ authenticated: boolean }>("/api/admin/me", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(me.body.authenticated, true);

    // Logout
    const logout = await jsonPost("/api/admin/logout", undefined, {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(logout.status, 200);

    // After logout, the session token should be invalid
    const after = await jsonGet("/api/admin/candidates", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(after.status, 401);
  });
});

describe("Admin candidate workflow", () => {
  let cookie: string;

  before(async () => {
    const password = process.env.ADMIN_PASSWORD || "turingscout-admin";
    const r = await jsonPost("/api/admin/login", { password });
    const c = extractCookie(r.headers, "ts_admin_session");
    if (!c) throw new Error("Login failed in admin workflow setup");
    cookie = c;
  });

  test("approve and reject toggles status", async () => {
    // Find a candidate (or skip)
    const list = await jsonGet<{ id: string; slug: string; status: string }[]>("/api/admin/candidates", {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(list.status, 200);
    if (list.body.length === 0) return;

    const candidate = list.body[0];
    const approve = await jsonPost<{ success: boolean; opp: { status: string } }>(`/api/admin/candidates/${candidate.id}/approve`, undefined, {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(approve.status, 200);
    assert.equal(approve.body.opp.status, "PUBLISHED");

    // Reset to candidate via direct DB mutation so we can also test reject without polluting fixtures
    await prisma.opportunity.update({ where: { id: candidate.id }, data: { status: "CANDIDATE" } });

    const reject = await jsonPost<{ success: boolean; opp: { status: string } }>(`/api/admin/candidates/${candidate.id}/reject`, undefined, {
      headers: { Cookie: `ts_admin_session=${cookie}` },
    });
    assert.equal(reject.status, 200);
    assert.equal(reject.body.opp.status, "REJECTED");

    // Restore for idempotency
    await prisma.opportunity.update({ where: { id: candidate.id }, data: { status: "CANDIDATE" } });
  });
});
