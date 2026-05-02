import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "campaign";
}

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const projectId = String(form.get("projectId") ?? "");
  const title = String(form.get("title") ?? "Untitled campaign").trim();
  const campaign = await prisma.campaign.create({
    data: {
      projectId,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      title,
      campaignType: String(form.get("campaignType") ?? "buildshare"),
      brief: String(form.get("brief") ?? ""),
      rewardDescription: String(form.get("rewardDescription") ?? "") || null,
      eligibility: String(form.get("eligibility") ?? "") || null,
      status: String(form.get("status") ?? "draft"),
      isSponsored: true,
      budgetLabel: String(form.get("budgetLabel") ?? "manual-first") || null,
    },
  });
  const taskTitle = String(form.get("taskTitle") ?? "").trim();
  if (taskTitle) {
    await prisma.campaignTask.create({ data: { campaignId: campaign.id, title: taskTitle, proofRequirements: String(form.get("proofRequirements") ?? "Public proof URL required") } });
  }
  return NextResponse.redirect(new URL("/admin/campaigns", request.url), { status: 303 });
}
