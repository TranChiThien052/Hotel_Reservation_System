-- CreateTable
CREATE TABLE "room_image" (
    "room_type_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "image_public_id" VARCHAR(500) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "room_image_image_url_key" ON "room_image"("image_url");

-- AddForeignKey
ALTER TABLE "room_image" ADD CONSTRAINT "room_image_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
