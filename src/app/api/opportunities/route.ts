import { NextResponse } from "next/server";
import { listOpportunities } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await listOpportunities({
    category: searchParams.get("category") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    trust: searchParams.get("trust") ?? undefined,
    risk: searchParams.get("risk") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    sort: searchParams.get("sort") ?? "rank",
    limit: Number(searchParams.get("limit") ?? 20),
  });

  return NextResponse.json({
    items: result.items.map((item) => ({
      id: item.id,
      slug: item.slug,
      projectName: item.project.name,
      projectSlug: item.project.slug,
      title: item.title,
      rewardType: item.rewardType,
      estimatedMinutes: item.estimatedMinutes,
      difficulty: item.difficulty,
      trustLabel: item.trustLabel,
      riskLabels: item.riskLabels,
      whyRanked: item.whyRanked,
      spottedBy: item.creatorContent[0]?.creator?.handle ?? item.creatorContent[0]?.creator?.displayName ?? null,
      primaryCtaLabel: item.primaryCtaLabel,
    })),
    nextCursor: result.nextCursor,
  });
}
