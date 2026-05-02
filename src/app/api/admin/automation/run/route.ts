import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { cleanupExpiredAndBroken, createAutomationDigest, createCategoryTrendSnapshots, createNotificationDrafts, createProjectReport, extractCandidateFromRawEvidence } from "@/lib/automation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireAdmin();
  const pending = await prisma.rawEvidence.findMany({ where: { extractionStatus: "pending" }, take: 5 });
  let extracted = 0;
  for (const raw of pending) {
    await extractCandidateFromRawEvidence(raw.id).catch(async (error) => {
      await prisma.automationTask.create({ data: { taskType: "raw_evidence_extract", status: "failed", payload: { rawEvidenceId: raw.id }, error: error instanceof Error ? error.message : "unknown" } });
    });
    extracted += 1;
  }
  const cleanup = await cleanupExpiredAndBroken();
  const digest = await createAutomationDigest();
  const notifications = await createNotificationDrafts();
  const projects = await prisma.project.findMany({ where: { status: "published" }, take: 5 });
  for (const project of projects) await createProjectReport(project.id);
  const trendSnapshots = await createCategoryTrendSnapshots();
  await prisma.automationTask.create({ data: { taskType: "v1_5_batch", status: "success", result: { extracted, cleanup, digestId: digest.id, notifications: notifications.length, trendSnapshots: trendSnapshots.length }, finishedAt: new Date() } });
  return NextResponse.redirect(new URL("/admin/automation", request.url), { status: 303 });
}
