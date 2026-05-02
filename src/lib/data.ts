import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { scoreFor } from "@/lib/format";

const opportunityInclude = {
  project: true,
  evidence: { where: { status: "active" }, orderBy: { createdAt: "desc" } },
  creatorContent: {
    where: { status: "visible" },
    include: { creator: true },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.OpportunityInclude;

export const getTopOpportunities = cache(async (limit = 10) => {
  const now = new Date();
  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: "published",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: opportunityInclude,
  });

  return opportunities
    .sort((a, b) => scoreFor(b.organicScore, b.adminScoreOverride) - scoreFor(a.organicScore, a.adminScoreOverride))
    .slice(0, limit);
});

export async function listOpportunities(options: {
  category?: string;
  type?: string;
  trust?: string;
  risk?: string;
  limit?: number;
  cursor?: string;
  sort?: string;
}) {
  const now = new Date();
  const where: Prisma.OpportunityWhereInput = {
    status: "published",
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  if (options.type) where.opportunityType = options.type;
  if (options.trust) where.trustLabel = options.trust;
  if (options.category) where.project = { category: options.category };

  const all = await prisma.opportunity.findMany({ where, include: opportunityInclude });
  const filtered = options.risk
    ? all.filter((item) => JSON.stringify(item.riskLabels ?? []).includes(options.risk ?? ""))
    : all;

  const sorted = filtered.sort((a, b) => {
    if (options.sort === "freshness") return b.createdAt.getTime() - a.createdAt.getTime();
    return scoreFor(b.organicScore, b.adminScoreOverride) - scoreFor(a.organicScore, a.adminScoreOverride);
  });

  const start = options.cursor ? Math.max(sorted.findIndex((item) => item.id === options.cursor) + 1, 0) : 0;
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
  const items = sorted.slice(start, start + limit);
  const nextCursor = sorted[start + limit]?.id ?? null;

  return { items, nextCursor };
}

export const getOpportunityBySlug = cache(async (slug: string) => {
  return prisma.opportunity.findUnique({ where: { slug }, include: opportunityInclude });
});

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findUnique({
    where: { slug },
    include: {
      opportunities: {
        where: { status: "published" },
        include: { evidence: { where: { status: "active" } }, creatorContent: { where: { status: "visible" }, include: { creator: true } } },
      },
      evidence: { where: { status: "active" }, orderBy: { createdAt: "desc" } },
      creatorContent: { where: { status: "visible" }, include: { creator: true } },
      githubSnapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
    },
  });
});

export const getVisibleCreators = cache(async () => {
  return prisma.creator.findMany({
    where: { status: "visible" },
    include: {
      creatorContent: {
        where: { status: "visible" },
        include: { project: true, opportunity: true },
        take: 3,
      },
    },
    orderBy: [{ qualityScore: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
});
