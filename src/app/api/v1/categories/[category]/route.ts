import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicOpportunity, publicTrend } from "@/lib/public-shapes";

export async function GET(_request: Request, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [opportunities, trends] = await Promise.all([
    prisma.opportunity.findMany({ where: { status: "published", project: { category } }, include: { project: true, evidence: true, creatorContent: { include: { creator: true } } }, orderBy: { organicScore: "desc" }, take: 50 }),
    prisma.categoryTrendSnapshot.findMany({ where: { category }, orderBy: { snapshotDate: "desc" }, take: 5 }),
  ]);
  const averageScore = opportunities.reduce((sum, item) => sum + (item.organicScore ?? 0), 0) / Math.max(opportunities.length, 1);
  return NextResponse.json({ version: "v1", category, opportunityCount: opportunities.length, averageScore, opportunities: opportunities.map(publicOpportunity), trends: trends.map(publicTrend) });
}
