-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule" TEXT NOT NULL DEFAULT '0 * * * *',
    "lastRunAt" DATETIME,
    "lastStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "config" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RawEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rawData" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RawEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Extraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rawEvidenceId" TEXT NOT NULL,
    "projectName" TEXT,
    "projectUrl" TEXT,
    "githubUrl" TEXT,
    "description" TEXT,
    "language" TEXT,
    "topics" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT,
    "suggestedType" TEXT,
    "extractedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Extraction_rawEvidenceId_fkey" FOREIGN KEY ("rawEvidenceId") REFERENCES "RawEvidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "githubUrl" TEXT,
    "language" TEXT,
    "topics" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "rewardValue" TEXT,
    "requirements" TEXT,
    "actionUrl" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "autoPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Opportunity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evidence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "totalScore" REAL NOT NULL,
    "dimensions" TEXT NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScoreSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoreSnapshot_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "opportunityId" TEXT,
    "highlights" TEXT NOT NULL,
    "suitableFor" TEXT NOT NULL,
    "comparisons" TEXT NOT NULL,
    "totalScore" REAL NOT NULL,
    "dimensionScores" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiModel" TEXT,
    "adminEdited" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AIReview_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Extraction_rawEvidenceId_key" ON "Extraction"("rawEvidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_slug_key" ON "Opportunity"("slug");

-- CreateIndex
CREATE INDEX "Evidence_projectId_recordedAt_idx" ON "Evidence"("projectId", "recordedAt");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_projectId_calculatedAt_idx" ON "ScoreSnapshot"("projectId", "calculatedAt");

-- CreateIndex
CREATE INDEX "AIReview_projectId_generatedAt_idx" ON "AIReview"("projectId", "generatedAt");

-- CreateIndex
CREATE INDEX "AIReview_opportunityId_generatedAt_idx" ON "AIReview"("opportunityId", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_token_key" ON "AdminSession"("token");
