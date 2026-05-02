import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/auth", request.url), { status: 303 });
  const form = await request.formData();
  const opportunityId = String(form.get("opportunityId") ?? "");
  const status = String(form.get("status") ?? "saved");
  await prisma.savedOpportunity.upsert({
    where: { userId_opportunityId: { userId: user.id, opportunityId } },
    update: { status, notes: String(form.get("notes") ?? "") || null, proofUrl: String(form.get("proofUrl") ?? "") || null },
    create: { userId: user.id, opportunityId, status, notes: String(form.get("notes") ?? "") || null, proofUrl: String(form.get("proofUrl") ?? "") || null },
  });
  await prisma.attributionEvent.create({ data: { opportunityId, creatorId: user.creatorId, eventType: status, source: "public_user" } });
  return NextResponse.redirect(new URL("/me", request.url), { status: 303 });
}
