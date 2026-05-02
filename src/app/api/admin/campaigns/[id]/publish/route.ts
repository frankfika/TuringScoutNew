import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { await requireAdmin(); const { id } = await params; await prisma.campaign.update({ where: { id }, data: { status: "published", isSponsored: true } }); return NextResponse.redirect(new URL("/admin/campaigns", request.url), { status: 303 }); }
