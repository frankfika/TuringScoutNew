import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await prisma.opportunity.update({ where: { id }, data: { status: "expired", expiresAt: new Date() } });
  await prisma.analyticsEvent.create({ data: { eventName: "admin_decision", opportunityId: id, props: { decision: "expire" } } });
  return NextResponse.redirect(new URL("/admin/opportunities", request.url), { status: 303 });
}
