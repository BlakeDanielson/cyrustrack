-- Drop the existing foreign key constraint
ALTER TABLE "public"."session_images" DROP CONSTRAINT "session_images_session_id_fkey";

-- Alter the column to allow NULL values
ALTER TABLE "public"."session_images" ALTER COLUMN "session_id" DROP NOT NULL;

-- Recreate the foreign key constraint as optional (allowing NULL)
ALTER TABLE "public"."session_images" ADD CONSTRAINT "session_images_session_id_fkey" 
FOREIGN KEY ("session_id") REFERENCES "public"."consumption_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
