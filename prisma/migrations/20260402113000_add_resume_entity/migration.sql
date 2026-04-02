CREATE TABLE "Resume" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "price" TEXT,
  "region" TEXT NOT NULL,
  "contactMethod" TEXT NOT NULL DEFAULT 'phone',
  "contactPhone" TEXT NOT NULL,
  "publicContactName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Resume_status_createdAt_idx" ON "Resume"("status", "createdAt" DESC);
CREATE INDEX "Resume_authorId_createdAt_idx" ON "Resume"("authorId", "createdAt" DESC);
CREATE INDEX "Resume_category_idx" ON "Resume"("category");
CREATE INDEX "Resume_region_idx" ON "Resume"("region");

ALTER TABLE "Resume"
ADD CONSTRAINT "Resume_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
