import { spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const port = Number(process.env.SMOKE_PORT ?? 3100);
const base = `http://127.0.0.1:${port}`;
const prisma = new PrismaClient();
const checks = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
  checks.push(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", ...options });
  const text = await response.text();
  return { response, text };
}

async function waitForServer(child) {
  const started = Date.now();
  while (Date.now() - started < 20000) {
    if (child.exitCode !== null) throw new Error(`server exited early with ${child.exitCode}`);
    try {
      const { response } = await request("/");
      if (response.status === 200) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error("server did not become ready");
}

const server = spawn("npm", ["run", "start", "--", "-p", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(port) },
});
server.stdout.on("data", (data) => process.stdout.write(`[server] ${data}`));
server.stderr.on("data", (data) => process.stderr.write(`[server] ${data}`));

try {
  await waitForServer(server);

  for (const path of ["/", "/leaderboards/open-source-ai", "/campaigns", "/intelligence", "/methodology", "/sitemap.xml", "/robots.txt"]) {
    const { response } = await request(path);
    assert(response.status === 200, `${path} returns 200`);
  }

  const opportunitiesApi = await request("/api/opportunities?limit=3");
  assert(opportunitiesApi.response.status === 200, "/api/opportunities returns 200");
  const opportunitiesJson = JSON.parse(opportunitiesApi.text);
  assert(opportunitiesJson.items.length === 3, "/api/opportunities respects limit");
  assert(!JSON.stringify(opportunitiesJson).includes("contactEmail"), "public opportunity API does not expose private contactEmail");
  assert(!JSON.stringify(opportunitiesJson).includes("submitterIpHash"), "public opportunity API does not expose IP hashes");

  const categoryApi = await request("/api/v1/categories/open-source-ai");
  assert(categoryApi.response.status === 200, "/api/v1/categories/[category] returns 200");
  const categoryJson = JSON.parse(categoryApi.text);
  assert(categoryJson.opportunityCount >= 10, "category intelligence has at least 10 opportunities");

  const campaigns = await request("/campaigns/agent-builder-quality-campaign");
  assert(campaigns.response.status === 200, "campaign detail returns 200");
  assert(campaigns.text.includes("Sponsored disclosure"), "campaign detail shows sponsored disclosure");

  const adminNoCookie = await request("/admin");
  assert([303, 307, 308].includes(adminNoCookie.response.status), "admin redirects when unauthenticated");

  const loginBody = new URLSearchParams({ password: process.env.ADMIN_PASSWORD ?? "turingscout-admin" });
  const login = await request("/api/admin/login", { method: "POST", body: loginBody });
  const adminCookie = login.response.headers.get("set-cookie")?.split(";")[0];
  assert(Boolean(adminCookie), "admin login sets cookie");
  const adminHome = await request("/admin", { headers: { cookie: adminCookie } });
  assert(adminHome.response.status === 200, "admin dashboard opens with cookie");

  const submitBody = new URLSearchParams({ url: "https://example.com/smoke-submission", type: "correction", note: "smoke test" });
  const submission = await fetch(`${base}/api/submissions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(submitBody)) });
  const submissionJson = await submission.json();
  assert(submission.status === 200 && submissionJson.status === "received", "public submission API stores received submission");

  const authBody = new URLSearchParams({ email: "smoke@example.com", displayName: "Smoke Scout", handle: "smokescout" });
  const auth = await request("/api/auth/login", { method: "POST", body: authBody });
  const userCookie = auth.response.headers.get("set-cookie")?.split(";")[0];
  assert(Boolean(userCookie), "creator login sets user cookie");
  const me = await request("/me", { headers: { cookie: userCookie } });
  assert(me.response.status === 200, "profile page opens with user cookie");

  const reportApi = await request("/api/v1/reports/project/model-context-protocol");
  assert(reportApi.response.status === 200, "project intelligence report API returns 200");
  const reportJson = JSON.parse(reportApi.text);
  assert(reportJson.report.metrics.evidenceCount >= 1, "project report includes evidence metrics");

  const counts = {
    published: await prisma.opportunity.count({ where: { status: "published" } }),
    rawEvidence: await prisma.rawEvidence.count(),
    creatorContent: await prisma.creatorContent.count({ where: { status: "visible" } }),
    campaigns: await prisma.campaign.count({ where: { status: "published" } }),
    reports: await prisma.projectReport.count({ where: { status: "published" } }),
  };
  assert(counts.published >= 60, "database has 60+ published opportunities");
  assert(counts.rawEvidence >= 100, "database has 100+ raw evidence records");
  assert(counts.creatorContent >= 20, "database has 20+ visible creator content records");
  assert(counts.campaigns >= 1, "database has published campaigns");
  assert(counts.reports >= 1, "database has published reports");

  console.log(`\nSmoke checks passed (${checks.length})`);
  for (const check of checks) console.log(`- ${check}`);
} finally {
  await prisma.$disconnect();
  server.kill("SIGTERM");
}
