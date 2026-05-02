import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isValidHttpUrl } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) return NextResponse.json({ error: "campaign not found" }, { status: 404 });
  const form = await request.formData();
  const proofUrl = String(form.get("proofUrl") ?? "");
  if (!isValidHttpUrl(proofUrl)) return NextResponse.json({ error: "valid proofUrl required" }, { status: 400 });
  const user = await getCurrentUser();
  const proof = await prisma.proofSubmission.create({ data: { campaignId: campaign.id, taskId: String(form.get("taskId") ?? "") || undefined, creatorId: user?.creatorId ?? undefined, userEmail: user?.email ?? (String(form.get("email") ?? "") || undefined), proofUrl, note: String(form.get("note") ?? "") || undefined, status: "pending" } });
  await prisma.reviewQueueItem.create({ data: { entityType: "proof_submission", entityId: proof.id, priority: "medium", reason: "Campaign proof requires quality review" } });
  return NextResponse.redirect(new URL(`/campaigns/${slug}?submitted=1`, request.url), { status: 303 });
}
