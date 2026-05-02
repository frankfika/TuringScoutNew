-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "urlOrQuery" TEXT NOT NULL,
    "categoryHint" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "frequency" TEXT NOT NULL DEFAULT 'manual',
    "fetchMethod" TEXT NOT NULL DEFAULT 'manual',
    "allowedUseNotes" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RawEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "discoveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchedAt" DATETIME,
    "rawTitle" TEXT,
    "rawTextExcerpt" TEXT,
    "rawContentRef" TEXT,
    "authorOrAccount" TEXT,
    "publishedAt" DATETIME,
    "linkedUrls" JSONB,
    "language" TEXT,
    "fetchStatus" TEXT NOT NULL DEFAULT 'success',
    "checksum" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RawEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "summary" TEXT,
    "category" TEXT,
    "tags" JSONB,
    "officialWebsiteUrl" TEXT,
    "githubUrl" TEXT,
    "docsUrl" TEXT,
    "blogUrl" TEXT,
    "huggingFaceUrl" TEXT,
    "productHuntUrl" TEXT,
    "logoUrl" TEXT,
    "trustLabel" TEXT NOT NULL DEFAULT 'unverified',
    "riskLabels" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "lastCheckedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "opportunityType" TEXT NOT NULL,
    "rewardType" TEXT,
    "rewardDescription" TEXT,
    "taskSteps" JSONB,
    "estimatedMinutes" INTEGER,
    "difficulty" TEXT,
    "requiresLogin" BOOLEAN NOT NULL DEFAULT false,
    "requiresWallet" BOOLEAN NOT NULL DEFAULT false,
    "primaryCtaUrl" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL,
    "trustLabel" TEXT NOT NULL DEFAULT 'ai_summary',
    "riskLabels" JSONB,
    "utilityLabels" JSONB,
    "commercialLabel" TEXT,
    "sourceConfidence" INTEGER,
    "organicScore" REAL,
    "adminScoreOverride" REAL,
    "adminOverrideReason" TEXT,
    "whyRanked" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reviewReason" TEXT,
    "expiresAt" DATETIME,
    "lastCheckedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Opportunity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "opportunityId" TEXT,
    "rawEvidenceId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT,
    "rawText" TEXT,
    "aiSummary" TEXT,
    "confidence" INTEGER,
    "fetchedAt" DATETIME,
    "submittedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evidence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evidence_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evidence_rawEvidenceId_fkey" FOREIGN KEY ("rawEvidenceId") REFERENCES "RawEvidence" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "contactEmail" TEXT,
    "socialHandle" TEXT,
    "contentUrl" TEXT,
    "publicCreditOptIn" BOOLEAN NOT NULL DEFAULT false,
    "submitterIpHash" TEXT,
    "userAgentHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "linkedProjectId" TEXT,
    "linkedOpportunityId" TEXT,
    "reviewReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "handle" TEXT,
    "platform" TEXT,
    "profileUrl" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "qualityScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CreatorContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT,
    "projectId" TEXT,
    "opportunityId" TEXT,
    "contentUrl" TEXT NOT NULL,
    "platform" TEXT,
    "contentType" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "contributionType" TEXT NOT NULL,
    "publicCreditLabel" TEXT,
    "qualityLabel" TEXT,
    "riskLabels" JSONB,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreatorContent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CreatorContent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CreatorContent_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "scoreType" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "components" JSONB NOT NULL,
    "explanation" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OutboundClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT,
    "projectId" TEXT,
    "targetUrl" TEXT NOT NULL,
    "ctaType" TEXT,
    "sourceModule" TEXT,
    "category" TEXT,
    "visitorIdHash" TEXT,
    "sessionIdHash" TEXT,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutboundClick_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "opportunityId" TEXT,
    "projectId" TEXT,
    "creatorId" TEXT,
    "sourceModule" TEXT,
    "targetUrl" TEXT,
    "ctaType" TEXT,
    "category" TEXT,
    "props" JSONB,
    "visitorIdHash" TEXT,
    "sessionIdHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GithubMetricSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "stars" INTEGER,
    "forks" INTEGER,
    "watchers" INTEGER,
    "openIssues" INTEGER,
    "pullRequests" INTEGER,
    "contributors" INTEGER,
    "releases" INTEGER,
    "topics" JSONB,
    "license" TEXT,
    "lastPushedAt" DATETIME,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GithubMetricSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RawEvidence_sourceType_idx" ON "RawEvidence"("sourceType");

-- CreateIndex
CREATE INDEX "RawEvidence_fetchStatus_idx" ON "RawEvidence"("fetchStatus");

-- CreateIndex
CREATE INDEX "RawEvidence_checksum_idx" ON "RawEvidence"("checksum");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_slug_key" ON "Opportunity"("slug");

-- CreateIndex
CREATE INDEX "Opportunity_projectId_idx" ON "Opportunity"("projectId");

-- CreateIndex
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");

-- CreateIndex
CREATE INDEX "Opportunity_opportunityType_idx" ON "Opportunity"("opportunityType");

-- CreateIndex
CREATE INDEX "Opportunity_organicScore_idx" ON "Opportunity"("organicScore");

-- CreateIndex
CREATE INDEX "Opportunity_expiresAt_idx" ON "Opportunity"("expiresAt");

-- CreateIndex
CREATE INDEX "Evidence_projectId_idx" ON "Evidence"("projectId");

-- CreateIndex
CREATE INDEX "Evidence_opportunityId_idx" ON "Evidence"("opportunityId");

-- CreateIndex
CREATE INDEX "Evidence_status_idx" ON "Evidence"("status");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_type_idx" ON "Submission"("type");

-- CreateIndex
CREATE INDEX "CreatorContent_status_idx" ON "CreatorContent"("status");

-- CreateIndex
CREATE INDEX "CreatorContent_projectId_idx" ON "CreatorContent"("projectId");

-- CreateIndex
CREATE INDEX "CreatorContent_opportunityId_idx" ON "CreatorContent"("opportunityId");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_entityType_entityId_idx" ON "ScoreSnapshot"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "OutboundClick_opportunityId_idx" ON "OutboundClick"("opportunityId");

-- CreateIndex
CREATE INDEX "OutboundClick_createdAt_idx" ON "OutboundClick"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "GithubMetricSnapshot_projectId_idx" ON "GithubMetricSnapshot"("projectId");
