-- Feed and dashboard indexes
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt" DESC);
CREATE INDEX "Job_authorId_createdAt_idx" ON "Job"("authorId", "createdAt" DESC);
CREATE INDEX "Job_category_idx" ON "Job"("category");
CREATE INDEX "Job_region_idx" ON "Job"("region");
CREATE INDEX "Job_isUrgent_idx" ON "Job"("isUrgent");
