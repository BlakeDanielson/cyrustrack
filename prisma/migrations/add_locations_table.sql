-- Migration: Add locations table and update consumption_sessions

-- Create locations table
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "nickname" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX "locations_name_idx" ON "locations"("name");
CREATE INDEX "locations_is_favorite_idx" ON "locations"("is_favorite");
CREATE INDEX "locations_usage_count_idx" ON "locations"("usage_count");

-- Add location relationship to consumption_sessions (keeping existing fields)
ALTER TABLE "consumption_sessions" ADD COLUMN "location_id" TEXT;

-- Add foreign key constraint
ALTER TABLE "consumption_sessions" ADD CONSTRAINT "consumption_sessions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
