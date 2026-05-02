import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const form = await request.formData();
  const reason = String(form.get("reason") ?? "Rejected by admin");
  await prisma.opportunity.update({ where: { id }, data: { status: "rejected", reviewReason: reason } });
  await prisma.reviewQueueItem.updateMany({ where: { entityId: id, status: "open" }, data: { status: "resolved", resolvedAt: new Date() } });
  await prisma.analyticsEvent.create({ data: { eventName: "admin_decision", opportunityId: id, props: { decision: "reject", reason } } });
  return NextResponse.redirect(new URL("/admin/review", request.url), { status: 303 });
}
