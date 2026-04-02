ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "publicContactName" TEXT;

UPDATE "Job" AS j
SET "publicContactName" = u."name"
FROM "User" AS u
WHERE j."authorId" = u."id"
  AND j."publicContactName" IS NULL
  AND u."name" IS NOT NULL;
