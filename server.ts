import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { PrismaClient, Prisma } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import * as cheerio from "cheerio";
import {
  computeHypeScore,
  deriveCardStats,
  type Timeframe,
} from "./src/server/score.ts";
import {
  SESSION_COOKIE_NAME,
  createSession,
  destroySession,
  isValidSession,
  makeRequireAdmin,
  makeSessionCookieOptions,
  timingSafeCompare,
} from "./src/server/auth.ts";
import { verifyOnchainPayment, getWallet } from "./src/server/blockchain.ts";
import {
  generateNonce,
  storeNonce,
  verifyAndConsumeNonce,
  verifySolanaSignature,
  verifyEvmSignature,
  createWalletSession,
  getWalletSession,
  destroyWalletSession,
  makeRequireWallet,
  makeOptionalWallet,
  SESSION_COOKIE_NAME as WALLET_SESSION_COOKIE,
  makeSessionCookieOptions as makeWalletSessionCookieOptions,
} from "./src/server/wallet-auth.ts";

const APP_VERSION = "1.0.0";
const IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000;

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function parseTimeframe(value: unknown): Timeframe {
  const t = String(value || "24h").toLowerCase();
  if (t === "24h" || t === "48h" || t === "7d" || t === "all") return t as Timeframe;
  return "24h";
}

function parseLimit(value: unknown, fallback = 50, max = 200): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

function parseOffset(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function sanitize(input: string, max = 800): string {
  return String(input)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function createApp(prisma: PrismaClient, ai: GoogleGenAI | null) {
  const app = express();

  app.use(cookieParser());
  app.use(express.json({ limit: "100kb" }));

  const requireAdmin = makeRequireAdmin(prisma);
  const requireWallet = makeRequireWallet(prisma);
  const optionalWallet = makeOptionalWallet(prisma);

  // ----- A2A Task Execution (real agent calls) -----
  async function executeA2ATask(
    taskId: string,
    message: string,
    agent: { id: string; name: string; endpointUrl: string | null; description: string | null },
    service: { name: string; endpointPath: string; description: string | null },
  ) {
    console.log(`\n🤖 [A2A] Task ${taskId.slice(0, 8)}… started for "${agent.name}" / ${service.name}`);
    console.log(`   Message: "${message.slice(0, 60)}…"`);

    await prisma.a2ATask.update({
      where: { id: taskId },
      data: { status: "working" },
    });

    let result: string;
    try {
      const url = agent.endpointUrl
        ? `${agent.endpointUrl.replace(/\/$/, "")}${service.endpointPath}`
        : null;

      if (url && url.startsWith("http")) {
        console.log(`   → Calling agent endpoint: ${url}`);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, service: service.name }),
        });
        if (response.ok) {
          const data = await response.json();
          result = data.result || data.content || data.text || JSON.stringify(data);
          console.log(`   ✅ Agent responded (${result.length} chars)`);
        } else {
          throw new Error(`Agent returned HTTP ${response.status}`);
        }
      } else if (ai) {
        console.log(`   → No agent endpoint, using Gemini fallback`);
        const prompt = `You are the AI agent "${agent.name}". ${agent.description || ""}
The user is using your service "${service.name}". ${service.description || ""}

User message: ${message}

Respond in a helpful, concise way (max 300 words).`;
        const aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: prompt,
        });
        result = aiResponse.text || "Agent processed your request.";
        console.log(`   ✅ Gemini responded (${result.length} chars)`);
      } else {
        result = `Agent ${agent.name} processed: "${message.slice(0, 80)}…"`;
        console.log(`   ⚠️  No AI available, returning placeholder`);
      }
    } catch (err: any) {
      console.error(`   ❌ Task failed:`, err.message);
      await prisma.a2ATask.update({
        where: { id: taskId },
        data: {
          status: "failed",
          artifacts: JSON.stringify([{ type: "text", content: `Error: ${err.message}` }]),
        },
      });
      return;
    }

    await prisma.a2ATask.update({
      where: { id: taskId },
      data: {
        status: "completed",
        artifacts: JSON.stringify([{ type: "text", content: result }]),
      },
    });
    console.log(`   🎉 Task ${taskId.slice(0, 8)}… completed\n`);
  }

  // ----- Public health -----
  app.get(
    "/api/health",
    asyncHandler(async (_req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: "ok", db: "ok", version: APP_VERSION });
      } catch (err) {
        res.status(503).json({ status: "degraded", db: "error", version: APP_VERSION, error: String(err) });
      }
    }),
  );

  // ----- Categories -----
  app.get(
    "/api/categories",
    asyncHandler(async (_req, res) => {
      const grouped = await prisma.project.groupBy({
        by: ["category"],
        _count: { _all: true },
        where: { status: "ACTIVE" },
      });
      res.json(
        grouped
          .filter((g) => g.category)
          .map((g) => ({ category: g.category, count: g._count._all })),
      );
    }),
  );

  // ----- Projects list -----
  app.get(
    "/api/projects",
    asyncHandler(async (req, res) => {
      const timeframe = parseTimeframe(req.query.timeframe);
      const category = typeof req.query.category === "string" && req.query.category !== "ALL" ? req.query.category : null;
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const limit = parseLimit(req.query.limit, 50, 200);
      const offset = parseOffset(req.query.offset);

      const where: Prisma.ProjectWhereInput = {
        status: "ACTIVE",
      };
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
        ];
      }

      const projects = await prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          aiReviews: { orderBy: { generatedAt: "desc" }, take: 1 },
          evidences: { orderBy: { recordedAt: "desc" }, take: 30 },
          scoreSnapshots: { orderBy: { calculatedAt: "asc" }, take: 14 },
          _count: { select: { opportunities: true } },
        },
      });

      const enriched = projects.map((p) => {
        const stats = deriveCardStats(p.evidences);
        const hypeScore = computeHypeScore(p.evidences, timeframe);
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description,
          url: p.url,
          githubUrl: p.githubUrl,
          language: p.language,
          topics: p.topics,
          category: p.category,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          aiReviews: p.aiReviews,
          stars: stats.stars,
          forks: stats.forks,
          kols: stats.kol,
          growth: stats.growth,
          hypeScore,
          isHot: hypeScore > 700,
          hypeData: p.scoreSnapshots.map((s) => ({ name: s.calculatedAt, hype: Math.round(s.totalScore) })),
          opportunityCount: p._count.opportunities,
        };
      });

      enriched.sort((a, b) => b.hypeScore - a.hypeScore);
      res.json(enriched);
    }),
  );

  // ----- Single project -----
  app.get(
    "/api/projects/:slug",
    asyncHandler(async (req, res) => {
      const project = await prisma.project.findUnique({
        where: { slug: req.params.slug },
        include: {
          opportunities: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } },
          aiReviews: { orderBy: { generatedAt: "desc" } },
          evidences: { orderBy: { recordedAt: "desc" }, take: 50 },
          scoreSnapshots: { orderBy: { calculatedAt: "asc" }, take: 30 },
        },
      });
      if (!project) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const stats = deriveCardStats(project.evidences);
      res.json({
        ...project,
        stars: stats.stars,
        forks: stats.forks,
        kols: stats.kol,
        growth: stats.growth,
        hypeScore: computeHypeScore(project.evidences, "24h"),
      });
    }),
  );

  // ----- Opportunities -----
  app.get(
    "/api/opportunities",
    asyncHandler(async (req, res) => {
      const type = typeof req.query.type === "string" ? req.query.type : null;
      const limit = parseLimit(req.query.limit, 50, 200);
      const offset = parseOffset(req.query.offset);
      const where: Prisma.OpportunityWhereInput = { status: "PUBLISHED" };
      if (type) where.type = type;
      const opps = await prisma.opportunity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: { project: true },
      });
      res.json(opps);
    }),
  );

  app.get(
    "/api/opportunities/:slug",
    asyncHandler(async (req, res) => {
      const opp = await prisma.opportunity.findUnique({
        where: { slug: req.params.slug },
        include: {
          project: { include: { opportunities: { where: { status: "PUBLISHED" } } } },
          aiReviews: { orderBy: { generatedAt: "desc" } },
        },
      });
      if (!opp) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(opp);
    }),
  );

  // ----- Community feed -----
  app.get(
    "/api/community/feed",
    asyncHandler(async (req, res) => {
      const limit = parseLimit(req.query.limit, 20, 100);
      const projectSlug = typeof req.query.projectSlug === "string" ? req.query.projectSlug : null;
      const projectIdFilter = typeof req.query.projectId === "string" ? req.query.projectId : null;

      let projectId = projectIdFilter;
      if (projectSlug && !projectId) {
        const proj = await prisma.project.findUnique({ where: { slug: projectSlug } });
        if (!proj) {
          res.json([]);
          return;
        }
        projectId = proj.id;
      }

      const posts = await prisma.communityPost.findMany({
        where: projectId ? { projectId } : {},
        orderBy: { publishedAt: "desc" },
        take: limit,
      });
      res.json(posts);
    }),
  );

  // ----- Ticker -----
  app.get(
    "/api/ticker",
    asyncHandler(async (_req, res) => {
      const now = new Date();
      const items = await prisma.tickerItem.findMany({
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 50,
      });
      res.json(items);
    }),
  );

  // ----- Wallet auth (Blockchain Login) -----
  app.post(
    "/api/wallet/nonce",
    asyncHandler(async (req, res) => {
      const { walletAddress, chain } = req.body || {};
      if (!walletAddress || !chain) {
        res.status(400).json({ error: "walletAddress and chain required" });
        return;
      }
      const nonce = generateNonce();
      const message = `Sign this message to authenticate with TuringScout.\n\nWallet: ${walletAddress}\nChain: ${chain}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
      await storeNonce(prisma, walletAddress, chain, nonce, message);
      res.json({ nonce, message });
    }),
  );

  app.post(
    "/api/wallet/login",
    asyncHandler(async (req, res) => {
      const { walletAddress, chain, signature, message } = req.body || {};
      if (!walletAddress || !chain || !signature || !message) {
        res.status(400).json({ error: "walletAddress, chain, signature, and message required" });
        return;
      }

      // Extract nonce from signed message and verify it
      const nonceMatch = message.match(/Nonce: ([a-f0-9]{64})/);
      const nonce = nonceMatch ? nonceMatch[1] : null;
      if (!nonce) {
        res.status(400).json({ error: "nonce_missing_from_message" });
        return;
      }
      const nonceCheck = await verifyAndConsumeNonce(prisma, walletAddress, chain, nonce);
      if (!nonceCheck.ok) {
        res.status(401).json({ error: nonceCheck.error || "invalid_nonce" });
        return;
      }

      let verified = false;
      if (chain === "solana") {
        verified = verifySolanaSignature(message, signature, walletAddress);
      } else if (chain === "evm" || chain === "base" || chain === "ethereum" || chain === "polygon" || chain === "bnb") {
        verified = await verifyEvmSignature(message, signature, walletAddress);
      } else {
        res.status(400).json({ error: `Unsupported chain: ${chain}` });
        return;
      }

      if (!verified) {
        res.status(401).json({ error: "invalid_signature" });
        return;
      }

      const { token, expiresAt } = await createWalletSession(prisma, walletAddress, chain);
      res.cookie(WALLET_SESSION_COOKIE, token, makeWalletSessionCookieOptions(expiresAt));
      res.json({ ok: true, walletAddress, chain });
    }),
  );

  app.post(
    "/api/wallet/logout",
    asyncHandler(async (req, res) => {
      const token = req.cookies?.[WALLET_SESSION_COOKIE];
      await destroyWalletSession(prisma, token);
      res.clearCookie(WALLET_SESSION_COOKIE, { path: "/" });
      res.json({ ok: true });
    }),
  );

  app.get(
    "/api/wallet/me",
    asyncHandler(async (req, res) => {
      const session = await getWalletSession(prisma, req.cookies?.[WALLET_SESSION_COOKIE]);
      if (!session) {
        res.json({ authenticated: false });
        return;
      }
      res.json({ authenticated: true, walletAddress: session.walletAddress, chain: session.chain });
    }),
  );

  // ----- Admin auth -----
  app.post(
    "/api/admin/login",
    asyncHandler(async (req, res) => {
      const password = String(req.body?.password || "");
      const expected = process.env.ADMIN_PASSWORD || "";
      if (!expected || !password || !timingSafeCompare(password, expected)) {
        res.status(401).json({ error: "invalid_credentials" });
        return;
      }
      const { token, expiresAt } = await createSession(prisma);
      res.cookie(SESSION_COOKIE_NAME, token, makeSessionCookieOptions(expiresAt));
      res.json({ ok: true });
    }),
  );

  app.post(
    "/api/admin/logout",
    asyncHandler(async (req, res) => {
      const token = req.cookies?.[SESSION_COOKIE_NAME];
      await destroySession(prisma, token);
      res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
      res.json({ ok: true });
    }),
  );

  app.get(
    "/api/admin/me",
    asyncHandler(async (req, res) => {
      const ok = await isValidSession(prisma, req.cookies?.[SESSION_COOKIE_NAME]);
      res.json({ authenticated: ok });
    }),
  );

  // ----- Admin candidates -----
  app.get(
    "/api/admin/candidates",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const candidates = await prisma.opportunity.findMany({
        where: { status: "CANDIDATE" },
        orderBy: { createdAt: "desc" },
        include: { project: true, aiReviews: { orderBy: { generatedAt: "desc" }, take: 1 } },
      });
      res.json(candidates);
    }),
  );

  app.post(
    "/api/admin/candidates/:id/approve",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const opp = await prisma.opportunity.update({
        where: { id: req.params.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      res.json({ success: true, opp });
    }),
  );

  app.post(
    "/api/admin/candidates/:id/reject",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const opp = await prisma.opportunity.update({
        where: { id: req.params.id },
        data: { status: "REJECTED" },
      });
      res.json({ success: true, opp });
    }),
  );

  // ----- Admin sources -----
  app.get(
    "/api/admin/sources",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const sources = await prisma.source.findMany({ orderBy: { createdAt: "asc" } });
      res.json(sources);
    }),
  );

  app.post(
    "/api/admin/sources/:id/run",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const source = await prisma.source.findUnique({ where: { id: req.params.id } });
      if (!source) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      // Idempotency: if last run was within window AND running/success, skip
      if (source.lastRunAt) {
        const sinceLast = Date.now() - source.lastRunAt.getTime();
        if (sinceLast < IDEMPOTENCY_WINDOW_MS && source.lastStatus === "RUNNING") {
          res.status(202).json({ success: true, message: "Already running", skipped: true });
          return;
        }
      }

      await prisma.source.update({
        where: { id: req.params.id },
        data: { lastRunAt: new Date(), lastStatus: "RUNNING" },
      });

      if (source.type === "GITHUB_TRENDING" && ai) {
        runGithubScraper(prisma, ai, source.id).catch((err) => console.error("scraper error:", err));
      } else {
        await prisma.source.update({
          where: { id: source.id },
          data: { lastStatus: "SUCCESS" },
        });
      }

      res.json({ success: true, message: "Triggered successfully" });
    }),
  );

  // ----- Admin data management -----
  // Projects CRUD
  app.get(
    "/api/admin/projects",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          opportunities: { select: { id: true, title: true, status: true } },
          _count: { select: { opportunities: true, evidences: true } },
        },
      });
      res.json(projects);
    }),
  );

  app.post(
    "/api/admin/projects",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { slug, name, description, url, githubUrl, language, topics, category } = req.body;
      const project = await prisma.project.create({
        data: {
          slug,
          name,
          description,
          url,
          githubUrl,
          language,
          topics: JSON.stringify(topics || []),
          category,
          status: "ACTIVE",
          publishedAt: new Date(),
        },
      });
      res.json(project);
    }),
  );

  app.put(
    "/api/admin/projects/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { name, description, url, githubUrl, language, topics, category, status } = req.body;
      const project = await prisma.project.update({
        where: { id: req.params.id },
        data: {
          name,
          description,
          url,
          githubUrl,
          language,
          topics: topics ? JSON.stringify(topics) : undefined,
          category,
          status,
        },
      });
      res.json(project);
    }),
  );

  app.delete(
    "/api/admin/projects/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      await prisma.project.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    }),
  );

  // Opportunities CRUD
  app.get(
    "/api/admin/opportunities",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const opportunities = await prisma.opportunity.findMany({
        orderBy: { createdAt: "desc" },
        include: { project: { select: { id: true, name: true, slug: true } } },
      });
      res.json(opportunities);
    }),
  );

  app.post(
    "/api/admin/opportunities",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { slug, projectId, title, description, type, rewardValue, requirements, actionUrl, status } = req.body;
      const opportunity = await prisma.opportunity.create({
        data: {
          slug,
          projectId,
          title,
          description,
          type,
          rewardValue,
          requirements,
          actionUrl,
          status: status || "CANDIDATE",
          publishedAt: status === "PUBLISHED" ? new Date() : null,
        },
      });
      res.json(opportunity);
    }),
  );

  app.put(
    "/api/admin/opportunities/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { title, description, type, rewardValue, requirements, actionUrl, status } = req.body;
      const opportunity = await prisma.opportunity.update({
        where: { id: req.params.id },
        data: {
          title,
          description,
          type,
          rewardValue,
          requirements,
          actionUrl,
          status,
          publishedAt: status === "PUBLISHED" ? new Date() : undefined,
        },
      });
      res.json(opportunity);
    }),
  );

  app.delete(
    "/api/admin/opportunities/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      await prisma.opportunity.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    }),
  );

  // Batch import from GitHub
  app.post(
    "/api/admin/import-github",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { repos } = req.body; // Array of GitHub repo URLs or owner/repo strings
      if (!Array.isArray(repos) || repos.length === 0) {
        res.status(400).json({ error: "repos array is required" });
        return;
      }

      const results = [];
      for (const repo of repos) {
        try {
          // Parse GitHub URL or owner/repo string
          const match = repo.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
          if (!match) {
            results.push({ repo, success: false, error: "Invalid GitHub URL" });
            continue;
          }
          const [, owner, name] = match;

          // Fetch from GitHub API
          const response = await fetch(`https://api.github.com/repos/${owner}/${name}`);
          if (!response.ok) {
            results.push({ repo, success: false, error: `GitHub API error: ${response.status}` });
            continue;
          }

          const data = await response.json();
          const slug = data.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");

          // Check if project exists
          const existing = await prisma.project.findUnique({ where: { slug } });

          if (existing) {
            // Update existing project
            await prisma.project.update({
              where: { slug },
              data: {
                name: data.name,
                description: data.description || "",
                url: data.homepage || data.html_url,
                githubUrl: data.html_url,
                language: data.language,
                topics: JSON.stringify(data.topics || []),
                lastSeenAt: new Date(),
              },
            });

            // Add evidence
            await prisma.evidence.create({
              data: {
                projectId: existing.id,
                metric: "stars",
                value: data.stargazers_count,
                recordedAt: new Date(),
              },
            });

            await prisma.evidence.create({
              data: {
                projectId: existing.id,
                metric: "forks",
                value: data.forks_count,
                recordedAt: new Date(),
              },
            });

            results.push({ repo, success: true, action: "updated", slug });
          } else {
            // Create new project
            const project = await prisma.project.create({
              data: {
                slug,
                name: data.name,
                description: data.description || "",
                url: data.homepage || data.html_url,
                githubUrl: data.html_url,
                language: data.language,
                topics: JSON.stringify(data.topics || []),
                category: "LLM_ORCHESTRATION", // Default category
                status: "ACTIVE",
                publishedAt: new Date(),
              },
            });

            // Add evidence
            await prisma.evidence.create({
              data: {
                projectId: project.id,
                metric: "stars",
                value: data.stargazers_count,
                recordedAt: new Date(),
              },
            });

            await prisma.evidence.create({
              data: {
                projectId: project.id,
                metric: "forks",
                value: data.forks_count,
                recordedAt: new Date(),
              },
            });

            results.push({ repo, success: true, action: "created", slug });
          }
        } catch (err) {
          results.push({ repo, success: false, error: err instanceof Error ? err.message : "Unknown error" });
        }
      }

      res.json({ results });
    }),
  );

  // ═══════════════════════════════════════════════════════════════════════
  // A2A Agent Protocol + x402 Payments
  // ═══════════════════════════════════════════════════════════════════════

  // ----- Public Agent discovery -----
  app.get(
    "/api/agents",
    asyncHandler(async (_req, res) => {
      const agents = await prisma.agentCard.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { slug: true, name: true } } },
      });
      res.json(agents);
    }),
  );

  app.get(
    "/api/agents/:id",
    asyncHandler(async (req, res) => {
      const agent = await prisma.agentCard.findUnique({
        where: { id: req.params.id },
        include: {
          project: { select: { slug: true, name: true } },
          services: { where: { status: "ACTIVE" } },
        },
      });
      if (!agent) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(agent);
    }),
  );

  app.get(
    "/api/agents/:id/services",
    asyncHandler(async (req, res) => {
      const services = await prisma.agentService.findMany({
        where: { agentId: req.params.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      });
      res.json(services);
    }),
  );

  // ----- A2A Task lifecycle -----
  app.post(
    "/api/a2a/tasks/send",
    optionalWallet,
    asyncHandler(async (req, res) => {
      const { agentId, message, serviceId } = req.body || {};
      if (!agentId || typeof message !== "string") {
        res.status(400).json({ error: "agentId and message required" });
        return;
      }

      // Get wallet session if available
      const wallet = (req as any).wallet as { walletAddress: string; chain: string } | undefined;

      const agent = await prisma.agentCard.findUnique({
        where: { id: agentId },
        include: { services: true },
      });
      if (!agent) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }

      // Pick target service: explicit serviceId > free service > first paid service
      let targetService = serviceId
        ? agent.services.find((s) => s.id === serviceId)
        : agent.services.find((s) => s.priceUsd === 0);
      if (!targetService && !serviceId) {
        targetService = agent.services.find((s) => s.priceUsd > 0);
      }
      if (!targetService) {
        res.status(404).json({ error: "Service not found" });
        return;
      }

      // If target service is paid, return 402 with payment requirements
      if (targetService.priceUsd > 0) {
        // Prefer user's wallet chain, fallback to service's accepted chains
        const acceptedChains = JSON.parse(targetService.acceptedChains);
        const chain = wallet && acceptedChains.includes(wallet.chain)
          ? wallet.chain
          : acceptedChains[0] || "solana";

        const payee = getWallet(chain);
        const amountToken = String(Math.round(targetService.priceUsd * 1_000_000)); // 6 decimals
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

        // Create task first (awaiting payment)
        const task = await prisma.a2ATask.create({
          data: {
            agentId,
            status: "awaiting_payment",
            messages: JSON.stringify([{ role: "user", parts: [{ text: message }] }]),
          },
        });

        const payment = await prisma.paymentRequest.create({
          data: {
            taskId: task.id,
            payerAddress: wallet?.walletAddress || "pending",
            payeeAddress: payee,
            chain,
            token: targetService.acceptedToken,
            amountUsd: targetService.priceUsd,
            amountToken,
            status: "PENDING",
            expiresAt,
          },
        });

        // x402-style 402 response
        res.status(402).json({
          error: "payment_required",
          paymentId: payment.id,
          taskId: task.id,
          requirements: {
            chain,
            token: targetService.acceptedToken,
            amountUsd: targetService.priceUsd,
            amountToken,
            payee,
            expiresAt,
          },
          a2a: {
            agentId: agent.id,
            agentName: agent.name,
            service: targetService.name,
          },
        });
        return;
      }

      // Free service — create task and execute immediately
      const task = await prisma.a2ATask.create({
        data: {
          agentId,
          status: "submitted",
          messages: JSON.stringify([{ role: "user", parts: [{ text: message }] }]),
        },
      });

      // Execute asynchronously (real agent call or Gemini fallback)
      executeA2ATask(task.id, message, agent, targetService).catch(console.error);

      res.status(202).json({ taskId: task.id, status: "submitted" });
    }),
  );

  app.get(
    "/api/a2a/tasks/:id",
    asyncHandler(async (req, res) => {
      const task = await prisma.a2ATask.findUnique({
        where: { id: req.params.id },
        include: { agent: { select: { name: true, endpointUrl: true } } },
      });
      if (!task) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({
        id: task.id,
        status: task.status,
        messages: safeJsonParse(task.messages, []),
        artifacts: safeJsonParse(task.artifacts, []),
        agent: task.agent,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    }),
  );

  app.post(
    "/api/a2a/tasks/:id/cancel",
    asyncHandler(async (req, res) => {
      const task = await prisma.a2ATask.findUnique({ where: { id: req.params.id } });
      if (!task) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      if (task.status === "completed" || task.status === "failed") {
        res.status(409).json({ error: "Task already finalized" });
        return;
      }
      const updated = await prisma.a2ATask.update({
        where: { id: req.params.id },
        data: { status: "canceled" },
      });
      res.json({ success: true, task: updated });
    }),
  );

  // ----- x402 Payment settlement -----
  app.post(
    "/api/payments/request",
    asyncHandler(async (req, res) => {
      const { chain, token, amountUsd, payerAddress, serviceId } = req.body || {};
      if (!chain || !amountUsd || !payerAddress) {
        res.status(400).json({ error: "chain, amountUsd, payerAddress required" });
        return;
      }
      const payee = getWallet(chain);
      if (!payee) {
        res.status(400).json({ error: `Platform wallet not configured for ${chain}` });
        return;
      }
      const amountToken = String(Math.round(Number(amountUsd) * 1_000_000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const payment = await prisma.paymentRequest.create({
        data: {
          payerAddress,
          payeeAddress: payee,
          chain: String(chain),
          token: String(token || "USDC"),
          amountUsd: Number(amountUsd),
          amountToken,
          status: "PENDING",
          expiresAt,
        },
      });
      res.json({
        paymentId: payment.id,
        requirements: { chain, token: token || "USDC", amountUsd, amountToken, payee, expiresAt },
      });
    }),
  );

  app.post(
    "/api/payments/verify",
    asyncHandler(async (req, res) => {
      const { paymentId, txHash } = req.body || {};
      if (!paymentId || !txHash) {
        res.status(400).json({ error: "paymentId and txHash required" });
        return;
      }
      const payment = await prisma.paymentRequest.findUnique({ where: { id: paymentId } });
      if (!payment) {
        res.status(404).json({ error: "Payment not found" });
        return;
      }
      if (payment.status === "CONFIRMED") {
        res.json({ success: true, payment: { ...payment, status: "CONFIRMED" } });
        return;
      }
      if (new Date() > payment.expiresAt) {
        await prisma.paymentRequest.update({
          where: { id: paymentId },
          data: { status: "EXPIRED" },
        });
        res.status(410).json({ error: "Payment expired" });
        return;
      }

      console.log(`\n💰 [x402] Verifying payment ${paymentId.slice(0, 8)}… on ${payment.chain}`);
      console.log(`   Tx: ${txHash.slice(0, 20)}… | Expected: ${payment.amountToken} ${payment.token} → ${payment.payeeAddress.slice(0, 12)}…`);

      const verify = await verifyOnchainPayment(txHash, payment.chain, payment.payeeAddress, payment.amountToken || "0");
      if (!verify.ok) {
        console.log(`   ❌ Verification failed: ${verify.error}`);
        res.status(402).json({ error: "Payment verification failed", detail: verify.error });
        return;
      }
      console.log(`   ✅ On-chain verification passed\n`);

      const updated = await prisma.paymentRequest.update({
        where: { id: paymentId },
        data: { status: "CONFIRMED", txHash, confirmedAt: new Date() },
      });

      // If payment was for an A2A task, execute it
      if (payment.taskId) {
        const task = await prisma.a2ATask.findUnique({
          where: { id: payment.taskId },
          include: { agent: { include: { services: true } } },
        });
        if (task) {
          const service = task.agent?.services[0];
          if (task.agent && service) {
            const userMessage = safeJsonParse(task.messages, []).find((m: any) => m.role === "user")?.parts?.[0]?.text || "";
            executeA2ATask(task.id, userMessage, task.agent, service).catch(console.error);
          } else {
            await prisma.a2ATask.update({ where: { id: task.id }, data: { status: "completed" } });
          }
        }
      }

      res.json({ success: true, payment: updated });
    }),
  );

  app.get(
    "/api/payments/:id",
    asyncHandler(async (req, res) => {
      const payment = await prisma.paymentRequest.findUnique({ where: { id: req.params.id } });
      if (!payment) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(payment);
    }),
  );

  // ----- Admin: Agent management -----
  app.post(
    "/api/admin/agents",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { name, description, endpointUrl, projectId, walletSolana, walletEvm, walletHtx, capabilities } = req.body || {};
      if (!name || !endpointUrl) {
        res.status(400).json({ error: "name and endpointUrl required" });
        return;
      }
      const agent = await prisma.agentCard.create({
        data: {
          name: String(name),
          description: description ? String(description) : null,
          endpointUrl: String(endpointUrl),
          projectId: projectId || null,
          walletSolana: walletSolana ? String(walletSolana) : null,
          walletEvm: walletEvm ? String(walletEvm) : null,
          walletHtx: walletHtx ? String(walletHtx) : null,
          capabilities: JSON.stringify(capabilities || []),
        },
      });
      res.status(201).json(agent);
    }),
  );

  app.post(
    "/api/admin/agents/:id/services",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { name, description, priceUsd, acceptedChains, acceptedToken, endpointPath, inputModes, outputModes } = req.body || {};
      if (!name || !endpointPath) {
        res.status(400).json({ error: "name and endpointPath required" });
        return;
      }
      const service = await prisma.agentService.create({
        data: {
          agentId: req.params.id,
          name: String(name),
          description: description ? String(description) : null,
          priceUsd: Number(priceUsd) || 0,
          acceptedChains: JSON.stringify(acceptedChains || ["solana", "evm"]),
          acceptedToken: String(acceptedToken || "USDC"),
          endpointPath: String(endpointPath),
          inputModes: JSON.stringify(inputModes || ["text"]),
          outputModes: JSON.stringify(outputModes || ["text"]),
        },
      });
      res.status(201).json(service);
    }),
  );

  return app;
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function runGithubScraper(prisma: PrismaClient, ai: GoogleGenAI, sourceId: string) {
  try {
    const response = await fetch("https://github.com/trending");
    const html = await response.text();
    const $ = cheerio.load(html);

    const repos: { name: string; description: string; url: string }[] = [];
    $(".Box-row").each((i, el) => {
      if (i >= 5) return;
      const titleEl = $(el).find("h2.h3 a");
      const name = titleEl.text().replace(/\s+/g, "").trim();
      const url = "https://github.com" + titleEl.attr("href");
      const description = $(el).find("p").text().trim();
      repos.push({ name, description, url });
    });

    for (const repo of repos) {
      const slug = repo.name.replace("/", "-").toLowerCase();
      const project = await prisma.project.upsert({
        where: { slug },
        update: { lastSeenAt: new Date(), description: repo.description || undefined },
        create: {
          slug,
          name: repo.name,
          url: repo.url,
          githubUrl: repo.url,
          description: repo.description,
          category: "LLM_ORCHESTRATION",
        },
      });

      const oppSlug = `opp-${slug}`;
      const opp = await prisma.opportunity.upsert({
        where: { slug: oppSlug },
        update: {},
        create: {
          slug: oppSlug,
          projectId: project.id,
          title: `Explore ${repo.name}`,
          description: repo.description,
          type: "OPEN_SOURCE",
          actionUrl: repo.url,
          status: "CANDIDATE",
        },
      });

      const safeName = sanitize(repo.name, 200);
      const safeDescription = sanitize(repo.description, 500);

      const prompt = `Analyze this open-source project from GitHub Trending.\n` +
        `Name: ${safeName}\n` +
        `Description: ${safeDescription}\n\n` +
        `Reply with JSON only:\n` +
        `{\n` +
        `  "highlights": ["A highlight", "Another highlight", "Third highlight"],\n` +
        `  "suitableFor": "Target audience description.",\n` +
        `  "comparisons": [{"name": "Alternative", "difference": "How they differ"}],\n` +
        `  "totalScore": 88,\n` +
        `  "dimensionScores": {\n` +
        `    "AI Relevance": {"score": 85, "explanation": "..."},\n` +
        `    "Momentum": {"score": 95, "explanation": "..."}\n` +
        `  }\n` +
        `}`;

      let reviewData: {
        highlights?: unknown[];
        suitableFor?: string;
        comparisons?: unknown[];
        totalScore?: number;
        dimensionScores?: Record<string, unknown>;
      } = {};

      try {
        const aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        reviewData = JSON.parse(aiResponse.text || "{}");
      } catch (e) {
        console.error("AI review error:", e);
        reviewData = {
          highlights: ["Trending on GitHub"],
          suitableFor: "Developers exploring new AI tooling",
          comparisons: [],
          totalScore: 70,
          dimensionScores: { Momentum: { score: 80, explanation: "Trending" } },
        };
      }

      // Avoid duplicate reviews on the same opportunity
      const existing = await prisma.aIReview.findFirst({ where: { opportunityId: opp.id } });
      if (!existing) {
        await prisma.aIReview.create({
          data: {
            projectId: project.id,
            opportunityId: opp.id,
            highlights: JSON.stringify(reviewData.highlights || []),
            suitableFor: String(reviewData.suitableFor || ""),
            comparisons: JSON.stringify(reviewData.comparisons || []),
            totalScore: Number(reviewData.totalScore) || 70,
            dimensionScores: JSON.stringify(reviewData.dimensionScores || {}),
            aiModel: "gemini-2.5-pro",
          },
        });
      }
    }

    await prisma.source.update({
      where: { id: sourceId },
      data: { lastStatus: "SUCCESS" },
    });
  } catch (err) {
    console.error("Scraper failed:", err);
    await prisma.source.update({
      where: { id: sourceId },
      data: { lastStatus: "FAILURE" },
    }).catch(() => {});
  }
}

async function startServer() {
  const prisma = new PrismaClient();
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  const app = createApp(prisma, ai);
  const PORT = Number(process.env.PORT || 3000);

  // Vite middleware for development; static files for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Final error middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: err.message || "internal_error" });
  });

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`TuringScout server running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
