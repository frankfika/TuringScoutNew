import type { Campaign, CampaignTask, CategoryTrendSnapshot, Creator, CreatorContent, Evidence, Opportunity, Project, ProjectReport } from "@prisma/client";

export function publicEvidence(evidence: Evidence) {
  return {
    id: evidence.id,
    sourceType: evidence.sourceType,
    sourceUrl: evidence.sourceUrl,
    title: evidence.title,
    aiSummary: evidence.aiSummary,
    confidence: evidence.confidence,
    status: evidence.status,
    createdAt: evidence.createdAt,
  };
}

export function publicCreator(creator?: Creator | null) {
  if (!creator) return null;
  return {
    id: creator.id,
    displayName: creator.displayName,
    handle: creator.handle,
    platform: creator.platform,
    profileUrl: creator.profileUrl,
    avatarUrl: creator.avatarUrl,
    role: creator.role,
    qualityScore: creator.qualityScore,
  };
}

export function publicCreatorContent(content: CreatorContent & { creator?: Creator | null }) {
  return {
    id: content.id,
    creator: publicCreator(content.creator),
    contentUrl: content.contentUrl,
    platform: content.platform,
    contentType: content.contentType,
    title: content.title,
    summary: content.summary,
    contributionType: content.contributionType,
    publicCreditLabel: content.publicCreditLabel,
    qualityLabel: content.qualityLabel,
    isSponsored: content.isSponsored,
    status: content.status,
  };
}

export function publicProject(project: Project) {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    summary: project.summary,
    category: project.category,
    tags: project.tags,
    officialWebsiteUrl: project.officialWebsiteUrl,
    githubUrl: project.githubUrl,
    docsUrl: project.docsUrl,
    blogUrl: project.blogUrl,
    huggingFaceUrl: project.huggingFaceUrl,
    productHuntUrl: project.productHuntUrl,
    logoUrl: project.logoUrl,
    trustLabel: project.trustLabel,
    riskLabels: project.riskLabels,
    status: project.status,
    lastCheckedAt: project.lastCheckedAt,
    updatedAt: project.updatedAt,
  };
}

export function publicOpportunity(opportunity: Opportunity & { project?: Project; evidence?: Evidence[]; creatorContent?: Array<CreatorContent & { creator?: Creator | null }> }) {
  return {
    id: opportunity.id,
    slug: opportunity.slug,
    title: opportunity.title,
    summary: opportunity.summary,
    opportunityType: opportunity.opportunityType,
    rewardType: opportunity.rewardType,
    rewardDescription: opportunity.rewardDescription,
    taskSteps: opportunity.taskSteps,
    estimatedMinutes: opportunity.estimatedMinutes,
    difficulty: opportunity.difficulty,
    requiresLogin: opportunity.requiresLogin,
    requiresWallet: opportunity.requiresWallet,
    primaryCtaLabel: opportunity.primaryCtaLabel,
    trustLabel: opportunity.trustLabel,
    riskLabels: opportunity.riskLabels,
    utilityLabels: opportunity.utilityLabels,
    commercialLabel: opportunity.commercialLabel,
    sourceConfidence: opportunity.sourceConfidence,
    organicScore: opportunity.organicScore,
    adminScoreOverride: opportunity.adminScoreOverride,
    whyRanked: opportunity.whyRanked,
    status: opportunity.status,
    expiresAt: opportunity.expiresAt,
    lastCheckedAt: opportunity.lastCheckedAt,
    updatedAt: opportunity.updatedAt,
    project: opportunity.project ? publicProject(opportunity.project) : undefined,
    evidence: opportunity.evidence?.map(publicEvidence),
    creatorContent: opportunity.creatorContent?.map(publicCreatorContent),
  };
}

export function publicCampaign(campaign: Campaign & { project?: Project; tasks?: CampaignTask[] }) {
  return {
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    campaignType: campaign.campaignType,
    brief: campaign.brief,
    rewardDescription: campaign.rewardDescription,
    eligibility: campaign.eligibility,
    status: campaign.status,
    isSponsored: campaign.isSponsored,
    budgetLabel: campaign.budgetLabel,
    startsAt: campaign.startsAt,
    endsAt: campaign.endsAt,
    project: campaign.project ? publicProject(campaign.project) : undefined,
    tasks: campaign.tasks?.map((task) => ({ id: task.id, title: task.title, proofRequirements: task.proofRequirements, status: task.status })),
  };
}

export function publicReport(report: ProjectReport & { project?: Project }) {
  return {
    id: report.id,
    slug: report.slug,
    title: report.title,
    summary: report.summary,
    metrics: report.metrics,
    recommendations: report.recommendations,
    status: report.status,
    updatedAt: report.updatedAt,
    project: report.project ? publicProject(report.project) : undefined,
  };
}

export function publicTrend(trend: CategoryTrendSnapshot) {
  return {
    id: trend.id,
    category: trend.category,
    snapshotDate: trend.snapshotDate,
    opportunityCount: trend.opportunityCount,
    averageScore: trend.averageScore,
    topProjects: trend.topProjects,
    riskMix: trend.riskMix,
  };
}
