/*
  Warnings:

  - The primary key for the `password_reset_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[token_hash]` on the table `password_reset_token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "password_reset_token" DROP CONSTRAINT "password_reset_token_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_hash_key" ON "password_reset_token"("token_hash");
