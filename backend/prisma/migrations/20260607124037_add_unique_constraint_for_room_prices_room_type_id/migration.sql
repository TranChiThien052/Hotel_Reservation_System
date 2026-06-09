/*
  Warnings:

  - A unique constraint covering the columns `[room_type_id]` on the table `room_prices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "room_prices_room_type_id_key" ON "room_prices"("room_type_id");
