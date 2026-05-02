import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, optionalValidHttpUrl } from "@/lib/validators";

export async function POST(request: Request) {
  const form = await request.formData();
  const projectId = String(form.get("projectId") ?? "");
  const contactEmail = String(form.get("contactEmail") ?? "").trim();
  const proofUrl = String(form.get("proofUrl") ?? "") || undefined;
  if (!projectId || !isValidEmail(contactEmail) || !optionalValidHttpUrl(proofUrl)) return NextResponse.json({ error: "invalid claim" }, { status: 400 });
  const claim = await prisma.projectClaim.create({ data: { projectId, contactEmail, proofUrl, note: String(form.get("note") ?? "") || undefined, status: "pending" } });
  await prisma.reviewQueueItem.create({ data: { entityType: "project_claim", entityId: claim.id, priority: "medium", reason: "Project claim requires verification" } });
  return NextResponse.redirect(new URL("/me", request.url), { status: 303 });
}
