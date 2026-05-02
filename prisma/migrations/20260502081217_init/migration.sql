-- CreateTable
CREATE TABLE "AutomationTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "payload" JSONB,
    "result" JSONB,
    "error" TEXT,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DigestDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PublicUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'scout',
    "creatorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublicUser_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "notes" TEXT,
    "proofUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavedOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PublicUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "proofUrl" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectClaim_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttributionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "opportunityId" TEXT,
    "creatorId" TEXT,
    "campaignId" TEXT,
    "eventType" TEXT NOT NULL,
    "source" TEXT,
    "value" REAL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttributionEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AttributionEvent_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AttributionEvent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AttributionEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "rewardDescription" TEXT,
    "eligibility" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isSponsored" BOOLEAN NOT NULL DEFAULT true,
    "budgetLabel" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "proofRequirements" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignTask_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProofSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT,
    "taskId" TEXT,
    "creatorId" TEXT,
    "userEmail" TEXT,
    "proofUrl" TEXT NOT NULL,
    "note" TEXT,
    "qualityLabel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProofSubmission_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProofSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CampaignTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProofSubmission_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "recommendations" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "scopes" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME
);

-- CreateTable
CREATE TABLE "CategoryTrendSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "snapshotDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opportunityCount" INTEGER NOT NULL,
    "averageScore" REAL NOT NULL,
    "topProjects" JSONB NOT NULL,
    "riskMix" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "AutomationTask_status_idx" ON "AutomationTask"("status");

-- CreateIndex
CREATE INDEX "AutomationTask_taskType_idx" ON "AutomationTask"("taskType");

-- CreateIndex
CREATE INDEX "NotificationDraft_targetType_targetId_idx" ON "NotificationDraft"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "NotificationDraft_status_idx" ON "NotificationDraft"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PublicUser_email_key" ON "PublicUser"("email");

-- CreateIndex
CREATE INDEX "PublicUser_creatorId_idx" ON "PublicUser"("creatorId");

-- CreateIndex
CREATE INDEX "SavedOpportunity_status_idx" ON "SavedOpportunity"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SavedOpportunity_userId_opportunityId_key" ON "SavedOpportunity"("userId", "opportunityId");

-- CreateIndex
CREATE INDEX "ProjectClaim_projectId_idx" ON "ProjectClaim"("projectId");

-- CreateIndex
CREATE INDEX "ProjectClaim_status_idx" ON "ProjectClaim"("status");

-- CreateIndex
CREATE INDEX "AttributionEvent_projectId_idx" ON "AttributionEvent"("projectId");

-- CreateIndex
CREATE INDEX "AttributionEvent_campaignId_idx" ON "AttributionEvent"("campaignId");

-- CreateIndex
CREATE INDEX "AttributionEvent_eventType_idx" ON "AttributionEvent"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- CreateIndex
CREATE INDEX "Campaign_projectId_idx" ON "Campaign"("projectId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_campaignType_idx" ON "Campaign"("campaignType");

-- CreateIndex
CREATE INDEX "CampaignTask_campaignId_idx" ON "CampaignTask"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignTask_status_idx" ON "CampaignTask"("status");

-- CreateIndex
CREATE INDEX "ProofSubmission_campaignId_idx" ON "ProofSubmission"("campaignId");

-- CreateIndex
CREATE INDEX "ProofSubmission_status_idx" ON "ProofSubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectReport_slug_key" ON "ProjectReport"("slug");

-- CreateIndex
CREATE INDEX "ProjectReport_projectId_idx" ON "ProjectReport"("projectId");

-- CreateIndex
CREATE INDEX "ProjectReport_status_idx" ON "ProjectReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_status_idx" ON "ApiKey"("status");

-- CreateIndex
CREATE INDEX "CategoryTrendSnapshot_category_idx" ON "CategoryTrendSnapshot"("category");

-- CreateIndex
CREATE INDEX "CategoryTrendSnapshot_snapshotDate_idx" ON "CategoryTrendSnapshot"("snapshotDate");
