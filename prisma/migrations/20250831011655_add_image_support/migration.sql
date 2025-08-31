-- CreateTable
CREATE TABLE "public"."locations" (
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

-- CreateTable
CREATE TABLE "public"."consumption_sessions" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location_id" TEXT,
    "who_with" TEXT NOT NULL,
    "vessel" TEXT NOT NULL,
    "accessory_used" TEXT NOT NULL,
    "my_vessel" BOOLEAN NOT NULL DEFAULT true,
    "my_substance" BOOLEAN NOT NULL DEFAULT true,
    "strain_name" TEXT NOT NULL,
    "thc_percentage" DOUBLE PRECISION,
    "purchased_legally" BOOLEAN NOT NULL DEFAULT true,
    "state_purchased" TEXT,
    "tobacco" BOOLEAN NOT NULL DEFAULT false,
    "kief" BOOLEAN NOT NULL DEFAULT false,
    "concentrate" BOOLEAN NOT NULL DEFAULT false,
    "lavender" BOOLEAN NOT NULL DEFAULT false,
    "strain_type" TEXT,
    "comments" TEXT,
    "quantity" TEXT NOT NULL,
    "quantity_legacy" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumption_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_images" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "blob_url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locations_name_idx" ON "public"."locations"("name");

-- CreateIndex
CREATE INDEX "locations_is_favorite_idx" ON "public"."locations"("is_favorite");

-- CreateIndex
CREATE INDEX "locations_usage_count_idx" ON "public"."locations"("usage_count");

-- CreateIndex
CREATE INDEX "session_images_session_id_idx" ON "public"."session_images"("session_id");

-- AddForeignKey
ALTER TABLE "public"."consumption_sessions" ADD CONSTRAINT "consumption_sessions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_images" ADD CONSTRAINT "session_images_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."consumption_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
