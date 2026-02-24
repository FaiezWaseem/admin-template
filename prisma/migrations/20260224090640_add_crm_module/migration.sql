-- CreateTable
CREATE TABLE "crm_contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'lead',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "crm_deals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "contactId" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'lead',
    "value" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "expectedClose" DATETIME,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "crm_deals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_contacts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_contacts_email_key" ON "crm_contacts"("email");

-- CreateIndex
CREATE INDEX "crm_contacts_email_idx" ON "crm_contacts"("email");

-- CreateIndex
CREATE INDEX "crm_contacts_status_idx" ON "crm_contacts"("status");

-- CreateIndex
CREATE INDEX "crm_deals_contactId_idx" ON "crm_deals"("contactId");

-- CreateIndex
CREATE INDEX "crm_deals_stage_idx" ON "crm_deals"("stage");

-- CreateIndex
CREATE INDEX "crm_deals_expectedClose_idx" ON "crm_deals"("expectedClose");
