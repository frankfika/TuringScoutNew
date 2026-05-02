import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdmin(); const { id } = await params; await prisma.projectClaim.update({ where: { id }, data: { status: "rejected" } }); await prisma.reviewQueueItem.updateMany({ where: { entityId: id, entityType: "project_claim" }, data: { status: "resolved", resolvedAt: new Date() } }); return NextResponse.redirect(new URL("/admin/review", request.url), { status: 303 }); }
