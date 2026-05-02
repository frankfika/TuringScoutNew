-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewQueueItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "ReviewQueueItem_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SourceJobRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "rawEvidenceCreated" INTEGER NOT NULL DEFAULT 0,
    "candidatesCreated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SourceJobRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectAcknowledgement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "creatorContentId" TEXT,
    "acknowledgementType" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT,
    CONSTRAINT "ProjectAcknowledgement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectAcknowledgement_creatorContentId_fkey" FOREIGN KEY ("creatorContentId") REFERENCES "CreatorContent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectAcknowledgement_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RawEvidence" (
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
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "extractionStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RawEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RawEvidence" ("authorOrAccount", "checksum", "createdAt", "discoveredAt", "fetchStatus", "fetchedAt", "id", "language", "linkedUrls", "publishedAt", "rawContentRef", "rawTextExcerpt", "rawTitle", "sourceId", "sourceName", "sourceType", "sourceUrl") SELECT "authorOrAccount", "checksum", "createdAt", "discoveredAt", "fetchStatus", "fetchedAt", "id", "language", "linkedUrls", "publishedAt", "rawContentRef", "rawTextExcerpt", "rawTitle", "sourceId", "sourceName", "sourceType", "sourceUrl" FROM "RawEvidence";
DROP TABLE "RawEvidence";
ALTER TABLE "new_RawEvidence" RENAME TO "RawEvidence";
CREATE INDEX "RawEvidence_sourceType_idx" ON "RawEvidence"("sourceType");
CREATE INDEX "RawEvidence_fetchStatus_idx" ON "RawEvidence"("fetchStatus");
CREATE INDEX "RawEvidence_checksum_idx" ON "RawEvidence"("checksum");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "ReviewQueueItem_entityType_entityId_idx" ON "ReviewQueueItem"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ReviewQueueItem_status_idx" ON "ReviewQueueItem"("status");

-- CreateIndex
CREATE INDEX "ReviewQueueItem_priority_idx" ON "ReviewQueueItem"("priority");

-- CreateIndex
CREATE INDEX "SourceJobRun_sourceId_idx" ON "SourceJobRun"("sourceId");

-- CreateIndex
CREATE INDEX "SourceJobRun_status_idx" ON "SourceJobRun"("status");

-- CreateIndex
CREATE INDEX "ProjectAcknowledgement_projectId_idx" ON "ProjectAcknowledgement"("projectId");
