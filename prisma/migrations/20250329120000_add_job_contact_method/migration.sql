-- contactMethod: способ связи (phone / telegram / whatsapp)
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "contactMethod" TEXT NOT NULL DEFAULT 'phone';
