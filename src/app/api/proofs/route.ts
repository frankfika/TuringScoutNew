import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isValidHttpUrl } from "@/lib/validators";

export async function POST(request: Request) {
  const form = await request.formData();
  const proofUrl = String(form.get("proofUrl") ?? "");
  if (!isValidHttpUrl(proofUrl)) return NextResponse.json({ error: "valid proofUrl required" }, { status: 400 });
  const user = await getCurrentUser();
  const proof = await prisma.proofSubmission.create({
    data: { campaignId: String(form.get("campaignId") ?? "") || undefined, taskId: String(form.get("taskId") ?? "") || undefined, creatorId: user?.creatorId ?? undefined, userEmail: user?.email ?? (String(form.get("email") ?? "") || undefined), proofUrl, note: String(form.get("note") ?? "") || undefined, status: "pending" },
  });
  await prisma.reviewQueueItem.create({ data: { entityType: "proof_submission", entityId: proof.id, priority: "medium", reason: "Proof submission needs quality review" } });
  return NextResponse.redirect(new URL("/me", request.url), { status: 303 });
}
