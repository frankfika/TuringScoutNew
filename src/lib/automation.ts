import { prisma } from "@/lib/prisma";
import { calculateOpportunityScore, reviewReasonForOpportunity } from "@/lib/scoring";

function slugify(input: string) {
  return input.toLowerCase().replace(/https?:\/\//, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "candidate";
}

export async function importRawEvidence(input: { sourceId?: string; sourceUrl: string; rawTitle?: string; rawTextExcerpt?: string; sourceType?: string; sourceName?: string }) {
  const source = input.sourceId ? await prisma.source.findUnique({ where: { id: input.sourceId } }) : null;
  const checksum = `${input.sourceUrl}:${input.rawTitle ?? ""}`.toLowerCase();
  return prisma.rawEvidence.create({
    data: {
      sourceId: source?.id,
      sourceType: input.sourceType ?? source?.sourceType ?? "manual",
      sourceName: input.sourceName ?? source?.name ?? "Manual import",
      sourceUrl: input.sourceUrl,
      rawTitle: input.rawTitle ?? `Imported evidence from ${new URL(input.sourceUrl).hostname}`,
      rawTextExcerpt: input.rawTextExcerpt ?? "Manual raw evidence awaiting extraction.",
      fetchedAt: new Date(),
      linkedUrls: [input.sourceUrl],
      language: "en",
      fetchStatus: "success",
      reviewStatus: "pending",
      extractionStatus: "pending",
      checksum,
    },
  });
}

export async function extractCandidateFromRawEvidence(rawEvidenceId: string) {
  const raw = await prisma.rawEvidence.findUnique({ where: { id: rawEvidenceId }, include: { source: true } });
  if (!raw) throw new Error("RawEvidence not found");

  const host = new URL(raw.sourceUrl).hostname.replace(/^www\./, "");
  const baseName = (raw.rawTitle ?? host).replace(/[^a-zA-Z0-9 ]+/g, " ").trim().split(/\s+/).slice(0, 5).join(" ") || host;
  const projectSlug = slugify(baseName);
  const opportunitySlug = `${projectSlug}-${raw.id.slice(-6)}`;
  const category = raw.source?.categoryHint && raw.source.categoryHint !== "v1-seed" ? raw.source.categoryHint : "open-source-ai";

  const project = await prisma.project.upsert({
    where: { slug: projectSlug },
    update: { lastCheckedAt: new Date() },
    create: {
      slug: projectSlug,
      name: baseName,
      tagline: raw.rawTextExcerpt?.slice(0, 120) ?? "AI project candidate from raw evidence",
      summary: raw.rawTextExcerpt ?? "AI extracted project draft. Admin should verify official source before publishing.",
      category,
      tags: ["ai", "candidate"],
      officialWebsiteUrl: raw.sourceUrl,
      trustLabel: "ai_summary",
      riskLabels: ["needs_review"],
      status: "draft",
      lastCheckedAt: new Date(),
    },
  });

  const scoreInput = {
    rewardType: "learning",
    trustLabel: "ai_summary",
    estimatedMinutes: 30,
    difficulty: "beginner",
    sourceConfidence: 62,
    riskLabels: ["needs_review"],
    utilityLabels: ["builder_task"],
    commercialLabel: null,
  };
  const score = calculateOpportunityScore(scoreInput);

  const opportunity = await prisma.opportunity.create({
    data: {
      projectId: project.id,
      slug: opportunitySlug,
      title: raw.rawTitle ?? `Review ${baseName}`,
      summary: raw.rawTextExcerpt ?? "AI extracted draft from raw evidence. Admin review required.",
      opportunityType: "other",
      rewardType: "learning",
      rewardDescription: "Potential learning or builder opportunity; verify before publishing.",
      taskSteps: ["Open the source URL.", "Verify official source and current terms.", "Edit labels, risk notes, and CTA before publishing."],
      estimatedMinutes: 30,
      difficulty: "beginner",
      primaryCtaUrl: raw.sourceUrl,
      primaryCtaLabel: "Review source",
      trustLabel: "ai_summary",
      riskLabels: ["needs_review"],
      utilityLabels: ["builder_task"],
      sourceConfidence: 62,
      organicScore: score.score,
      whyRanked: "AI draft from raw evidence. Requires admin validation before public ranking.",
      status: "needs_review",
      reviewReason: "AI extraction draft requires source validation",
      lastCheckedAt: new Date(),
    },
  });

  await prisma.evidence.create({
    data: {
      projectId: project.id,
      opportunityId: opportunity.id,
      rawEvidenceId: raw.id,
      sourceType: raw.sourceType,
      sourceUrl: raw.sourceUrl,
      title: raw.rawTitle,
      rawText: raw.rawTextExcerpt,
      aiSummary: "AI extracted draft evidence. Validate before publish.",
      confidence: 62,
      fetchedAt: raw.fetchedAt ?? new Date(),
      status: "active",
    },
  });

  await prisma.scoreSnapshot.create({
    data: {
      entityType: "opportunity",
      entityId: opportunity.id,
      scoreType: "organic",
      score: score.score,
      components: score.components,
      explanation: opportunity.whyRanked,
      createdBy: "ai-draft-stub",
    },
  });

  const reason = reviewReasonForOpportunity(opportunity) || "AI draft requires review";
  await prisma.reviewQueueItem.create({
    data: { entityType: "opportunity", entityId: opportunity.id, opportunityId: opportunity.id, priority: "medium", reason },
  });

  await prisma.rawEvidence.update({ where: { id: raw.id }, data: { extractionStatus: "success", reviewStatus: "candidate_created" } });
  return opportunity;
}

export async function runSource(sourceId: string, jobType = "manual") {
  const source = await prisma.source.findUnique({ where: { id: sourceId } });
  if (!source) throw new Error("Source not found");

  const run = await prisma.sourceJobRun.create({ data: { sourceId, jobType, status: "running", startedAt: new Date() } });
  try {
    const raw = await importRawEvidence({
      sourceId,
      sourceUrl: source.urlOrQuery.startsWith("http") ? source.urlOrQuery : "https://github.com/search?q=ai+agent&type=repositories",
      rawTitle: `${source.name} candidate ${new Date().toISOString().slice(0, 10)}`,
      rawTextExcerpt: `Production-safe source run from ${source.name}. This creates a reviewable candidate rather than auto-publishing.`,
    });
    const opportunity = await extractCandidateFromRawEvidence(raw.id);
    await prisma.source.update({ where: { id: sourceId }, data: { lastCheckedAt: new Date() } });
    return prisma.sourceJobRun.update({
      where: { id: run.id },
      data: { status: "success", finishedAt: new Date(), rawEvidenceCreated: 1, candidatesCreated: opportunity ? 1 : 0 },
    });
  } catch (error) {
    return prisma.sourceJobRun.update({
      where: { id: run.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: error instanceof Error ? error.message : "Unknown error" },
    });
  }
}

export async function createAutomationDigest() {
  const [topOpportunities, openReview, sourceFailures, pendingRaw] = await Promise.all([
    prisma.opportunity.findMany({ where: { status: "published" }, include: { project: true }, orderBy: { organicScore: "desc" }, take: 8 }),
    prisma.reviewQueueItem.count({ where: { status: "open" } }),
    prisma.sourceJobRun.count({ where: { status: { in: ["failed", "partial_failed", "blocked"] } } }),
    prisma.rawEvidence.count({ where: { extractionStatus: "pending" } }),
  ]);
  const body = [
    `Open review queue: ${openReview}`,
    `Pending raw evidence extraction: ${pendingRaw}`,
    `Source failures needing attention: ${sourceFailures}`,
    "",
    "Top opportunities:",
    ...topOpportunities.map((item, index) => `${index + 1}. ${item.project.name} - ${item.title} (${Math.round(item.organicScore ?? 0)})`),
  ].join("\n");

  return prisma.digestDraft.create({
    data: {
      period: new Date().toISOString().slice(0, 10),
      title: `TuringScout daily operator digest - ${new Date().toISOString().slice(0, 10)}`,
      body,
      status: "draft",
    },
  });
}

export async function createNotificationDrafts() {
  const opportunities = await prisma.opportunity.findMany({ where: { status: "published" }, include: { project: true, creatorContent: { include: { creator: true }, take: 1 } }, orderBy: { organicScore: "desc" }, take: 5 });
  const drafts = [];
  for (const opportunity of opportunities) {
    drafts.push(await prisma.notificationDraft.create({
      data: {
        targetType: "project",
        targetId: opportunity.projectId,
        channel: "email",
        subject: `${opportunity.project.name} is ranking on TuringScout`,
        body: `Your project appears in TuringScout because: ${opportunity.whyRanked} This is a draft notification for founder review, not an automated send.`,
        status: "draft",
      },
    }));
    const creator = opportunity.creatorContent[0]?.creator;
    if (creator) {
      drafts.push(await prisma.notificationDraft.create({
        data: {
          targetType: "creator",
          targetId: creator.id,
          channel: "email",
          subject: `Your scout credit is visible for ${opportunity.project.name}`,
          body: `Thanks for helping explain ${opportunity.project.name}. This draft can be used for weekly creator recognition.`,
          status: "draft",
        },
      }));
    }
  }
  return drafts;
}

export async function cleanupExpiredAndBroken() {
  const expired = await prisma.opportunity.updateMany({
    where: { status: "published", expiresAt: { lt: new Date() } },
    data: { status: "expired", reviewReason: "Expired by cleanup job" },
  });
  const missingEvidence = await prisma.opportunity.findMany({ where: { status: "published", evidence: { none: { status: "active" } } } });
  for (const opportunity of missingEvidence) {
    await prisma.reviewQueueItem.create({ data: { entityType: "opportunity", entityId: opportunity.id, opportunityId: opportunity.id, priority: "high", reason: "Published opportunity has no active evidence" } });
  }
  return { expired: expired.count, missingEvidence: missingEvidence.length };
}

export async function createProjectReport(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { opportunities: true, creatorContent: true, evidence: true, githubSnapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
  });
  if (!project) throw new Error("Project not found");
  const clicks = await prisma.outboundClick.count({ where: { projectId } });
  const metrics = {
    opportunities: project.opportunities.length,
    creatorCoverage: project.creatorContent.length,
    evidenceCount: project.evidence.length,
    outboundClicks: clicks,
    latestGithub: project.githubSnapshots[0] ?? null,
  };
  return prisma.projectReport.upsert({
    where: { slug: `${project.slug}-basic-report` },
    update: { metrics, summary: `Evidence-backed report for ${project.name}.`, status: "published" },
    create: {
      projectId,
      slug: `${project.slug}-basic-report`,
      title: `${project.name} TuringScout Intelligence Report`,
      summary: `Evidence-backed report for ${project.name}. Attribution is directional and uses correlated lift language only.`,
      metrics,
      recommendations: ["Refresh official source evidence", "Invite useful creator context", "Consider a quality-reviewed campaign"],
      status: "published",
    },
  });
}

export async function createCategoryTrendSnapshots() {
  const categories = await prisma.project.groupBy({ by: ["category"], where: { status: "published", category: { not: null } } });
  const snapshots = [];
  for (const row of categories) {
    if (!row.category) continue;
    const opportunities = await prisma.opportunity.findMany({ where: { status: "published", project: { category: row.category } }, include: { project: true } });
    const averageScore = opportunities.reduce((sum, item) => sum + (item.organicScore ?? 0), 0) / Math.max(opportunities.length, 1);
    const riskMix = opportunities.reduce<Record<string, number>>((acc, item) => {
      const risks = Array.isArray(item.riskLabels) ? item.riskLabels : [];
      for (const risk of risks) acc[String(risk)] = (acc[String(risk)] ?? 0) + 1;
      return acc;
    }, {});
    snapshots.push(await prisma.categoryTrendSnapshot.create({
      data: {
        category: row.category,
        opportunityCount: opportunities.length,
        averageScore,
        topProjects: opportunities.slice(0, 5).map((item) => ({ project: item.project.name, title: item.title, score: item.organicScore })),
        riskMix,
      },
    }));
  }
  return snapshots;
}
