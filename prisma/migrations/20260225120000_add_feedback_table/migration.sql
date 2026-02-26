-- Create feedback table for persisted feedback notes
CREATE TABLE IF NOT EXISTS "feedback" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "images_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "feedback_updated_at_idx" ON "feedback"("updated_at");
