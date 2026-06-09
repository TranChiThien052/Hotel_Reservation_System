/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `branches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `branches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_card_number]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `staff` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "branches_phone_key" ON "branches"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "branches_email_key" ON "branches"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_card_number_key" ON "customers"("id_card_number");

-- CreateIndex
CREATE UNIQUE INDEX "staff_phone_key" ON "staff"("phone");
