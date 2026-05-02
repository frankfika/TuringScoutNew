import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { calculateOpportunityScore, reviewReasonForOpportunity } from "@/lib/scoring";

export async function POST(request: Request) {
  await requireAdmin();
  const opportunities = await prisma.opportunity.findMany({ where: { status: { in: ["published", "needs_review", "draft"] } } });
  let updated = 0;
  for (const opportunity of opportunities) {
    const score = calculateOpportunityScore(opportunity);
    const reviewReason = reviewReasonForOpportunity(opportunity);
    const nextStatus = reviewReason && opportunity.status === "published" ? "needs_review" : opportunity.status;
    await prisma.opportunity.update({ where: { id: opportunity.id }, data: { organicScore: score.score, status: nextStatus, reviewReason: reviewReason || opportunity.reviewReason } });
    await prisma.scoreSnapshot.create({ data: { entityType: "opportunity", entityId: opportunity.id, scoreType: "organic", score: score.score, components: score.components, explanation: "Recalculated by admin score job", createdBy: "admin" } });
    if (reviewReason) {
      await prisma.reviewQueueItem.upsert({
        where: { id: `manual-${opportunity.id}` },
        update: { status: "open", reason: reviewReason },
        create: { id: `manual-${opportunity.id}`, entityType: "opportunity", entityId: opportunity.id, opportunityId: opportunity.id, priority: "high", reason: reviewReason },
      }).catch(async () => {
        await prisma.reviewQueueItem.create({ data: { entityType: "opportunity", entityId: opportunity.id, opportunityId: opportunity.id, priority: "high", reason: reviewReason } });
      });
    }
    updated += 1;
  }
  return NextResponse.redirect(new URL(`/admin?scored=${updated}`, request.url), { status: 303 });
}
