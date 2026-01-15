-- AlterTable: Change tobacco from Boolean to String
-- This migration converts the tobacco field to store specific tobacco types
-- instead of just a boolean flag

-- Step 1: Add a temporary column to store string values
ALTER TABLE "consumption_sessions" ADD COLUMN "tobacco_temp" TEXT;

-- Step 2: Migrate existing boolean values
-- If tobacco was true, set to 'Unknown', if false set to NULL
UPDATE "consumption_sessions" 
SET "tobacco_temp" = CASE 
  WHEN "tobacco" = true THEN 'Unknown'
  ELSE NULL
END;

-- Step 3: Drop the old boolean column
ALTER TABLE "consumption_sessions" DROP COLUMN "tobacco";

-- Step 4: Rename the temporary column to tobacco
ALTER TABLE "consumption_sessions" RENAME COLUMN "tobacco_temp" TO "tobacco";
