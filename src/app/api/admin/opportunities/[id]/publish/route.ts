import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const opportunity = await prisma.opportunity.update({ where: { id }, data: { status: "published", reviewReason: null, lastCheckedAt: new Date() } });
  await prisma.project.update({ where: { id: opportunity.projectId }, data: { status: "published", trustLabel: opportunity.trustLabel === "official_source" ? "verified" : "unverified", lastCheckedAt: new Date() } });
  await prisma.reviewQueueItem.updateMany({ where: { entityId: id, status: "open" }, data: { status: "resolved", resolvedAt: new Date() } });
  await prisma.analyticsEvent.create({ data: { eventName: "admin_decision", opportunityId: id, props: { decision: "publish" } } });
  return NextResponse.redirect(new URL("/admin/review", request.url), { status: 303 });
}
