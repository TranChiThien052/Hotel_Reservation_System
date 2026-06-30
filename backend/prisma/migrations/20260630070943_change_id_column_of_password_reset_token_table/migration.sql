/*
  Warnings:

  - The primary key for the `password_reset_token` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "password_reset_token" DROP CONSTRAINT "password_reset_token_pkey",
ADD CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("account_id", "token_hash");
