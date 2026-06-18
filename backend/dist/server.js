// src/app.ts
import express19 from "express";
import cors from "cors";

// src/routes/branchRoutes.ts
import express from "express";

// src/config/prisma.ts
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import "process";
import * as path from "path";
import { fileURLToPath } from "url";
import "@prisma/client/runtime/client";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel accounts {\n  id                                                                 String                  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  username                                                           String                  @unique @db.VarChar(200)\n  password_hash                                                      String\n  role                                                               account_role            @default(customer)\n  status                                                             account_status          @default(active)\n  branch_id                                                          String?                 @db.Uuid\n  branches                                                           branches?               @relation(fields: [branch_id], references: [id], onUpdate: NoAction)\n  booking_services                                                   booking_services[]\n  bookings                                                           bookings[]\n  cancellation_requests_cancellation_requests_requested_byToaccounts cancellation_requests[] @relation("cancellation_requests_requested_byToaccounts")\n  cancellation_requests_cancellation_requests_resolved_byToaccounts  cancellation_requests[] @relation("cancellation_requests_resolved_byToaccounts")\n  customers                                                          customers?\n  history_transaction                                                history_transaction[]\n  invoice_fines                                                      invoice_fines[]\n  invoices                                                           invoices[]\n  payments                                                           payments[]\n  staff                                                              staff?\n}\n\nmodel booking_services {\n  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  booking_id   String    @db.Uuid\n  service_id   String    @db.Uuid\n  quantity     Int       @default(1)\n  unit_price   Decimal   @db.Decimal(12, 2)\n  total_amount Decimal   @db.Decimal(12, 2)\n  added_at     DateTime  @default(now()) @db.Timestamptz(6)\n  added_by     String?   @db.Uuid\n  accounts     accounts? @relation(fields: [added_by], references: [id], onUpdate: NoAction)\n  bookings     bookings  @relation(fields: [booking_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n  services     services  @relation(fields: [service_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n}\n\nmodel bookings {\n  id                    String                  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  booking_code          String                  @unique @db.VarChar(30)\n  branch_id             String                  @db.Uuid\n  customer_id           String                  @db.Uuid\n  room_type_id          String                  @db.Uuid\n  assigned_room_id      String?                 @db.Uuid\n  booking_type          booking_type\n  status                booking_status          @default(pending)\n  checkin_at            DateTime                @db.Timestamptz(6)\n  checkout_at           DateTime                @db.Timestamptz(6)\n  actual_checkin_at     DateTime?               @db.Timestamptz(6)\n  actual_checkout_at    DateTime?               @db.Timestamptz(6)\n  num_guests            Int                     @default(1)\n  room_price_snapshot   Decimal                 @db.Decimal(12, 2)\n  subtotal              Decimal?                @db.Decimal(12, 2)\n  discount_id           String?                 @db.Uuid\n  discount_amount       Decimal                 @default(0) @db.Decimal(12, 2)\n  total_amount          Decimal?                @db.Decimal(12, 2)\n  deposit_amount        Decimal                 @default(0) @db.Decimal(12, 2)\n  deposit_paid_at       DateTime?               @db.Timestamptz(6)\n  created_by            String?                 @db.Uuid\n  expires_at            DateTime?               @db.Timestamptz(6)\n  notes                 String?\n  created_at            DateTime                @default(now()) @db.Timestamptz(6)\n  updated_at            DateTime                @default(now()) @db.Timestamptz(6)\n  booking_services      booking_services[]\n  rooms                 rooms?                  @relation(fields: [assigned_room_id], references: [id], onUpdate: NoAction)\n  branches              branches                @relation(fields: [branch_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n  accounts              accounts?               @relation(fields: [created_by], references: [id], onUpdate: NoAction)\n  customers             customers               @relation(fields: [customer_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n  discounts             discounts?              @relation(fields: [discount_id], references: [id], onUpdate: NoAction)\n  room_types            room_types              @relation(fields: [room_type_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n  cancellation_requests cancellation_requests[]\n  invoices              invoices[]\n  payments              payments[]\n  reviews               reviews?\n\n  @@index([assigned_room_id], map: "idx_bookings_assigned_room")\n  @@index([branch_id], map: "idx_bookings_branch")\n  @@index([checkin_at], map: "idx_bookings_checkin")\n  @@index([checkout_at], map: "idx_bookings_checkout")\n  @@index([booking_code], map: "idx_bookings_code")\n  @@index([customer_id], map: "idx_bookings_customer")\n  @@index([room_type_id], map: "idx_bookings_room_type")\n  @@index([status], map: "idx_bookings_status")\n}\n\nmodel branches {\n  id            String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  name          String          @db.VarChar(150)\n  address       String\n  city          String?         @db.VarChar(100)\n  phone         String?         @unique @db.VarChar(20)\n  email         String?         @unique @db.VarChar(150)\n  description   String?\n  is_active     Boolean         @default(true)\n  accounts      accounts[]\n  bookings      bookings[]\n  discounts     discounts[]\n  fine_items    fine_items[]\n  holiday_dates holiday_dates[]\n  room_types    room_types[]\n  rooms         rooms[]\n  services      services[]\n  staff         staff[]\n}\n\nmodel cancellation_requests {\n  id                                                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  booking_id                                            String              @db.Uuid\n  requested_by                                          String?             @db.Uuid\n  reason                                                String?\n  status                                                cancellation_status @default(pending)\n  refund_amount                                         Decimal?            @db.Decimal(12, 2)\n  refund_processed_at                                   DateTime?           @db.Timestamptz(6)\n  resolved_by                                           String?             @db.Uuid\n  notes                                                 String?\n  created_at                                            DateTime            @default(now()) @db.Timestamptz(6)\n  updated_at                                            DateTime            @default(now()) @db.Timestamptz(6)\n  bookings                                              bookings            @relation(fields: [booking_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n  accounts_cancellation_requests_requested_byToaccounts accounts?           @relation("cancellation_requests_requested_byToaccounts", fields: [requested_by], references: [id], onUpdate: NoAction)\n  accounts_cancellation_requests_resolved_byToaccounts  accounts?           @relation("cancellation_requests_resolved_byToaccounts", fields: [resolved_by], references: [id], onUpdate: NoAction)\n}\n\nmodel customers {\n  id             String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  account_id     String?    @unique @db.Uuid\n  full_name      String     @db.VarChar(200)\n  phone          String?    @unique @db.VarChar(20)\n  email          String?    @unique @db.VarChar(200)\n  id_card_number String?    @unique @db.VarChar(50)\n  nationality    String?    @db.VarChar(100)\n  date_of_birth  DateTime?  @db.Date\n  address        String?\n  bookings       bookings[]\n  accounts       accounts?  @relation(fields: [account_id], references: [id], onUpdate: NoAction)\n  reviews        reviews[]\n}\n\nmodel discounts {\n  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  branch_id       String?       @db.Uuid\n  code            String        @unique @db.VarChar(50)\n  description     String?\n  discount_type   discount_type\n  discount_value  Decimal       @db.Decimal(10, 2)\n  min_order_value Decimal?      @default(0) @db.Decimal(12, 2)\n  usage_limit     Int?\n  used_count      Int           @default(0)\n  valid_from      DateTime?     @default(now()) @db.Timestamptz(6)\n  valid_to        DateTime?     @db.Timestamptz(6)\n  is_active       Boolean       @default(true)\n  bookings        bookings[]\n  branches        branches?     @relation(fields: [branch_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n\n  @@index([code], map: "idx_discounts_code")\n}\n\nmodel fine_items {\n  id            String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  branch_id     String?         @db.Uuid\n  name          String          @db.VarChar(200)\n  description   String?\n  price         Decimal         @db.Decimal(12, 2)\n  branches      branches?       @relation(fields: [branch_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n  invoice_fines invoice_fines[]\n}\n\nmodel history_transaction {\n  id          BigInt    @id @default(autoincrement())\n  account_id  String?   @db.Uuid\n  action      String    @db.VarChar(100)\n  target_type String?   @db.VarChar(100)\n  target_id   String?   @db.Uuid\n  description String?\n  metadata    Json?\n  created_at  DateTime  @default(now()) @db.Timestamptz(6)\n  accounts    accounts? @relation(fields: [account_id], references: [id], onUpdate: NoAction)\n\n  @@index([account_id], map: "idx_logs_account")\n  @@index([created_at(sort: Desc)], map: "idx_logs_created_at")\n  @@index([target_type, target_id], map: "idx_logs_target")\n}\n\nmodel holiday_dates {\n  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  branch_id String?   @db.Uuid\n  date      DateTime  @db.Date\n  name      String?   @db.VarChar(150)\n  branches  branches? @relation(fields: [branch_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n}\n\nmodel invoice_fines {\n  id           String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  invoice_id   String      @db.Uuid\n  fine_item_id String?     @db.Uuid\n  description  String      @db.VarChar(300)\n  amount       Decimal     @db.Decimal(12, 2)\n  added_by     String?     @db.Uuid\n  accounts     accounts?   @relation(fields: [added_by], references: [id], onUpdate: NoAction)\n  fine_items   fine_items? @relation(fields: [fine_item_id], references: [id], onUpdate: NoAction)\n  invoices     invoices    @relation(fields: [invoice_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n}\n\nmodel invoices {\n  id                 String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  invoice_code       String          @unique @db.VarChar(30)\n  booking_id         String          @db.Uuid\n  room_charge        Decimal         @default(0) @db.Decimal(12, 2)\n  service_charge     Decimal         @default(0) @db.Decimal(12, 2)\n  fine_charge        Decimal         @default(0) @db.Decimal(12, 2)\n  late_checkout_fee  Decimal         @default(0) @db.Decimal(12, 2)\n  early_checkout_fee Decimal         @default(0) @db.Decimal(12, 2)\n  discount_amount    Decimal         @default(0) @db.Decimal(12, 2)\n  total_amount       Decimal         @db.Decimal(12, 2)\n  deposit_used       Decimal         @default(0) @db.Decimal(12, 2)\n  amount_due         Decimal         @db.Decimal(12, 2)\n  refund_amount      Decimal         @default(0) @db.Decimal(12, 2)\n  notes              String?\n  issued_by          String?         @db.Uuid\n  issued_at          DateTime        @default(now()) @db.Timestamptz(6)\n  created_at         DateTime        @default(now()) @db.Timestamptz(6)\n  updated_at         DateTime        @default(now()) @db.Timestamptz(6)\n  invoice_fines      invoice_fines[]\n  bookings           bookings        @relation(fields: [booking_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n  accounts           accounts?       @relation(fields: [issued_by], references: [id], onUpdate: NoAction)\n  payments           payments[]\n}\n\nmodel payments {\n  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  booking_id      String         @db.Uuid\n  invoice_id      String?        @db.Uuid\n  payment_method  payment_method\n  status          payment_status @default(pending)\n  amount          Decimal        @db.Decimal(12, 2)\n  is_deposit      Boolean        @default(false)\n  transaction_ref String?        @db.VarChar(200)\n  paid_at         DateTime?      @db.Timestamptz(6)\n  processed_by    String?        @db.Uuid\n  notes           String?\n  created_at      DateTime       @default(now()) @db.Timestamptz(6)\n  updated_at      DateTime       @default(now()) @db.Timestamptz(6)\n  bookings        bookings       @relation(fields: [booking_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n  invoices        invoices?      @relation(fields: [invoice_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n  accounts        accounts?      @relation(fields: [processed_by], references: [id], onUpdate: NoAction)\n\n  @@index([booking_id], map: "idx_payments_booking")\n  @@index([status], map: "idx_payments_status")\n}\n\n/// This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.\nmodel reviews {\n  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  booking_id  String    @unique @db.Uuid\n  customer_id String    @db.Uuid\n  rating      Int       @db.SmallInt\n  comment     String?\n  is_visible  Boolean   @default(true)\n  created_at  DateTime  @default(now()) @db.Timestamptz(6)\n  updated_at  DateTime  @default(now()) @db.Timestamptz(6)\n  bookings    bookings  @relation(fields: [booking_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n  customers   customers @relation(fields: [customer_id], references: [id], onDelete: NoAction, onUpdate: NoAction)\n}\n\nmodel room_prices {\n  id             String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  room_type_id   String     @unique @db.Uuid\n  price_per_day  Decimal?   @db.Decimal(12, 2)\n  price_per_hour Decimal?   @db.Decimal(12, 2)\n  weekend_rate   Decimal    @default(1.30) @db.Decimal(5, 2)\n  holiday_rate   Decimal    @default(2.00) @db.Decimal(5, 2)\n  effective_from DateTime   @default(dbgenerated("CURRENT_DATE")) @db.Date\n  effective_to   DateTime?  @db.Date\n  room_types     room_types @relation(fields: [room_type_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n}\n\nmodel room_types {\n  id          String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  branch_id   String        @db.Uuid\n  name        String        @db.VarChar(150)\n  description String?\n  max_guests  Int           @default(2)\n  images      String[]\n  is_active   Boolean       @default(true)\n  bookings    bookings[]\n  room_prices room_prices[]\n  branches    branches      @relation(fields: [branch_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n  rooms       rooms[]\n\n  @@index([branch_id], map: "idx_room_types_branch")\n}\n\nmodel rooms {\n  id           String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  branch_id    String      @db.Uuid\n  room_type_id String      @db.Uuid\n  room_number  String      @db.VarChar(20)\n  floor        Int?\n  basic        String[]\n  extra        String[]\n  status       room_status @default(unavailable)\n  notes        String?\n  is_active    Boolean     @default(true)\n  bookings     bookings[]\n  branches     branches    @relation(fields: [branch_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n  room_types   room_types  @relation(fields: [room_type_id], references: [id], onUpdate: NoAction)\n\n  @@unique([branch_id, room_number])\n  @@index([branch_id], map: "idx_rooms_branch")\n  @@index([status], map: "idx_rooms_status")\n  @@index([room_type_id], map: "idx_rooms_type")\n}\n\nmodel services {\n  id               String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  branch_id        String?            @db.Uuid\n  name             String             @db.VarChar(150)\n  description      String?\n  price            Decimal            @db.Decimal(12, 2)\n  unit             String?            @db.VarChar(50)\n  is_active        Boolean            @default(true)\n  booking_services booking_services[]\n  branches         branches?          @relation(fields: [branch_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n}\n\nmodel staff {\n  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  branch_id  String   @db.Uuid\n  account_id String   @unique @db.Uuid\n  full_name  String   @db.VarChar(200)\n  phone      String?  @unique @db.VarChar(20)\n  position   String?  @db.VarChar(100)\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n  accounts   accounts @relation(fields: [account_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n  branches   branches @relation(fields: [branch_id], references: [id], onDelete: Cascade, onUpdate: NoAction)\n}\n\nenum account_role {\n  customer\n  staff\n  manager\n  admin\n}\n\nenum account_status {\n  active\n  inactive\n}\n\nenum booking_status {\n  pending\n  confirmed\n  checked_in\n  checked_out\n  completed\n  cancelled\n}\n\nenum booking_type {\n  daily\n  hourly\n}\n\nenum cancellation_status {\n  pending\n  confirmed\n  failed\n}\n\nenum discount_type {\n  percentage\n  fixed_amount\n}\n\nenum payment_method {\n  cash\n  bank_transfer\n  online\n}\n\nenum payment_status {\n  pending\n  paid\n  refunded\n  failed\n}\n\nenum room_status {\n  unavailable\n  available\n  occupied\n  cleaning\n  maintenance\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"accounts":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"username","kind":"scalar","type":"String"},{"name":"password_hash","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"account_role"},{"name":"status","kind":"enum","type":"account_status"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"branches","kind":"object","type":"branches","relationName":"accountsTobranches"},{"name":"booking_services","kind":"object","type":"booking_services","relationName":"accountsTobooking_services"},{"name":"bookings","kind":"object","type":"bookings","relationName":"accountsTobookings"},{"name":"cancellation_requests_cancellation_requests_requested_byToaccounts","kind":"object","type":"cancellation_requests","relationName":"cancellation_requests_requested_byToaccounts"},{"name":"cancellation_requests_cancellation_requests_resolved_byToaccounts","kind":"object","type":"cancellation_requests","relationName":"cancellation_requests_resolved_byToaccounts"},{"name":"customers","kind":"object","type":"customers","relationName":"accountsTocustomers"},{"name":"history_transaction","kind":"object","type":"history_transaction","relationName":"accountsTohistory_transaction"},{"name":"invoice_fines","kind":"object","type":"invoice_fines","relationName":"accountsToinvoice_fines"},{"name":"invoices","kind":"object","type":"invoices","relationName":"accountsToinvoices"},{"name":"payments","kind":"object","type":"payments","relationName":"accountsTopayments"},{"name":"staff","kind":"object","type":"staff","relationName":"accountsTostaff"}],"dbName":null},"booking_services":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"booking_id","kind":"scalar","type":"String"},{"name":"service_id","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"unit_price","kind":"scalar","type":"Decimal"},{"name":"total_amount","kind":"scalar","type":"Decimal"},{"name":"added_at","kind":"scalar","type":"DateTime"},{"name":"added_by","kind":"scalar","type":"String"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsTobooking_services"},{"name":"bookings","kind":"object","type":"bookings","relationName":"booking_servicesTobookings"},{"name":"services","kind":"object","type":"services","relationName":"booking_servicesToservices"}],"dbName":null},"bookings":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"booking_code","kind":"scalar","type":"String"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"customer_id","kind":"scalar","type":"String"},{"name":"room_type_id","kind":"scalar","type":"String"},{"name":"assigned_room_id","kind":"scalar","type":"String"},{"name":"booking_type","kind":"enum","type":"booking_type"},{"name":"status","kind":"enum","type":"booking_status"},{"name":"checkin_at","kind":"scalar","type":"DateTime"},{"name":"checkout_at","kind":"scalar","type":"DateTime"},{"name":"actual_checkin_at","kind":"scalar","type":"DateTime"},{"name":"actual_checkout_at","kind":"scalar","type":"DateTime"},{"name":"num_guests","kind":"scalar","type":"Int"},{"name":"room_price_snapshot","kind":"scalar","type":"Decimal"},{"name":"subtotal","kind":"scalar","type":"Decimal"},{"name":"discount_id","kind":"scalar","type":"String"},{"name":"discount_amount","kind":"scalar","type":"Decimal"},{"name":"total_amount","kind":"scalar","type":"Decimal"},{"name":"deposit_amount","kind":"scalar","type":"Decimal"},{"name":"deposit_paid_at","kind":"scalar","type":"DateTime"},{"name":"created_by","kind":"scalar","type":"String"},{"name":"expires_at","kind":"scalar","type":"DateTime"},{"name":"notes","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"booking_services","kind":"object","type":"booking_services","relationName":"booking_servicesTobookings"},{"name":"rooms","kind":"object","type":"rooms","relationName":"bookingsTorooms"},{"name":"branches","kind":"object","type":"branches","relationName":"bookingsTobranches"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsTobookings"},{"name":"customers","kind":"object","type":"customers","relationName":"bookingsTocustomers"},{"name":"discounts","kind":"object","type":"discounts","relationName":"bookingsTodiscounts"},{"name":"room_types","kind":"object","type":"room_types","relationName":"bookingsToroom_types"},{"name":"cancellation_requests","kind":"object","type":"cancellation_requests","relationName":"bookingsTocancellation_requests"},{"name":"invoices","kind":"object","type":"invoices","relationName":"bookingsToinvoices"},{"name":"payments","kind":"object","type":"payments","relationName":"bookingsTopayments"},{"name":"reviews","kind":"object","type":"reviews","relationName":"bookingsToreviews"}],"dbName":null},"branches":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"is_active","kind":"scalar","type":"Boolean"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsTobranches"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsTobranches"},{"name":"discounts","kind":"object","type":"discounts","relationName":"branchesTodiscounts"},{"name":"fine_items","kind":"object","type":"fine_items","relationName":"branchesTofine_items"},{"name":"holiday_dates","kind":"object","type":"holiday_dates","relationName":"branchesToholiday_dates"},{"name":"room_types","kind":"object","type":"room_types","relationName":"branchesToroom_types"},{"name":"rooms","kind":"object","type":"rooms","relationName":"branchesTorooms"},{"name":"services","kind":"object","type":"services","relationName":"branchesToservices"},{"name":"staff","kind":"object","type":"staff","relationName":"branchesTostaff"}],"dbName":null},"cancellation_requests":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"booking_id","kind":"scalar","type":"String"},{"name":"requested_by","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"cancellation_status"},{"name":"refund_amount","kind":"scalar","type":"Decimal"},{"name":"refund_processed_at","kind":"scalar","type":"DateTime"},{"name":"resolved_by","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsTocancellation_requests"},{"name":"accounts_cancellation_requests_requested_byToaccounts","kind":"object","type":"accounts","relationName":"cancellation_requests_requested_byToaccounts"},{"name":"accounts_cancellation_requests_resolved_byToaccounts","kind":"object","type":"accounts","relationName":"cancellation_requests_resolved_byToaccounts"}],"dbName":null},"customers":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"account_id","kind":"scalar","type":"String"},{"name":"full_name","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"id_card_number","kind":"scalar","type":"String"},{"name":"nationality","kind":"scalar","type":"String"},{"name":"date_of_birth","kind":"scalar","type":"DateTime"},{"name":"address","kind":"scalar","type":"String"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsTocustomers"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsTocustomers"},{"name":"reviews","kind":"object","type":"reviews","relationName":"customersToreviews"}],"dbName":null},"discounts":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"discount_type","kind":"enum","type":"discount_type"},{"name":"discount_value","kind":"scalar","type":"Decimal"},{"name":"min_order_value","kind":"scalar","type":"Decimal"},{"name":"usage_limit","kind":"scalar","type":"Int"},{"name":"used_count","kind":"scalar","type":"Int"},{"name":"valid_from","kind":"scalar","type":"DateTime"},{"name":"valid_to","kind":"scalar","type":"DateTime"},{"name":"is_active","kind":"scalar","type":"Boolean"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsTodiscounts"},{"name":"branches","kind":"object","type":"branches","relationName":"branchesTodiscounts"}],"dbName":null},"fine_items":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"branches","kind":"object","type":"branches","relationName":"branchesTofine_items"},{"name":"invoice_fines","kind":"object","type":"invoice_fines","relationName":"fine_itemsToinvoice_fines"}],"dbName":null},"history_transaction":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"account_id","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"target_type","kind":"scalar","type":"String"},{"name":"target_id","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsTohistory_transaction"}],"dbName":null},"holiday_dates":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"name","kind":"scalar","type":"String"},{"name":"branches","kind":"object","type":"branches","relationName":"branchesToholiday_dates"}],"dbName":null},"invoice_fines":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"invoice_id","kind":"scalar","type":"String"},{"name":"fine_item_id","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"added_by","kind":"scalar","type":"String"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsToinvoice_fines"},{"name":"fine_items","kind":"object","type":"fine_items","relationName":"fine_itemsToinvoice_fines"},{"name":"invoices","kind":"object","type":"invoices","relationName":"invoice_finesToinvoices"}],"dbName":null},"invoices":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"invoice_code","kind":"scalar","type":"String"},{"name":"booking_id","kind":"scalar","type":"String"},{"name":"room_charge","kind":"scalar","type":"Decimal"},{"name":"service_charge","kind":"scalar","type":"Decimal"},{"name":"fine_charge","kind":"scalar","type":"Decimal"},{"name":"late_checkout_fee","kind":"scalar","type":"Decimal"},{"name":"early_checkout_fee","kind":"scalar","type":"Decimal"},{"name":"discount_amount","kind":"scalar","type":"Decimal"},{"name":"total_amount","kind":"scalar","type":"Decimal"},{"name":"deposit_used","kind":"scalar","type":"Decimal"},{"name":"amount_due","kind":"scalar","type":"Decimal"},{"name":"refund_amount","kind":"scalar","type":"Decimal"},{"name":"notes","kind":"scalar","type":"String"},{"name":"issued_by","kind":"scalar","type":"String"},{"name":"issued_at","kind":"scalar","type":"DateTime"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"invoice_fines","kind":"object","type":"invoice_fines","relationName":"invoice_finesToinvoices"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsToinvoices"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsToinvoices"},{"name":"payments","kind":"object","type":"payments","relationName":"invoicesTopayments"}],"dbName":null},"payments":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"booking_id","kind":"scalar","type":"String"},{"name":"invoice_id","kind":"scalar","type":"String"},{"name":"payment_method","kind":"enum","type":"payment_method"},{"name":"status","kind":"enum","type":"payment_status"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"is_deposit","kind":"scalar","type":"Boolean"},{"name":"transaction_ref","kind":"scalar","type":"String"},{"name":"paid_at","kind":"scalar","type":"DateTime"},{"name":"processed_by","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsTopayments"},{"name":"invoices","kind":"object","type":"invoices","relationName":"invoicesTopayments"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsTopayments"}],"dbName":null},"reviews":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"booking_id","kind":"scalar","type":"String"},{"name":"customer_id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"is_visible","kind":"scalar","type":"Boolean"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsToreviews"},{"name":"customers","kind":"object","type":"customers","relationName":"customersToreviews"}],"dbName":null},"room_prices":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"room_type_id","kind":"scalar","type":"String"},{"name":"price_per_day","kind":"scalar","type":"Decimal"},{"name":"price_per_hour","kind":"scalar","type":"Decimal"},{"name":"weekend_rate","kind":"scalar","type":"Decimal"},{"name":"holiday_rate","kind":"scalar","type":"Decimal"},{"name":"effective_from","kind":"scalar","type":"DateTime"},{"name":"effective_to","kind":"scalar","type":"DateTime"},{"name":"room_types","kind":"object","type":"room_types","relationName":"room_pricesToroom_types"}],"dbName":null},"room_types":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"max_guests","kind":"scalar","type":"Int"},{"name":"images","kind":"scalar","type":"String"},{"name":"is_active","kind":"scalar","type":"Boolean"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsToroom_types"},{"name":"room_prices","kind":"object","type":"room_prices","relationName":"room_pricesToroom_types"},{"name":"branches","kind":"object","type":"branches","relationName":"branchesToroom_types"},{"name":"rooms","kind":"object","type":"rooms","relationName":"room_typesTorooms"}],"dbName":null},"rooms":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"room_type_id","kind":"scalar","type":"String"},{"name":"room_number","kind":"scalar","type":"String"},{"name":"floor","kind":"scalar","type":"Int"},{"name":"basic","kind":"scalar","type":"String"},{"name":"extra","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"room_status"},{"name":"notes","kind":"scalar","type":"String"},{"name":"is_active","kind":"scalar","type":"Boolean"},{"name":"bookings","kind":"object","type":"bookings","relationName":"bookingsTorooms"},{"name":"branches","kind":"object","type":"branches","relationName":"branchesTorooms"},{"name":"room_types","kind":"object","type":"room_types","relationName":"room_typesTorooms"}],"dbName":null},"services":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"unit","kind":"scalar","type":"String"},{"name":"is_active","kind":"scalar","type":"Boolean"},{"name":"booking_services","kind":"object","type":"booking_services","relationName":"booking_servicesToservices"},{"name":"branches","kind":"object","type":"branches","relationName":"branchesToservices"}],"dbName":null},"staff":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"branch_id","kind":"scalar","type":"String"},{"name":"account_id","kind":"scalar","type":"String"},{"name":"full_name","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"position","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"accounts","kind":"object","type":"accounts","relationName":"accountsTostaff"},{"name":"branches","kind":"object","type":"branches","relationName":"branchesTostaff"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","accounts","bookings","booking_services","branches","_count","services","room_types","room_prices","rooms","customers","reviews","discounts","accounts_cancellation_requests_requested_byToaccounts","accounts_cancellation_requests_resolved_byToaccounts","cancellation_requests","invoice_fines","fine_items","invoices","payments","holiday_dates","staff","cancellation_requests_cancellation_requests_requested_byToaccounts","cancellation_requests_cancellation_requests_resolved_byToaccounts","history_transaction","accounts.findUnique","accounts.findUniqueOrThrow","accounts.findFirst","accounts.findFirstOrThrow","accounts.findMany","data","accounts.createOne","accounts.createMany","accounts.createManyAndReturn","accounts.updateOne","accounts.updateMany","accounts.updateManyAndReturn","create","update","accounts.upsertOne","accounts.deleteOne","accounts.deleteMany","having","_min","_max","accounts.groupBy","accounts.aggregate","booking_services.findUnique","booking_services.findUniqueOrThrow","booking_services.findFirst","booking_services.findFirstOrThrow","booking_services.findMany","booking_services.createOne","booking_services.createMany","booking_services.createManyAndReturn","booking_services.updateOne","booking_services.updateMany","booking_services.updateManyAndReturn","booking_services.upsertOne","booking_services.deleteOne","booking_services.deleteMany","_avg","_sum","booking_services.groupBy","booking_services.aggregate","bookings.findUnique","bookings.findUniqueOrThrow","bookings.findFirst","bookings.findFirstOrThrow","bookings.findMany","bookings.createOne","bookings.createMany","bookings.createManyAndReturn","bookings.updateOne","bookings.updateMany","bookings.updateManyAndReturn","bookings.upsertOne","bookings.deleteOne","bookings.deleteMany","bookings.groupBy","bookings.aggregate","branches.findUnique","branches.findUniqueOrThrow","branches.findFirst","branches.findFirstOrThrow","branches.findMany","branches.createOne","branches.createMany","branches.createManyAndReturn","branches.updateOne","branches.updateMany","branches.updateManyAndReturn","branches.upsertOne","branches.deleteOne","branches.deleteMany","branches.groupBy","branches.aggregate","cancellation_requests.findUnique","cancellation_requests.findUniqueOrThrow","cancellation_requests.findFirst","cancellation_requests.findFirstOrThrow","cancellation_requests.findMany","cancellation_requests.createOne","cancellation_requests.createMany","cancellation_requests.createManyAndReturn","cancellation_requests.updateOne","cancellation_requests.updateMany","cancellation_requests.updateManyAndReturn","cancellation_requests.upsertOne","cancellation_requests.deleteOne","cancellation_requests.deleteMany","cancellation_requests.groupBy","cancellation_requests.aggregate","customers.findUnique","customers.findUniqueOrThrow","customers.findFirst","customers.findFirstOrThrow","customers.findMany","customers.createOne","customers.createMany","customers.createManyAndReturn","customers.updateOne","customers.updateMany","customers.updateManyAndReturn","customers.upsertOne","customers.deleteOne","customers.deleteMany","customers.groupBy","customers.aggregate","discounts.findUnique","discounts.findUniqueOrThrow","discounts.findFirst","discounts.findFirstOrThrow","discounts.findMany","discounts.createOne","discounts.createMany","discounts.createManyAndReturn","discounts.updateOne","discounts.updateMany","discounts.updateManyAndReturn","discounts.upsertOne","discounts.deleteOne","discounts.deleteMany","discounts.groupBy","discounts.aggregate","fine_items.findUnique","fine_items.findUniqueOrThrow","fine_items.findFirst","fine_items.findFirstOrThrow","fine_items.findMany","fine_items.createOne","fine_items.createMany","fine_items.createManyAndReturn","fine_items.updateOne","fine_items.updateMany","fine_items.updateManyAndReturn","fine_items.upsertOne","fine_items.deleteOne","fine_items.deleteMany","fine_items.groupBy","fine_items.aggregate","history_transaction.findUnique","history_transaction.findUniqueOrThrow","history_transaction.findFirst","history_transaction.findFirstOrThrow","history_transaction.findMany","history_transaction.createOne","history_transaction.createMany","history_transaction.createManyAndReturn","history_transaction.updateOne","history_transaction.updateMany","history_transaction.updateManyAndReturn","history_transaction.upsertOne","history_transaction.deleteOne","history_transaction.deleteMany","history_transaction.groupBy","history_transaction.aggregate","holiday_dates.findUnique","holiday_dates.findUniqueOrThrow","holiday_dates.findFirst","holiday_dates.findFirstOrThrow","holiday_dates.findMany","holiday_dates.createOne","holiday_dates.createMany","holiday_dates.createManyAndReturn","holiday_dates.updateOne","holiday_dates.updateMany","holiday_dates.updateManyAndReturn","holiday_dates.upsertOne","holiday_dates.deleteOne","holiday_dates.deleteMany","holiday_dates.groupBy","holiday_dates.aggregate","invoice_fines.findUnique","invoice_fines.findUniqueOrThrow","invoice_fines.findFirst","invoice_fines.findFirstOrThrow","invoice_fines.findMany","invoice_fines.createOne","invoice_fines.createMany","invoice_fines.createManyAndReturn","invoice_fines.updateOne","invoice_fines.updateMany","invoice_fines.updateManyAndReturn","invoice_fines.upsertOne","invoice_fines.deleteOne","invoice_fines.deleteMany","invoice_fines.groupBy","invoice_fines.aggregate","invoices.findUnique","invoices.findUniqueOrThrow","invoices.findFirst","invoices.findFirstOrThrow","invoices.findMany","invoices.createOne","invoices.createMany","invoices.createManyAndReturn","invoices.updateOne","invoices.updateMany","invoices.updateManyAndReturn","invoices.upsertOne","invoices.deleteOne","invoices.deleteMany","invoices.groupBy","invoices.aggregate","payments.findUnique","payments.findUniqueOrThrow","payments.findFirst","payments.findFirstOrThrow","payments.findMany","payments.createOne","payments.createMany","payments.createManyAndReturn","payments.updateOne","payments.updateMany","payments.updateManyAndReturn","payments.upsertOne","payments.deleteOne","payments.deleteMany","payments.groupBy","payments.aggregate","reviews.findUnique","reviews.findUniqueOrThrow","reviews.findFirst","reviews.findFirstOrThrow","reviews.findMany","reviews.createOne","reviews.createMany","reviews.createManyAndReturn","reviews.updateOne","reviews.updateMany","reviews.updateManyAndReturn","reviews.upsertOne","reviews.deleteOne","reviews.deleteMany","reviews.groupBy","reviews.aggregate","room_prices.findUnique","room_prices.findUniqueOrThrow","room_prices.findFirst","room_prices.findFirstOrThrow","room_prices.findMany","room_prices.createOne","room_prices.createMany","room_prices.createManyAndReturn","room_prices.updateOne","room_prices.updateMany","room_prices.updateManyAndReturn","room_prices.upsertOne","room_prices.deleteOne","room_prices.deleteMany","room_prices.groupBy","room_prices.aggregate","room_types.findUnique","room_types.findUniqueOrThrow","room_types.findFirst","room_types.findFirstOrThrow","room_types.findMany","room_types.createOne","room_types.createMany","room_types.createManyAndReturn","room_types.updateOne","room_types.updateMany","room_types.updateManyAndReturn","room_types.upsertOne","room_types.deleteOne","room_types.deleteMany","room_types.groupBy","room_types.aggregate","rooms.findUnique","rooms.findUniqueOrThrow","rooms.findFirst","rooms.findFirstOrThrow","rooms.findMany","rooms.createOne","rooms.createMany","rooms.createManyAndReturn","rooms.updateOne","rooms.updateMany","rooms.updateManyAndReturn","rooms.upsertOne","rooms.deleteOne","rooms.deleteMany","rooms.groupBy","rooms.aggregate","services.findUnique","services.findUniqueOrThrow","services.findFirst","services.findFirstOrThrow","services.findMany","services.createOne","services.createMany","services.createManyAndReturn","services.updateOne","services.updateMany","services.updateManyAndReturn","services.upsertOne","services.deleteOne","services.deleteMany","services.groupBy","services.aggregate","staff.findUnique","staff.findUniqueOrThrow","staff.findFirst","staff.findFirstOrThrow","staff.findMany","staff.createOne","staff.createMany","staff.createManyAndReturn","staff.updateOne","staff.updateMany","staff.updateManyAndReturn","staff.upsertOne","staff.deleteOne","staff.deleteMany","staff.groupBy","staff.aggregate","AND","OR","NOT","id","branch_id","account_id","full_name","phone","position","created_at","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","name","description","price","unit","is_active","room_type_id","room_number","floor","basic","extra","room_status","status","notes","has","hasEvery","hasSome","max_guests","images","price_per_day","price_per_hour","weekend_rate","holiday_rate","effective_from","effective_to","booking_id","customer_id","rating","comment","is_visible","updated_at","invoice_id","payment_method","payment_status","amount","is_deposit","transaction_ref","paid_at","processed_by","invoice_code","room_charge","service_charge","fine_charge","late_checkout_fee","early_checkout_fee","discount_amount","total_amount","deposit_used","amount_due","refund_amount","issued_by","issued_at","fine_item_id","added_by","date","action","target_type","target_id","metadata","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","code","discount_type","discount_value","min_order_value","usage_limit","used_count","valid_from","valid_to","email","id_card_number","nationality","date_of_birth","address","every","some","none","requested_by","reason","cancellation_status","refund_processed_at","resolved_by","city","booking_code","assigned_room_id","booking_type","booking_status","checkin_at","checkout_at","actual_checkin_at","actual_checkout_at","num_guests","room_price_snapshot","subtotal","discount_id","deposit_amount","deposit_paid_at","created_by","expires_at","service_id","quantity","unit_price","added_at","username","password_hash","account_role","role","account_status","branch_id_room_number","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
  graph: "vwy_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-gIQANIFACH7AhAA0gUAIfwCEADHBQAh_QIQAMcFACH-AkAAvgUAIf8CQACZBQAhBAkAAOgKACD6AgAA9wUAIPsCAAD3BQAg_wIAAPcFACAMCQAA5QUAINMCAADmBQAw1AIAABgAENUCAADmBQAw1gIBAAAAAe0CAQAAAAH6AhAA0gUAIfsCEADSBQAh_AIQAMcFACH9AhAAxwUAIf4CQAC-BQAh_wJAAJkFACEDAAAAGAAgAQAAGQAwAgAAGgAgBQQAANgIACAGAADfCgAgCQAA6AoAIO8CAAD3BQAg9AIAAPcFACARBAAAmgUAIAYAAMUFACAJAADlBQAg0wIAAOMFADDUAgAAFAAQ1QIAAOMFADDWAgEAAAAB1wIBAMEFACHsAiAAowUAIe0CAQDBBQAh7gIBAJcFACHvAgIA0wUAIfACAADuBAAg8QIAAO4EACDzAgAA5AXzAiL0AgEAmAUAIdcDAADiBQAgAwAAABQAIAEAABwAMAIAAB0AIAEAAAAIACABAAAAGAAgAQAAABQAIAEAAAAIACABAAAABQAgAwAAAAgAIAEAAAkAMAIAAAoAIAEAAAAFACANBAAA1wUAIAwAAOEFACDTAgAA4AUAMNQCAAAmABDVAgAA4AUAMNYCAQDBBQAh3AJAAL4FACGAAwEAwQUAIYEDAQDBBQAhggMCAMsFACGDAwEAmAUAIYQDIACjBQAhhQNAAL4FACEDBAAA4woAIAwAAOcKACCDAwAA9wUAIA0EAADXBQAgDAAA4QUAINMCAADgBQAw1AIAACYAENUCAADgBQAw1gIBAAAAAdwCQAC-BQAhgAMBAAAAAYEDAQDBBQAhggMCAMsFACGDAwEAmAUAIYQDIACjBQAhhQNAAL4FACEDAAAAJgAgAQAAJwAwAgAAKAAgAQAAAAgAIAEAAAAmACARBAAAmgUAIAYAAMkFACDTAgAA0AUAMNQCAAAsABDVAgAA0AUAMNYCAQDBBQAh1wIBALwFACHpAgEAmAUAIewCIACjBQAhqAMBAJcFACGpAwAA0QWqAyKqAxAAxwUAIasDEADSBQAhrAMCANMFACGtAwIAywUAIa4DQACZBQAhrwNAAJkFACEBAAAALAAgAwAAAAgAIAEAAAkAMAIAAAoAIAEAAAADACABAAAACAAgEQQAANcFACAPAACbBQAgEAAAmwUAINMCAADeBQAw1AIAADEAENUCAADeBQAw1gIBAMEFACHcAkAAvgUAIfMCAADfBbsDIvQCAQCYBQAhgAMBAMEFACGFA0AAvgUAIZgDEADSBQAhuAMBALwFACG5AwEAmAUAIbsDQACZBQAhvAMBALwFACEJBAAA4woAIA8AANkIACAQAADZCAAg9AIAAPcFACCYAwAA9wUAILgDAAD3BQAguQMAAPcFACC7AwAA9wUAILwDAAD3BQAgEQQAANcFACAPAACbBQAgEAAAmwUAINMCAADeBQAw1AIAADEAENUCAADeBQAw1gIBAAAAAdwCQAC-BQAh8wIAAN8FuwMi9AIBAJgFACGAAwEAwQUAIYUDQAC-BQAhmAMQANIFACG4AwEAvAUAIbkDAQCYBQAhuwNAAJkFACG8AwEAvAUAIQMAAAAxACABAAAyADACAAAzACABAAAABQAgAQAAAAUAIBkDAACbBQAgBAAA1wUAIBIAAM8FACAVAADdBQAg0wIAANwFADDUAgAANwAQ1QIAANwFADDWAgEAwQUAIdwCQAC-BQAh9AIBAJgFACGAAwEAwQUAIYUDQAC-BQAhjgMBAJcFACGPAxAAxwUAIZADEADHBQAhkQMQAMcFACGSAxAAxwUAIZMDEADHBQAhlAMQAMcFACGVAxAAxwUAIZYDEADHBQAhlwMQAMcFACGYAxAAxwUAIZkDAQC8BQAhmgNAAL4FACEGAwAA2QgAIAQAAOMKACASAADiCgAgFQAA5goAIPQCAAD3BQAgmQMAAPcFACAZAwAAmwUAIAQAANcFACASAADPBQAgFQAA3QUAINMCAADcBQAw1AIAADcAENUCAADcBQAw1gIBAAAAAdwCQAC-BQAh9AIBAJgFACGAAwEAwQUAIYUDQAC-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-wUAIZUDEACHBgAhnAMBAPwFACHOAwEA-wUAIc8DAgCVBgAh0AMQAIcGACHRA0AA_QUAIQIAAAAOACAgAACuAQAgCNYCAQD7BQAhgAMBAPsFACGVAxAAhwYAIZwDAQD8BQAhzgMBAPsFACHPAwIAlQYAIdADEACHBgAh0QNAAP0FACECAAAADAAgIAAAsAEAIAIAAAAMACAgAACwAQAgAQAAAAUAIAMAAAAOACAnAACoAQAgKAAArgEAIAEAAAAOACABAAAADAAgBgcAANUKACAtAADYCgAgLgAA1woAID8AANYKACBAAADZCgAgnAMAAPcFACAL0wIAALMFADDUAgAAuAEAENUCAACzBQAw1gIBANYEACGAAwEA1gQAIZUDEADlBAAhnAMBAOQEACHOAwEA1gQAIc8DAgD1BAAh0AMQAOUEACHRA0AA2QQAIQMAAAAMACABAAC3AQAwLAAAuAEAIAMAAAAMACABAAANADACAAAOACABAAAACgAgAQAAAAoAIAMAAAAIACABAAAJADACAAAKACADAAAACAAgAQAACQAwAgAACgAgAwAAAAgAIAEAAAkAMAIAAAoAICQDAACoBwAgBQAApgcAIAYAAKcHACAJAACrBwAgCwAA4QcAIAwAAKkHACANAACvBwAgDgAAqgcAIBEAAKwHACAUAACtBwAgFQAArgcAINYCAQAAAAHXAgEAAAAB3AJAAAAAAe0CAQAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQEgAADAAQAgGdYCAQAAAAHXAgEAAAAB3AJAAAAAAe0CAQAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQEgAADCAQAwASAAAMIBADABAAAAFAAgAQAAAAUAIAEAAAAsACAkAwAAuwYAIAUAALkGACAGAAC6BgAgCQAAvgYAIAsAAN8HACAMAAC8BgAgDQAAwgYAIA4AAL0GACARAAC_BgAgFAAAwAYAIBUAAMEGACDWAgEA-wUAIdcCAQD7BQAh3AJAAP0FACHtAgEA-wUAIfMCAAC1BsIDIvQCAQD8BQAhgQMBAPsFACGFA0AA_QUAIZQDEACHBgAhlQMQALcGACG-AwEA-wUAIb8DAQD8BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhAgAAAAoAICAAAMgBACAZ1gIBAPsFACHXAgEA-wUAIdwCQAD9BQAh7QIBAPsFACHzAgAAtQbCAyL0AgEA_AUAIYEDAQD7BQAhhQNAAP0FACGUAxAAhwYAIZUDEAC3BgAhvgMBAPsFACG_AwEA_AUAIcADAAC0BsEDIsIDQAD9BQAhwwNAAP0FACHEA0AAtgYAIcUDQAC2BgAhxgMCAJUGACHHAxAAhwYAIcgDEAC3BgAhyQMBAPwFACHKAxAAhwYAIcsDQAC2BgAhzAMBAPwFACHNA0AAtgYAIQIAAAAIACAgAADKAQAgAgAAAAgAICAAAMoBACABAAAAFAAgAQAAAAUAIAEAAAAsACADAAAACgAgJwAAwAEAICgAAMgBACABAAAACgAgAQAAAAgAIA8HAADQCgAgLQAA0woAIC4AANIKACA_AADRCgAgQAAA1AoAIPQCAAD3BQAglQMAAPcFACC_AwAA9wUAIMQDAAD3BQAgxQMAAPcFACDIAwAA9wUAIMkDAAD3BQAgywMAAPcFACDMAwAA9wUAIM0DAAD3BQAgHNMCAACsBQAw1AIAANQBABDVAgAArAUAMNYCAQDWBAAh1wIBANYEACHcAkAA2QQAIe0CAQDWBAAh8wIAAK4FwgMi9AIBANgEACGBAwEA1gQAIYUDQADZBAAhlAMQAOUEACGVAxAA-QQAIb4DAQDXBAAhvwMBAOQEACHAAwAArQXBAyLCA0AA2QQAIcMDQADZBAAhxANAAPoEACHFA0AA-gQAIcYDAgD1BAAhxwMQAOUEACHIAxAA-QQAIckDAQDkBAAhygMQAOUEACHLA0AA-gQAIcwDAQDkBAAhzQNAAPoEACEDAAAACAAgAQAA0wEAMCwAANQBACADAAAACAAgAQAACQAwAgAACgAgFAMAAKQFACAEAACaBQAgCAAAqgUAIAkAAKgFACALAACpBQAgDgAApQUAIBMAAKYFACAWAACnBQAgFwAAqwUAINMCAACiBQAw1AIAAAMAENUCAACiBQAw1gIBAAAAAdoCAQAAAAHoAgEAlwUAIekCAQCYBQAh7AIgAKMFACGwAwEAAAABtAMBAJcFACG9AwEAmAUAIQEAAADXAQAgAQAAANcBACANAwAAyAoAIAQAANgIACAIAADOCgAgCQAAzAoAIAsAAM0KACAOAADJCgAgEwAAygoAIBYAAMsKACAXAADPCgAg2gIAAPcFACDpAgAA9wUAILADAAD3BQAgvQMAAPcFACADAAAAAwAgAQAA2gEAMAIAANcBACADAAAAAwAgAQAA2gEAMAIAANcBACADAAAAAwAgAQAA2gEAMAIAANcBACARAwAAvwoAIAQAAMAKACAIAADGCgAgCQAAxAoAIAsAAMUKACAOAADBCgAgEwAAwgoAIBYAAMMKACAXAADHCgAg1gIBAAAAAdoCAQAAAAHoAgEAAAAB6QIBAAAAAewCIAAAAAGwAwEAAAABtAMBAAAAAb0DAQAAAAEBIAAA3gEAIAjWAgEAAAAB2gIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAbADAQAAAAG0AwEAAAABvQMBAAAAAQEgAADgAQAwASAAAOABADARAwAA5QgAIAQAAOYIACAIAADsCAAgCQAA6ggAIAsAAOsIACAOAADnCAAgEwAA6AgAIBYAAOkIACAXAADtCAAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIQIAAADXAQAgIAAA4wEAIAjWAgEA-wUAIdoCAQD8BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAhsAMBAPwFACG0AwEA-wUAIb0DAQD8BQAhAgAAAAMAICAAAOUBACACAAAAAwAgIAAA5QEAIAMAAADXAQAgJwAA3gEAICgAAOMBACABAAAA1wEAIAEAAAADACAHBwAA4ggAIC0AAOQIACAuAADjCAAg2gIAAPcFACDpAgAA9wUAILADAAD3BQAgvQMAAPcFACAL0wIAAKEFADDUAgAA7AEAENUCAAChBQAw1gIBANYEACHaAgEA2AQAIegCAQDXBAAh6QIBANgEACHsAiAA5gQAIbADAQDYBAAhtAMBANcEACG9AwEA2AQAIQMAAAADACABAADrAQAwLAAA7AEAIAMAAAADACABAADaAQAwAgAA1wEAIAEAAAAzACABAAAAMwAgAwAAADEAIAEAADIAMAIAADMAIAMAAAAxACABAAAyADACAAAzACADAAAAMQAgAQAAMgAwAgAAMwAgDgQAAOEIACAPAACYBwAgEAAAmQcAINYCAQAAAAHcAkAAAAAB8wIAAAC7AwL0AgEAAAABgAMBAAAAAYUDQAAAAAGYAxAAAAABuAMBAAAAAbkDAQAAAAG7A0AAAAABvAMBAAAAAQEgAAD0AQAgC9YCAQAAAAHcAkAAAAAB8wIAAAC7AwL0AgEAAAABgAMBAAAAAYUDQAAAAAGYAxAAAAABuAMBAAAAAbkDAQAAAAG7A0AAAAABvAMBAAAAAQEgAAD2AQAwASAAAPYBADABAAAABQAgAQAAAAUAIA4EAADgCAAgDwAAlQcAIBAAAJYHACDWAgEA-wUAIdwCQAD9BQAh8wIAAJMHuwMi9AIBAPwFACGAAwEA-wUAIYUDQAD9BQAhmAMQALcGACG4AwEA_AUAIbkDAQD8BQAhuwNAALYGACG8AwEA_AUAIQIAAAAzACAgAAD7AQAgC9YCAQD7BQAh3AJAAP0FACHzAgAAkwe7AyL0AgEA_AUAIYADAQD7BQAhhQNAAP0FACGYAxAAtwYAIbgDAQD8BQAhuQMBAPwFACG7A0AAtgYAIbwDAQD8BQAhAgAAADEAICAAAP0BACACAAAAMQAgIAAA_QEAIAEAAAAFACABAAAABQAgAwAAADMAICcAAPQBACAoAAD7AQAgAQAAADMAIAEAAAAxACALBwAA2wgAIC0AAN4IACAuAADdCAAgPwAA3AgAIEAAAN8IACD0AgAA9wUAIJgDAAD3BQAguAMAAPcFACC5AwAA9wUAILsDAAD3BQAgvAMAAPcFACAO0wIAAJ0FADDUAgAAhgIAENUCAACdBQAw1gIBANYEACHcAkAA2QQAIfMCAACeBbsDIvQCAQDYBAAhgAMBANYEACGFA0AA2QQAIZgDEAD5BAAhuAMBAOQEACG5AwEA2AQAIbsDQAD6BAAhvAMBAOQEACEDAAAAMQAgAQAAhQIAMCwAAIYCACADAAAAMQAgAQAAMgAwAgAAMwAgDwMAAJsFACAEAACaBQAgDQAAnAUAINMCAACWBQAw1AIAAHkAENUCAACWBQAw1gIBAAAAAdgCAQAAAAHZAgEAlwUAIdoCAQAAAAGwAwEAAAABsQMBAAAAAbIDAQCYBQAhswNAAJkFACG0AwEAmAUAIQEAAACJAgAgAQAAAIkCACAKAwAA2QgAIAQAANgIACANAADaCAAg2AIAAPcFACDaAgAA9wUAILADAAD3BQAgsQMAAPcFACCyAwAA9wUAILMDAAD3BQAgtAMAAPcFACADAAAAeQAgAQAAjAIAMAIAAIkCACADAAAAeQAgAQAAjAIAMAIAAIkCACADAAAAeQAgAQAAjAIAMAIAAIkCACAMAwAA1ggAIAQAANUIACANAADXCAAg1gIBAAAAAdgCAQAAAAHZAgEAAAAB2gIBAAAAAbADAQAAAAGxAwEAAAABsgMBAAAAAbMDQAAAAAG0AwEAAAABASAAAJACACAJ1gIBAAAAAdgCAQAAAAHZAgEAAAAB2gIBAAAAAbADAQAAAAGxAwEAAAABsgMBAAAAAbMDQAAAAAG0AwEAAAABASAAAJICADABIAAAkgIAMAEAAAAFACAMAwAAvggAIAQAAL0IACANAAC_CAAg1gIBAPsFACHYAgEA_AUAIdkCAQD7BQAh2gIBAPwFACGwAwEA_AUAIbEDAQD8BQAhsgMBAPwFACGzA0AAtgYAIbQDAQD8BQAhAgAAAIkCACAgAACWAgAgCdYCAQD7BQAh2AIBAPwFACHZAgEA-wUAIdoCAQD8BQAhsAMBAPwFACGxAwEA_AUAIbIDAQD8BQAhswNAALYGACG0AwEA_AUAIQIAAAB5ACAgAACYAgAgAgAAAHkAICAAAJgCACABAAAABQAgAwAAAIkCACAnAACQAgAgKAAAlgIAIAEAAACJAgAgAQAAAHkAIAoHAAC6CAAgLQAAvAgAIC4AALsIACDYAgAA9wUAINoCAAD3BQAgsAMAAPcFACCxAwAA9wUAILIDAAD3BQAgswMAAPcFACC0AwAA9wUAIAzTAgAAlQUAMNQCAACgAgAQ1QIAAJUFADDWAgEA1gQAIdgCAQDkBAAh2QIBANcEACHaAgEA2AQAIbADAQDYBAAhsQMBANgEACGyAwEA2AQAIbMDQAD6BAAhtAMBANgEACEDAAAAeQAgAQAAnwIAMCwAAKACACADAAAAeQAgAQAAjAIAMAIAAIkCACABAAAAVQAgAQAAAFUAIAMAAAAsACABAABUADACAABVACADAAAALAAgAQAAVAAwAgAAVQAgAwAAACwAIAEAAFQAMAIAAFUAIA4EAAC4CAAgBgAAuQgAINYCAQAAAAHXAgEAAAAB6QIBAAAAAewCIAAAAAGoAwEAAAABqQMAAACqAwKqAxAAAAABqwMQAAAAAawDAgAAAAGtAwIAAAABrgNAAAAAAa8DQAAAAAEBIAAAqAIAIAzWAgEAAAAB1wIBAAAAAekCAQAAAAHsAiAAAAABqAMBAAAAAakDAAAAqgMCqgMQAAAAAasDEAAAAAGsAwIAAAABrQMCAAAAAa4DQAAAAAGvA0AAAAABASAAAKoCADABIAAAqgIAMAEAAAADACAOBAAArQgAIAYAAK4IACDWAgEA-wUAIdcCAQD8BQAh6QIBAPwFACHsAiAAiAYAIagDAQD7BQAhqQMAAKwIqgMiqgMQAIcGACGrAxAAtwYAIawDAgCjBgAhrQMCAJUGACGuA0AAtgYAIa8DQAC2BgAhAgAAAFUAICAAAK4CACAM1gIBAPsFACHXAgEA_AUAIekCAQD8BQAh7AIgAIgGACGoAwEA-wUAIakDAACsCKoDIqoDEACHBgAhqwMQALcGACGsAwIAowYAIa0DAgCVBgAhrgNAALYGACGvA0AAtgYAIQIAAAAsACAgAACwAgAgAgAAACwAICAAALACACABAAAAAwAgAwAAAFUAICcAAKgCACAoAACuAgAgAQAAAFUAIAEAAAAsACALBwAApwgAIC0AAKoIACAuAACpCAAgPwAAqAgAIEAAAKsIACDXAgAA9wUAIOkCAAD3BQAgqwMAAPcFACCsAwAA9wUAIK4DAAD3BQAgrwMAAPcFACAP0wIAAJEFADDUAgAAuAIAENUCAACRBQAw1gIBANYEACHXAgEA5AQAIekCAQDYBAAh7AIgAOYEACGoAwEA1wQAIakDAACSBaoDIqoDEADlBAAhqwMQAPkEACGsAwIA7QQAIa0DAgD1BAAhrgNAAPoEACGvA0AA-gQAIQMAAAAsACABAAC3AgAwLAAAuAIAIAMAAAAsACABAABUADACAABVACABAAAAWAAgAQAAAFgAIAMAAABAACABAABXADACAABYACADAAAAQAAgAQAAVwAwAgAAWAAgAwAAAEAAIAEAAFcAMAIAAFgAIAcGAAClCAAgEgAApggAINYCAQAAAAHXAgEAAAAB6AIBAAAAAekCAQAAAAHqAhAAAAABASAAAMACACAF1gIBAAAAAdcCAQAAAAHoAgEAAAAB6QIBAAAAAeoCEAAAAAEBIAAAwgIAMAEgAADCAgAwAQAAAAMAIAcGAACaCAAgEgAAmwgAINYCAQD7BQAh1wIBAPwFACHoAgEA-wUAIekCAQD8BQAh6gIQAIcGACECAAAAWAAgIAAAxgIAIAXWAgEA-wUAIdcCAQD8BQAh6AIBAPsFACHpAgEA_AUAIeoCEACHBgAhAgAAAEAAICAAAMgCACACAAAAQAAgIAAAyAIAIAEAAAADACADAAAAWAAgJwAAwAIAICgAAMYCACABAAAAWAAgAQAAAEAAIAcHAACVCAAgLQAAmAgAIC4AAJcIACA_AACWCAAgQAAAmQgAINcCAAD3BQAg6QIAAPcFACAI0wIAAJAFADDUAgAA0AIAENUCAACQBQAw1gIBANYEACHXAgEA5AQAIegCAQDXBAAh6QIBANgEACHqAhAA5QQAIQMAAABAACABAADPAgAwLAAA0AIAIAMAAABAACABAABXADACAABYACABAAAAfQAgAQAAAH0AIAMAAAB7ACABAAB8ADACAAB9ACADAAAAewAgAQAAfAAwAgAAfQAgAwAAAHsAIAEAAHwAMAIAAH0AIAkDAACUCAAg1gIEAAAAAdgCAQAAAAHcAkAAAAAB6QIBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaEDgAAAAAEBIAAA2AIAIAjWAgQAAAAB2AIBAAAAAdwCQAAAAAHpAgEAAAABngMBAAAAAZ8DAQAAAAGgAwEAAAABoQOAAAAAAQEgAADaAgAwASAAANoCADABAAAABQAgCQMAAJMIACDWAgQAkggAIdgCAQD8BQAh3AJAAP0FACHpAgEA_AUAIZ4DAQD7BQAhnwMBAPwFACGgAwEA_AUAIaEDgAAAAAECAAAAfQAgIAAA3gIAIAjWAgQAkggAIdgCAQD8BQAh3AJAAP0FACHpAgEA_AUAIZ4DAQD7BQAhnwMBAPwFACGgAwEA_AUAIaEDgAAAAAECAAAAewAgIAAA4AIAIAIAAAB7ACAgAADgAgAgAQAAAAUAIAMAAAB9ACAnAADYAgAgKAAA3gIAIAEAAAB9ACABAAAAewAgCgcAAI0IACAtAACQCAAgLgAAjwgAID8AAI4IACBAAACRCAAg2AIAAPcFACDpAgAA9wUAIJ8DAAD3BQAgoAMAAPcFACChAwAA9wUAIAvTAgAAigUAMNQCAADoAgAQ1QIAAIoFADDWAgQAiwUAIdgCAQDkBAAh3AJAANkEACHpAgEA2AQAIZ4DAQDXBAAhnwMBANgEACGgAwEA5AQAIaEDAACMBQAgAwAAAHsAIAEAAOcCADAsAADoAgAgAwAAAHsAIAEAAHwAMAIAAH0AIAEAAABcACABAAAAXAAgAwAAAFoAIAEAAFsAMAIAAFwAIAMAAABaACABAABbADACAABcACADAAAAWgAgAQAAWwAwAgAAXAAgBQYAAIwIACDWAgEAAAAB1wIBAAAAAegCAQAAAAGdA0AAAAABASAAAPACACAE1gIBAAAAAdcCAQAAAAHoAgEAAAABnQNAAAAAAQEgAADyAgAwASAAAPICADABAAAAAwAgBQYAAIsIACDWAgEA-wUAIdcCAQD8BQAh6AIBAPwFACGdA0AA_QUAIQIAAABcACAgAAD2AgAgBNYCAQD7BQAh1wIBAPwFACHoAgEA_AUAIZ0DQAD9BQAhAgAAAFoAICAAAPgCACACAAAAWgAgIAAA-AIAIAEAAAADACADAAAAXAAgJwAA8AIAICgAAPYCACABAAAAXAAgAQAAAFoAIAUHAACICAAgLQAAiggAIC4AAIkIACDXAgAA9wUAIOgCAAD3BQAgB9MCAACJBQAw1AIAAIADABDVAgAAiQUAMNYCAQDWBAAh1wIBAOQEACHoAgEA2AQAIZ0DQADZBAAhAwAAAFoAIAEAAP8CADAsAACAAwAgAwAAAFoAIAEAAFsAMAIAAFwAIAEAAAA9ACABAAAAPQAgAwAAADsAIAEAADwAMAIAAD0AIAMAAAA7ACABAAA8ADACAAA9ACADAAAAOwAgAQAAPAAwAgAAPQAgCQMAAIMHACATAACEBwAgFAAAhwgAINYCAQAAAAHpAgEAAAABhgMBAAAAAYkDEAAAAAGbAwEAAAABnAMBAAAAAQEgAACIAwAgBtYCAQAAAAHpAgEAAAABhgMBAAAAAYkDEAAAAAGbAwEAAAABnAMBAAAAAQEgAACKAwAwASAAAIoDADABAAAABQAgAQAAAEAAIAkDAACABwAgEwAAgQcAIBQAAIYIACDWAgEA-wUAIekCAQD7BQAhhgMBAPsFACGJAxAAhwYAIZsDAQD8BQAhnAMBAPwFACECAAAAPQAgIAAAjwMAIAbWAgEA-wUAIekCAQD7BQAhhgMBAPsFACGJAxAAhwYAIZsDAQD8BQAhnAMBAPwFACECAAAAOwAgIAAAkQMAIAIAAAA7ACAgAACRAwAgAQAAAAUAIAEAAABAACADAAAAPQAgJwAAiAMAICgAAI8DACABAAAAPQAgAQAAADsAIAcHAACBCAAgLQAAhAgAIC4AAIMIACA_AACCCAAgQAAAhQgAIJsDAAD3BQAgnAMAAPcFACAJ0wIAAIgFADDUAgAAmgMAENUCAACIBQAw1gIBANYEACHpAgEA1wQAIYYDAQDWBAAhiQMQAOUEACGbAwEA5AQAIZwDAQDkBAAhAwAAADsAIAEAAJkDADAsAACaAwAgAwAAADsAIAEAADwAMAIAAD0AIAEAAAA5ACABAAAAOQAgAwAAADcAIAEAADgAMAIAADkAIAMAAAA3ACABAAA4ADACAAA5ACADAAAANwAgAQAAOAAwAgAAOQAgFgMAAIcHACAEAACACAAgEgAAhgcAIBUAAIgHACDWAgEAAAAB3AJAAAAAAfQCAQAAAAGAAwEAAAABhQNAAAAAAY4DAQAAAAGPAxAAAAABkAMQAAAAAZEDEAAAAAGSAxAAAAABkwMQAAAAAZQDEAAAAAGVAxAAAAABlgMQAAAAAZcDEAAAAAGYAxAAAAABmQMBAAAAAZoDQAAAAAEBIAAAogMAIBLWAgEAAAAB3AJAAAAAAfQCAQAAAAGAAwEAAAABhQNAAAAAAY4DAQAAAAGPAxAAAAABkAMQAAAAAZEDEAAAAAGSAxAAAAABkwMQAAAAAZQDEAAAAAGVAxAAAAABlgMQAAAAAZcDEAAAAAGYAxAAAAABmQMBAAAAAZoDQAAAAAEBIAAApAMAMAEgAACkAwAwAQAAAAUAIBYDAADoBgAgBAAA_wcAIBIAAOcGACAVAADpBgAg1gIBAPsFACHcAkAA_QUAIfQCAQD8BQAhgAMBAPsFACGFA0AA_QUAIY4DAQD7BQAhjwMQAIcGACGQAxAAhwYAIZEDEACHBgAhkgMQAIcGACGTAxAAhwYAIZQDEACHBgAhlQMQAIcGACGWAxAAhwYAIZcDEACHBgAhmAMQAIcGACGZAwEA_AUAIZoDQAD9BQAhAgAAADkAICAAAKgDACAS1gIBAPsFACHcAkAA_QUAIfQCAQD8BQAhgAMBAPsFACGFA0AA_QUAIY4DAQD7BQAhjwMQAIcGACGQAxAAhwYAIZEDEACHBgAhkgMQAIcGACGTAxAAhwYAIZQDEACHBgAhlQMQAIcGACGWAxAAhwYAIZcDEACHBgAhmAMQAIcGACGZAwEA_AUAIZoDQAD9BQAhAgAAADcAICAAAKoDACACAAAANwAgIAAAqgMAIAEAAAAFACADAAAAOQAgJwAAogMAICgAAKgDACABAAAAOQAgAQAAADcAIAcHAAD6BwAgLQAA_QcAIC4AAPwHACA_AAD7BwAgQAAA_gcAIPQCAAD3BQAgmQMAAPcFACAV0wIAAIcFADDUAgAAsgMAENUCAACHBQAw1gIBANYEACHcAkAA2QQAIfQCAQDYBAAhgAMBANYEACGFA0AA2QQAIY4DAQDXBAAhjwMQAOUEACGQAxAA5QQAIZEDEADlBAAhkgMQAOUEACGTAxAA5QQAIZQDEADlBAAhlQMQAOUEACGWAxAA5QQAIZcDEADlBAAhmAMQAOUEACGZAwEA5AQAIZoDQADZBAAhAwAAADcAIAEAALEDADAsAACyAwAgAwAAADcAIAEAADgAMAIAADkAIAEAAABIACABAAAASAAgAwAAAEYAIAEAAEcAMAIAAEgAIAMAAABGACABAABHADACAABIACADAAAARgAgAQAARwAwAgAASAAgEAMAANsGACAEAAD0BgAgFAAA2gYAINYCAQAAAAHcAkAAAAAB8wIAAACJAwL0AgEAAAABgAMBAAAAAYUDQAAAAAGGAwEAAAABhwMAAACIAwKJAxAAAAABigMgAAAAAYsDAQAAAAGMA0AAAAABjQMBAAAAAQEgAAC6AwAgDdYCAQAAAAHcAkAAAAAB8wIAAACJAwL0AgEAAAABgAMBAAAAAYUDQAAAAAGGAwEAAAABhwMAAACIAwKJAxAAAAABigMgAAAAAYsDAQAAAAGMA0AAAAABjQMBAAAAAQEgAAC8AwAwASAAALwDADABAAAANwAgAQAAAAUAIBADAADYBgAgBAAA8gYAIBQAANcGACDWAgEA-wUAIdwCQAD9BQAh8wIAANUGiQMi9AIBAPwFACGAAwEA-wUAIYUDQAD9BQAhhgMBAPwFACGHAwAA1AaIAyKJAxAAhwYAIYoDIACIBgAhiwMBAPwFACGMA0AAtgYAIY0DAQD8BQAhAgAAAEgAICAAAMEDACAN1gIBAPsFACHcAkAA_QUAIfMCAADVBokDIvQCAQD8BQAhgAMBAPsFACGFA0AA_QUAIYYDAQD8BQAhhwMAANQGiAMiiQMQAIcGACGKAyAAiAYAIYsDAQD8BQAhjANAALYGACGNAwEA_AUAIQIAAABGACAgAADDAwAgAgAAAEYAICAAAMMDACABAAAANwAgAQAAAAUAIAMAAABIACAnAAC6AwAgKAAAwQMAIAEAAABIACABAAAARgAgCgcAAPUHACAtAAD4BwAgLgAA9wcAID8AAPYHACBAAAD5BwAg9AIAAPcFACCGAwAA9wUAIIsDAAD3BQAgjAMAAPcFACCNAwAA9wUAIBDTAgAAgAUAMNQCAADMAwAQ1QIAAIAFADDWAgEA1gQAIdwCQADZBAAh8wIAAIIFiQMi9AIBANgEACGAAwEA1gQAIYUDQADZBAAhhgMBAOQEACGHAwAAgQWIAyKJAxAA5QQAIYoDIADmBAAhiwMBANgEACGMA0AA-gQAIY0DAQDkBAAhAwAAAEYAIAEAAMsDADAsAADMAwAgAwAAAEYAIAEAAEcAMAIAAEgAIAEAAAAoACABAAAAKAAgAwAAACYAIAEAACcAMAIAACgAIAMAAAAmACABAAAnADACAAAoACADAAAAJgAgAQAAJwAwAgAAKAAgCgQAAPQHACAMAADJBgAg1gIBAAAAAdwCQAAAAAGAAwEAAAABgQMBAAAAAYIDAgAAAAGDAwEAAAABhAMgAAAAAYUDQAAAAAEBIAAA1AMAIAjWAgEAAAAB3AJAAAAAAYADAQAAAAGBAwEAAAABggMCAAAAAYMDAQAAAAGEAyAAAAABhQNAAAAAAQEgAADWAwAwASAAANYDADAKBAAA8wcAIAwAAMgGACDWAgEA-wUAIdwCQAD9BQAhgAMBAPsFACGBAwEA-wUAIYIDAgCVBgAhgwMBAPwFACGEAyAAiAYAIYUDQAD9BQAhAgAAACgAICAAANkDACAI1gIBAPsFACHcAkAA_QUAIYADAQD7BQAhgQMBAPsFACGCAwIAlQYAIYMDAQD8BQAhhAMgAIgGACGFA0AA_QUAIQIAAAAmACAgAADbAwAgAgAAACYAICAAANsDACADAAAAKAAgJwAA1AMAICgAANkDACABAAAAKAAgAQAAACYAIAYHAADuBwAgLQAA8QcAIC4AAPAHACA_AADvBwAgQAAA8gcAIIMDAAD3BQAgC9MCAAD_BAAw1AIAAOIDABDVAgAA_wQAMNYCAQDWBAAh3AJAANkEACGAAwEA1gQAIYEDAQDWBAAhggMCAPUEACGDAwEA2AQAIYQDIADmBAAhhQNAANkEACEDAAAAJgAgAQAA4QMAMCwAAOIDACADAAAAJgAgAQAAJwAwAgAAKAAgAQAAABoAIAEAAAAaACADAAAAGAAgAQAAGQAwAgAAGgAgAwAAABgAIAEAABkAMAIAABoAIAMAAAAYACABAAAZADACAAAaACAJCQAA7QcAINYCAQAAAAHtAgEAAAAB-gIQAAAAAfsCEAAAAAH8AhAAAAAB_QIQAAAAAf4CQAAAAAH_AkAAAAABASAAAOoDACAI1gIBAAAAAe0CAQAAAAH6AhAAAAAB-wIQAAAAAfwCEAAAAAH9AhAAAAAB_gJAAAAAAf8CQAAAAAEBIAAA7AMAMAEgAADsAwAwCQkAAOwHACDWAgEA-wUAIe0CAQD7BQAh-gIQALcGACH7AhAAtwYAIfwCEACHBgAh_QIQAIcGACH-AkAA_QUAIf8CQAC2BgAhAgAAABoAICAAAO8DACAI1gIBAPsFACHtAgEA-wUAIfoCEAC3BgAh-wIQALcGACH8AhAAhwYAIf0CEACHBgAh_gJAAP0FACH_AkAAtgYAIQIAAAAYACAgAADxAwAgAgAAABgAICAAAPEDACADAAAAGgAgJwAA6gMAICgAAO8DACABAAAAGgAgAQAAABgAIAgHAADnBwAgLQAA6gcAIC4AAOkHACA_AADoBwAgQAAA6wcAIPoCAAD3BQAg-wIAAPcFACD_AgAA9wUAIAvTAgAA-AQAMNQCAAD4AwAQ1QIAAPgEADDWAgEA1gQAIe0CAQDWBAAh-gIQAPkEACH7AhAA-QQAIfwCEADlBAAh_QIQAOUEACH-AkAA2QQAIf8CQAD6BAAhAwAAABgAIAEAAPcDADAsAAD4AwAgAwAAABgAIAEAABkAMAIAABoAIAEAAABhACABAAAAYQAgAwAAAF8AIAEAAGAAMAIAAGEAIAMAAABfACABAABgADACAABhACADAAAAXwAgAQAAYAAwAgAAYQAgCwQAAOMHACAGAADlBwAgCgAA5AcAIAsAAOYHACDWAgEAAAAB1wIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAfgCAgAAAAH5AgAA4gcAIAEgAACABAAgB9YCAQAAAAHXAgEAAAAB6AIBAAAAAekCAQAAAAHsAiAAAAAB-AICAAAAAfkCAADiBwAgASAAAIIEADABIAAAggQAMAsEAAC7BwAgBgAAvQcAIAoAALwHACALAAC-BwAg1gIBAPsFACHXAgEA-wUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIfgCAgCVBgAh-QIAALoHACACAAAAYQAgIAAAhQQAIAfWAgEA-wUAIdcCAQD7BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAh-AICAJUGACH5AgAAugcAIAIAAABfACAgAACHBAAgAgAAAF8AICAAAIcEACADAAAAYQAgJwAAgAQAICgAAIUEACABAAAAYQAgAQAAAF8AIAYHAAC1BwAgLQAAuAcAIC4AALcHACA_AAC2BwAgQAAAuQcAIOkCAAD3BQAgCtMCAAD0BAAw1AIAAI4EABDVAgAA9AQAMNYCAQDWBAAh1wIBANYEACHoAgEA1wQAIekCAQDYBAAh7AIgAOYEACH4AgIA9QQAIfkCAADuBAAgAwAAAF8AIAEAAI0EADAsAACOBAAgAwAAAF8AIAEAAGAAMAIAAGEAIAEAAAAdACABAAAAHQAgAwAAABQAIAEAABwAMAIAAB0AIAMAAAAUACABAAAcADACAAAdACADAAAAFAAgAQAAHAAwAgAAHQAgDQQAALIHACAGAACzBwAgCQAAtAcAINYCAQAAAAHXAgEAAAAB7AIgAAAAAe0CAQAAAAHuAgEAAAAB7wICAAAAAfACAACwBwAg8QIAALEHACDzAgAAAPMCAvQCAQAAAAEBIAAAlgQAIArWAgEAAAAB1wIBAAAAAewCIAAAAAHtAgEAAAAB7gIBAAAAAe8CAgAAAAHwAgAAsAcAIPECAACxBwAg8wIAAADzAgL0AgEAAAABASAAAJgEADABIAAAmAQAMA0EAACnBgAgBgAAqAYAIAkAAKkGACDWAgEA-wUAIdcCAQD7BQAh7AIgAIgGACHtAgEA-wUAIe4CAQD7BQAh7wICAKMGACHwAgAApAYAIPECAAClBgAg8wIAAKYG8wIi9AIBAPwFACECAAAAHQAgIAAAmwQAIArWAgEA-wUAIdcCAQD7BQAh7AIgAIgGACHtAgEA-wUAIe4CAQD7BQAh7wICAKMGACHwAgAApAYAIPECAAClBgAg8wIAAKYG8wIi9AIBAPwFACECAAAAFAAgIAAAnQQAIAIAAAAUACAgAACdBAAgAwAAAB0AICcAAJYEACAoAACbBAAgAQAAAB0AIAEAAAAUACAHBwAAngYAIC0AAKEGACAuAACgBgAgPwAAnwYAIEAAAKIGACDvAgAA9wUAIPQCAAD3BQAgDdMCAADsBAAw1AIAAKQEABDVAgAA7AQAMNYCAQDWBAAh1wIBANYEACHsAiAA5gQAIe0CAQDWBAAh7gIBANcEACHvAgIA7QQAIfACAADuBAAg8QIAAO4EACDzAgAA7wTzAiL0AgEA2AQAIQMAAAAUACABAACjBAAwLAAApAQAIAMAAAAUACABAAAcADACAAAdACABAAAAZgAgAQAAAGYAIAMAAABkACABAABlADACAABmACADAAAAZAAgAQAAZQAwAgAAZgAgAwAAAGQAIAEAAGUAMAIAAGYAIAkFAACcBgAgBgAAnQYAINYCAQAAAAHXAgEAAAAB6AIBAAAAAekCAQAAAAHqAhAAAAAB6wIBAAAAAewCIAAAAAEBIAAArAQAIAfWAgEAAAAB1wIBAAAAAegCAQAAAAHpAgEAAAAB6gIQAAAAAesCAQAAAAHsAiAAAAABASAAAK4EADABIAAArgQAMAEAAAADACAJBQAAiQYAIAYAAIoGACDWAgEA-wUAIdcCAQD8BQAh6AIBAPsFACHpAgEA_AUAIeoCEACHBgAh6wIBAPwFACHsAiAAiAYAIQIAAABmACAgAACyBAAgB9YCAQD7BQAh1wIBAPwFACHoAgEA-wUAIekCAQD8BQAh6gIQAIcGACHrAgEA_AUAIewCIACIBgAhAgAAAGQAICAAALQEACACAAAAZAAgIAAAtAQAIAEAAAADACADAAAAZgAgJwAArAQAICgAALIEACABAAAAZgAgAQAAAGQAIAgHAACCBgAgLQAAhQYAIC4AAIQGACA_AACDBgAgQAAAhgYAINcCAAD3BQAg6QIAAPcFACDrAgAA9wUAIArTAgAA4wQAMNQCAAC8BAAQ1QIAAOMEADDWAgEA1gQAIdcCAQDkBAAh6AIBANcEACHpAgEA2AQAIeoCEADlBAAh6wIBANgEACHsAiAA5gQAIQMAAABkACABAAC7BAAwLAAAvAQAIAMAAABkACABAABlADACAABmACABAAAAagAgAQAAAGoAIAMAAABoACABAABpADACAABqACADAAAAaAAgAQAAaQAwAgAAagAgAwAAAGgAIAEAAGkAMAIAAGoAIAkDAACABgAgBgAAgQYAINYCAQAAAAHXAgEAAAAB2AIBAAAAAdkCAQAAAAHaAgEAAAAB2wIBAAAAAdwCQAAAAAEBIAAAxAQAIAfWAgEAAAAB1wIBAAAAAdgCAQAAAAHZAgEAAAAB2gIBAAAAAdsCAQAAAAHcAkAAAAABASAAAMYEADABIAAAxgQAMAkDAAD-BQAgBgAA_wUAINYCAQD7BQAh1wIBAPsFACHYAgEA-wUAIdkCAQD7BQAh2gIBAPwFACHbAgEA_AUAIdwCQAD9BQAhAgAAAGoAICAAAMkEACAH1gIBAPsFACHXAgEA-wUAIdgCAQD7BQAh2QIBAPsFACHaAgEA_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_AADqBAAgQAAA6gQAIN0CEAAAAAHeAhAAAAAE3wIQAAAABOACEAAAAAHhAhAAAAAB4gIQAAAAAeMCEAAAAAHkAhAA6QQAIQUHAADbBAAgLQAA6AQAIC4AAOgEACDdAiAAAAAB5AIgAOcEACEFBwAA2wQAIC0AAOgEACAuAADoBAAg3QIgAAAAAeQCIADnBAAhAt0CIAAAAAHkAiAA6AQAIQ0HAADbBAAgLQAA6gQAIC4AAOoEACA_AADqBAAgQAAA6gQAIN0CEAAAAAHeAhAAAAAE3wIQAAAABOACEAAAAAHhAhAAAAAB4gIQAAAAAeMCEAAAAAHkAhAA6QQAIQjdAhAAAAAB3gIQAAAABN8CEAAAAATgAhAAAAAB4QIQAAAAAeICEAAAAAHjAhAAAAAB5AIQAOoEACELBwAA3gQAIC0AAN8EACAuAADfBAAg3QIBAAAAAd4CAQAAAAXfAgEAAAAF4AIBAAAAAeECAQAAAAHiAgEAAAAB4wIBAAAAAeQCAQDrBAAhDdMCAADsBAAw1AIAAKQEABDVAgAA7AQAMNYCAQDWBAAh1wIBANYEACHsAiAA5gQAIe0CAQDWBAAh7gIBANcEACHvAgIA7QQAIfACAADuBAAg8QIAAO4EACDzAgAA7wTzAiL0AgEA2AQAIQ0HAADeBAAgLQAA3gQAIC4AAN4EACA_AADzBAAgQAAA3gQAIN0CAgAAAAHeAgIAAAAF3wICAAAABeACAgAAAAHhAgIAAAAB4gICAAAAAeMCAgAAAAHkAgIA8gQAIQTdAgEAAAAF9QIBAAAAAfYCAQAAAAT3AgEAAAAEBwcAANsEACAtAADxBAAgLgAA8QQAIN0CAAAA8wIC3gIAAADzAgjfAgAAAPMCCOQCAADwBPMCIgcHAADbBAAgLQAA8QQAIC4AAPEEACDdAgAAAPMCAt4CAAAA8wII3wIAAADzAgjkAgAA8ATzAiIE3QIAAADzAgLeAgAAAPMCCN8CAAAA8wII5AIAAPEE8wIiDQcAAN4EACAtAADeBAAgLgAA3gQAID8AAPMEACBAAADeBAAg3QICAAAAAd4CAgAAAAXfAgIAAAAF4AICAAAAAeECAgAAAAHiAgIAAAAB4wICAAAAAeQCAgDyBAAhCN0CCAAAAAHeAggAAAAF3wIIAAAABeACCAAAAAHhAggAAAAB4gIIAAAAAeMCCAAAAAHkAggA8wQAIQrTAgAA9AQAMNQCAACOBAAQ1QIAAPQEADDWAgEA1gQAIdcCAQDWBAAh6AIBANcEACHpAgEA2AQAIewCIADmBAAh-AICAPUEACH5AgAA7gQAIA0HAADbBAAgLQAA2wQAIC4AANsEACA_AAD3BAAgQAAA2wQAIN0CAgAAAAHeAgIAAAAE3wICAAAABOACAgAAAAHhAgIAAAAB4gICAAAAAeMCAgAAAAHkAgIA9gQAIQ0HAADbBAAgLQAA2wQAIC4AANsEACA_AAD3BAAgQAAA2wQAIN0CAgAAAAHeAgIAAAAE3wICAAAABOACAgAAAAHhAgIAAAAB4gICAAAAAeMCAgAAAAHkAgIA9gQAIQjdAggAAAAB3gIIAAAABN8CCAAAAATgAggAAAAB4QIIAAAAAeICCAAAAAHjAggAAAAB5AIIAPcEACEL0wIAAPgEADDUAgAA-AMAENUCAAD4BAAw1gIBANYEACHtAgEA1gQAIfoCEAD5BAAh-wIQAPkEACH8AhAA5QQAIf0CEADlBAAh_gJAANkEACH_AkAA-gQAIQ0HAADeBAAgLQAA_gQAIC4AAP4EACA_AAD-BAAgQAAA_gQAIN0CEAAAAAHeAhAAAAAF3wIQAAAABeACEAAAAAHhAhAAAAAB4gIQAAAAAeMCEAAAAAHkAhAA_QQAIQsHAADeBAAgLQAA_AQAIC4AAPwEACDdAkAAAAAB3gJAAAAABd8CQAAAAAXgAkAAAAAB4QJAAAAAAeICQAAAAAHjAkAAAAAB5AJAAPsEACELBwAA3gQAIC0AAPwEACAuAAD8BAAg3QJAAAAAAd4CQAAAAAXfAkAAAAAF4AJAAAAAAeECQAAAAAHiAkAAAAAB4wJAAAAAAeQCQAD7BAAhCN0CQAAAAAHeAkAAAAAF3wJAAAAABeACQAAAAAHhAkAAAAAB4gJAAAAAAeMCQAAAAAHkAkAA_AQAIQ0HAADeBAAgLQAA_gQAIC4AAP4EACA_AAD-BAAgQAAA_gQAIN0CEAAAAAHeAhAAAAAF3wIQAAAABeACEAAAAAHhAhAAAAAB4gIQAAAAAeMCEAAAAAHkAhAA_QQAIQjdAhAAAAAB3gIQAAAABd8CEAAAAAXgAhAAAAAB4QIQAAAAAeICEAAAAAHjAhAAAAAB5AIQAP4EACEL0wIAAP8EADDUAgAA4gMAENUCAAD_BAAw1gIBANYEACHcAkAA2QQAIYADAQDWBAAhgQMBANYEACGCAwIA9QQAIYMDAQDYBAAhhAMgAOYEACGFA0AA2QQAIRDTAgAAgAUAMNQCAADMAwAQ1QIAAIAFADDWAgEA1gQAIdwCQADZBAAh8wIAAIIFiQMi9AIBANgEACGAAwEA1gQAIYUDQADZBAAhhgMBAOQEACGHAwAAgQWIAyKJAxAA5QQAIYoDIADmBAAhiwMBANgEACGMA0AA-gQAIY0DAQDkBAAhBwcAANsEACAtAACGBQAgLgAAhgUAIN0CAAAAiAMC3gIAAACIAwjfAgAAAIgDCOQCAACFBYgDIgcHAADbBAAgLQAAhAUAIC4AAIQFACDdAgAAAIkDAt4CAAAAiQMI3wIAAACJAwjkAgAAgwWJAyIHBwAA2wQAIC0AAIQFACAuAACEBQAg3QIAAACJAwLeAgAAAIkDCN8CAAAAiQMI5AIAAIMFiQMiBN0CAAAAiQMC3gIAAACJAwjfAgAAAIkDCOQCAACEBYkDIgcHAADbBAAgLQAAhgUAIC4AAIYFACDdAgAAAIgDAt4CAAAAiAMI3wIAAACIAwjkAgAAhQWIAyIE3QIAAACIAwLeAgAAAIgDCN8CAAAAiAMI5AIAAIYFiAMiFdMCAACHBQAw1AIAALIDABDVAgAAhwUAMNYCAQDWBAAh3AJAANkEACH0AgEA2AQAIYADAQDWBAAhhQNAANkEACGOAwEA1wQAIY8DEADlBAAhkAMQAOUEACGRAxAA5QQAIZIDEADlBAAhkwMQAOUEACGUAxAA5QQAIZUDEADlBAAhlgMQAOUEACGXAxAA5QQAIZgDEADlBAAhmQMBAOQEACGaA0AA2QQAIQnTAgAAiAUAMNQCAACaAwAQ1QIAAIgFADDWAgEA1gQAIekCAQDXBAAhhgMBANYEACGJAxAA5QQAIZsDAQDkBAAhnAMBAOQEACEH0wIAAIkFADDUAgAAgAMAENUCAACJBQAw1gIBANYEACHXAgEA5AQAIegCAQDYBAAhnQNAANkEACEL0wIAAIoFADDUAgAA6AIAENUCAACKBQAw1gIEAIsFACHYAgEA5AQAIdwCQADZBAAh6QIBANgEACGeAwEA1wQAIZ8DAQDYBAAhoAMBAOQEACGhAwAAjAUAIA0HAADbBAAgLQAAjwUAIC4AAI8FACA_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_AwEA5AQAIcADAACtBcEDIsIDQADZBAAhwwNAANkEACHEA0AA-gQAIcUDQAD6BAAhxgMCAPUEACHHAxAA5QQAIcgDEAD5BAAhyQMBAOQEACHKAxAA5QQAIcsDQAD6BAAhzAMBAOQEACHNA0AA-gQAIQcHAADbBAAgLQAAsgUAIC4AALIFACDdAgAAAMEDAt4CAAAAwQMI3wIAAADBAwjkAgAAsQXBAyIHBwAA2wQAIC0AALAFACAuAACwBQAg3QIAAADCAwLeAgAAAMIDCN8CAAAAwgMI5AIAAK8FwgMiBwcAANsEACAtAACwBQAgLgAAsAUAIN0CAAAAwgMC3gIAAADCAwjfAgAAAMIDCOQCAACvBcIDIgTdAgAAAMIDAt4CAAAAwgMI3wIAAADCAwjkAgAAsAXCAyIHBwAA2wQAIC0AALIFACAuAACyBQAg3QIAAADBAwLeAgAAAMEDCN8CAAAAwQMI5AIAALEFwQMiBN0CAAAAwQMC3gIAAADBAwjfAgAAAMEDCOQCAACyBcEDIgvTAgAAswUAMNQCAAC4AQAQ1QIAALMFADDWAgEA1gQAIYADAQDWBAAhlQMQAOUEACGcAwEA5AQAIc4DAQDWBAAhzwMCAPUEACHQAxAA5QQAIdEDQADZBAAhCdMCAAC0BQAw1AIAAKABABDVAgAAtAUAMNYCAQDWBAAh1wIBAOQEACHzAgAAtgXXAyLSAwEA1wQAIdMDAQDXBAAh1QMAALUF1QMiBwcAANsEACAtAAC6BQAgLgAAugUAIN0CAAAA1QMC3gIAAADVAwjfAgAAANUDCOQCAAC5BdUDIgcHAADbBAAgLQAAuAUAIC4AALgFACDdAgAAANcDAt4CAAAA1wMI3wIAAADXAwjkAgAAtwXXAyIHBwAA2wQAIC0AALgFACAuAAC4BQAg3QIAAADXAwLeAgAAANcDCN8CAAAA1wMI5AIAALcF1wMiBN0CAAAA1wMC3gIAAADXAwjfAgAAANcDCOQCAAC4BdcDIgcHAADbBAAgLQAAugUAIC4AALoFACDdAgAAANUDAt4CAAAA1QMI3wIAAADVAwjkAgAAuQXVAyIE3QIAAADVAwLeAgAAANUDCN8CAAAA1QMI5AIAALoF1QMiDAMAAJsFACDTAgAAuwUAMNQCAAB7ABDVAgAAuwUAMNYCBADABQAh2AIBALwFACHcAkAAvgUAIekCAQCYBQAhngMBAJcFACGfAwEAmAUAIaADAQC8BQAhoQMAAL0FACAI3QIBAAAAAd4CAQAAAAXfAgEAAAAF4AIBAAAAAeECAQAAAAHiAgEAAAAB4wIBAAAAAeQCAQC_BQAhDN0CgAAAAAHgAoAAAAAB4QKAAAAAAeICgAAAAAHjAoAAAAAB5AKAAAAAAaIDAQAAAAGjAwEAAAABpAMBAAAAAaUDgAAAAAGmA4AAAAABpwOAAAAAAQjdAkAAAAAB3gJAAAAABN8CQAAAAATgAkAAAAAB4QJAAAAAAeICQAAAAAHjAkAAAAAB5AJAANwEACEI3QIBAAAAAd4CAQAAAAXfAgEAAAAF4AIBAAAAAeECAQAAAAHiAgEAAAAB4wIBAAAAAeQCAQC_BQAhCN0CBAAAAAHeAgQAAAAE3wIEAAAABOACBAAAAAHhAgQAAAAB4gIEAAAAAeMCBAAAAAHkAgQAjwUAIQjdAgEAAAAB3gIBAAAABN8CAQAAAATgAgEAAAAB4QIBAAAAAeICAQAAAAHjAgEAAAAB5AIBAMIFACEI3QIBAAAAAd4CAQAAAATfAgEAAAAE4AIBAAAAAeECAQAAAAHiAgEAAAAB4wIBAAAAAeQCAQDCBQAhDAMAAMQFACAGAADFBQAg0wIAAMMFADDUAgAAaAAQ1QIAAMMFADDWAgEAwQUAIdcCAQDBBQAh2AIBAMEFACHZAgEAlwUAIdoCAQCYBQAh2wIBAJgFACHcAkAAvgUAIRYEAACaBQAgBQAAyAUAIAYAAMkFACAMAAD0BQAgEgAAzwUAIBQAAO8FACAVAADdBQAgFwAA9gUAIBgAAO4FACAZAADuBQAgGgAA9QUAINMCAADxBQAw1AIAAAUAENUCAADxBQAw1gIBAMEFACHXAgEAvAUAIfMCAADzBdcDItIDAQCXBQAh0wMBAJcFACHVAwAA8gXVAyLYAwAABQAg2QMAAAUAIBYDAACkBQAgBAAAmgUAIAgAAKoFACAJAACoBQAgCwAAqQUAIA4AAKUFACATAACmBQAgFgAApwUAIBcAAKsFACDTAgAAogUAMNQCAAADABDVAgAAogUAMNYCAQDBBQAh2gIBAJgFACHoAgEAlwUAIekCAQCYBQAh7AIgAKMFACGwAwEAmAUAIbQDAQCXBQAhvQMBAJgFACHYAwAAAwAg2QMAAAMAIAwFAADIBQAgBgAAyQUAINMCAADGBQAw1AIAAGQAENUCAADGBQAw1gIBAMEFACHXAgEAvAUAIegCAQCXBQAh6QIBAJgFACHqAhAAxwUAIesCAQCYBQAh7AIgAKMFACEI3QIQAAAAAd4CEAAAAATfAhAAAAAE4AIQAAAAAeECEAAAAAHiAhAAAAAB4wIQAAAAAeQCEADqBAAhA7UDAAAMACC2AwAADAAgtwMAAAwAIBYDAACkBQAgBAAAmgUAIAgAAKoFACAJAACoBQAgCwAAqQUAIA4AAKUFACATAACmBQAgFgAApwUAIBcAAKsFACDTAgAAogUAMNQCAAADABDVAgAAogUAMNYCAQDBBQAh2gIBAJgFACHoAgEAlwUAIekCAQCYBQAh7AIgAKMFACGwAwEAmAUAIbQDAQCXBQAhvQMBAJgFACHYAwAAAwAg2QMAAAMAIA4EAACaBQAgBgAAxQUAIAoAAMwFACALAACpBQAg0wIAAMoFADDUAgAAXwAQ1QIAAMoFADDWAgEAwQUAIdcCAQDBBQAh6AIBAJcFACHpAgEAmAUAIewCIACjBQAh-AICAMsFACH5AgAA7gQAIAjdAgIAAAAB3gICAAAABN8CAgAAAATgAgIAAAAB4QICAAAAAeICAgAAAAHjAgIAAAAB5AICANsEACEDtQMAABgAILYDAAAYACC3AwAAGAAgCAYAAMkFACDTAgAAzQUAMNQCAABaABDVAgAAzQUAMNYCAQDBBQAh1wIBALwFACHoAgEAmAUAIZ0DQAC-BQAhCgYAAMkFACASAADPBQAg0wIAAM4FADDUAgAAQAAQ1QIAAM4FADDWAgEAwQUAIdcCAQC8BQAh6AIBAJcFACHpAgEAmAUAIeoCEADHBQAhA7UDAAA7ACC2AwAAOwAgtwMAADsAIBEEAACaBQAgBgAAyQUAINMCAADQBQAw1AIAACwAENUCAADQBQAw1gIBAMEFACHXAgEAvAUAIekCAQCYBQAh7AIgAKMFACGoAwEAlwUAIakDAADRBaoDIqoDEADHBQAhqwMQANIFACGsAwIA0wUAIa0DAgDLBQAhrgNAAJkFACGvA0AAmQUAIQTdAgAAAKoDAt4CAAAAqgMI3wIAAACqAwjkAgAAlAWqAyII3QIQAAAAAd4CEAAAAAXfAhAAAAAF4AIQAAAAAeECEAAAAAHiAhAAAAAB4wIQAAAAAeQCEAD-BAAhCN0CAgAAAAHeAgIAAAAF3wICAAAABeACAgAAAAHhAgIAAAAB4gICAAAAAeMCAgAAAAHkAgIA3gQAIRMDAACbBQAgBAAA1wUAIBQAANgFACDTAgAA1AUAMNQCAABGABDVAgAA1AUAMNYCAQDBBQAh3AJAAL4FACHzAgAA1gWJAyL0AgEAmAUAIYADAQDBBQAhhQNAAL4FACGGAwEAvAUAIYcDAADVBYgDIokDEADHBQAhigMgAKMFACGLAwEAmAUAIYwDQACZBQAhjQMBALwFACEE3QIAAACIAwLeAgAAAIgDCN8CAAAAiAMI5AIAAIYFiAMiBN0CAAAAiQMC3gIAAACJAwjfAgAAAIkDCOQCAACEBYkDIikDAACbBQAgBQAAyAUAIAYAAMUFACAJAADlBQAgCwAA7AUAIAwAAOEFACANAADwBQAgDgAA7QUAIBEAAO4FACAUAADvBQAgFQAA3QUAINMCAADpBQAw1AIAAAgAENUCAADpBQAw1gIBAMEFACHXAgEAwQUAIdwCQAC-BQAh7QIBAMEFACHzAgAA6wXCAyL0AgEAmAUAIYEDAQDBBQAhhQNAAL4FACGUAxAAxwUAIZUDEADSBQAhvgMBAJcFACG_AwEAvAUAIcADAADqBcEDIsIDQAC-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_AIQAMcFACH9AhAAxwUAIf4CQAC-BQAh_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-wUAIYADAQD7BQAhlQMQAIcGACGcAwEA_AUAIc8DAgCVBgAh0AMQAIcGACHRA0AA_QUAIQcnAACqDAAgKAAAsAwAINoDAACrDAAg2wMAAK8MACDeAwAABQAg3wMAAAUAIOADAAABACAFJwAAqAwAICgAAK0MACDaAwAAqQwAINsDAACsDAAg4AMAAAoAIAkDAACaBgAgBAAAmwYAINYCAQAAAAGAAwEAAAABlQMQAAAAAZwDAQAAAAHPAwIAAAAB0AMQAAAAAdEDQAAAAAEDJwAAqgwAINoDAACrDAAg4AMAAAEAIAMnAACoDAAg2gMAAKkMACDgAwAACgAgBCcAAIsGADDaAwAAjAYAMNwDAACOBgAg4AMAAI8GADADJwAApgwAINoDAACnDAAg4AMAANcBACAAAAAAAAXdAwIAAAAB4wMCAAAAAeQDAgAAAAHlAwIAAAAB5gMCAAAAAQLdAwEAAAAE5wMBAAAABQLdAwEAAAAE5wMBAAAABQHdAwAAAPMCAgsnAACqBgAwKAAArwYAMNoDAACrBgAw2wMAAKwGADDcAwAArQYAIN0DAACuBgAw3gMAAK4GADDfAwAArgYAMOADAACuBgAw4QMAALAGADDiAwAAsQYAMAUnAADMCwAgKAAApAwAINoDAADNCwAg2wMAAKMMACDgAwAA1wEAIAUnAADKCwAgKAAAoQwAINoDAADLCwAg2wMAAKAMACDgAwAAYQAgIgMAAKgHACAFAACmBwAgBgAApwcAIAkAAKsHACAMAACpBwAgDQAArwcAIA4AAKoHACARAACsBwAgFAAArQcAIBUAAK4HACDWAgEAAAAB1wIBAAAAAdwCQAAAAAHtAgEAAAAB8wIAAADCAwL0AgEAAAABgQMBAAAAAYUDQAAAAAGUAxAAAAABlQMQAAAAAb4DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQIAAAAKACAnAAClBwAgAwAAAAoAICcAAKUHACAoAAC4BgAgASAAAJ8MADAnAwAAmwUAIAUAAMgFACAGAADFBQAgCQAA5QUAIAsAAOwFACAMAADhBQAgDQAA8AUAIA4AAO0FACARAADuBQAgFAAA7wUAIBUAAN0FACDTAgAA6QUAMNQCAAAIABDVAgAA6QUAMNYCAQAAAAHXAgEAwQUAIdwCQAC-BQAh7QIBAMEFACHzAgAA6wXCAyL0AgEAmAUAIYEDAQDBBQAhhQNAAL4FACGUAxAAxwUAIZUDEADSBQAhvgMBAAAAAb8DAQC8BQAhwAMAAOoFwQMiwgNAAL4FACHDA0AAvgUAIcQDQACZBQAhxQNAAJkFACHGAwIAywUAIccDEADHBQAhyAMQANIFACHJAwEAvAUAIcoDEADHBQAhywNAAJkFACHMAwEAvAUAIc0DQACZBQAhAgAAAAoAICAAALgGACACAAAAsgYAICAAALMGACAc0wIAALEGADDUAgAAsgYAENUCAACxBgAw1gIBAMEFACHXAgEAwQUAIdwCQAC-BQAh7QIBAMEFACHzAgAA6wXCAyL0AgEAmAUAIYEDAQDBBQAhhQNAAL4FACGUAxAAxwUAIZUDEADSBQAhvgMBAJcFACG_AwEAvAUAIcADAADqBcEDIsIDQAC-BQAhwwNAAL4FACHEA0AAmQUAIcUDQACZBQAhxgMCAMsFACHHAxAAxwUAIcgDEADSBQAhyQMBALwFACHKAxAAxwUAIcsDQACZBQAhzAMBALwFACHNA0AAmQUAIRzTAgAAsQYAMNQCAACyBgAQ1QIAALEGADDWAgEAwQUAIdcCAQDBBQAh3AJAAL4FACHtAgEAwQUAIfMCAADrBcIDIvQCAQCYBQAhgQMBAMEFACGFA0AAvgUAIZQDEADHBQAhlQMQANIFACG-AwEAlwUAIb8DAQC8BQAhwAMAAOoFwQMiwgNAAL4FACHDA0AAvgUAIcQDQACZBQAhxQNAAJkFACHGAwIAywUAIccDEADHBQAhyAMQANIFACHJAwEAvAUAIcoDEADHBQAhywNAAJkFACHMAwEAvAUAIc0DQACZBQAhGNYCAQD7BQAh1wIBAPsFACHcAkAA_QUAIe0CAQD7BQAh8wIAALUGwgMi9AIBAPwFACGBAwEA-wUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhAd0DAAAAwQMCAd0DAAAAwgMCAd0DQAAAAAEF3QMQAAAAAeMDEAAAAAHkAxAAAAAB5QMQAAAAAeYDEAAAAAEiAwAAuwYAIAUAALkGACAGAAC6BgAgCQAAvgYAIAwAALwGACANAADCBgAgDgAAvQYAIBEAAL8GACAUAADABgAgFQAAwQYAINYCAQD7BQAh1wIBAPsFACHcAkAA_QUAIe0CAQD7BQAh8wIAALUGwgMi9AIBAPwFACGBAwEA-wUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhCycAAJoHADAoAACeBwAw2gMAAJsHADDbAwAAnAcAMNwDAACdBwAg3QMAAI8GADDeAwAAjwYAMN8DAACPBgAw4AMAAI8GADDhAwAAnwcAMOIDAACSBgAwBScAANYLACAoAACdDAAg2gMAANcLACDbAwAAnAwAIOADAADXAQAgBycAANQLACAoAACaDAAg2gMAANULACDbAwAAmQwAIN4DAAAFACDfAwAABQAg4AMAAAEAIAUnAADSCwAgKAAAlwwAINoDAADTCwAg2wMAAJYMACDgAwAAiQIAIAcnAADQCwAgKAAAlAwAINoDAADRCwAg2wMAAJMMACDeAwAALAAg3wMAACwAIOADAABVACAFJwAAzgsAICgAAJEMACDaAwAAzwsAINsDAACQDAAg4AMAAGEAIAsnAACJBwAwKAAAjgcAMNoDAACKBwAw2wMAAIsHADDcAwAAjAcAIN0DAACNBwAw3gMAAI0HADDfAwAAjQcAMOADAACNBwAw4QMAAI8HADDiAwAAkAcAMAsnAADcBgAwKAAA4QYAMNoDAADdBgAw2wMAAN4GADDcAwAA3wYAIN0DAADgBgAw3gMAAOAGADDfAwAA4AYAMOADAADgBgAw4QMAAOIGADDiAwAA4wYAMAsnAADKBgAwKAAAzwYAMNoDAADLBgAw2wMAAMwGADDcAwAAzQYAIN0DAADOBgAw3gMAAM4GADDfAwAAzgYAMOADAADOBgAw4QMAANAGADDiAwAA0QYAMAcnAADDBgAgKAAAxgYAINoDAADEBgAg2wMAAMUGACDeAwAAJgAg3wMAACYAIOADAAAoACAIDAAAyQYAINYCAQAAAAHcAkAAAAABgQMBAAAAAYIDAgAAAAGDAwEAAAABhAMgAAAAAYUDQAAAAAECAAAAKAAgJwAAwwYAIAMAAAAmACAnAADDBgAgKAAAxwYAIAoAAAAmACAMAADIBgAgIAAAxwYAINYCAQD7BQAh3AJAAP0FACGBAwEA-wUAIYIDAgCVBgAhgwMBAPwFACGEAyAAiAYAIYUDQAD9BQAhCAwAAMgGACDWAgEA-wUAIdwCQAD9BQAhgQMBAPsFACGCAwIAlQYAIYMDAQD8BQAhhAMgAIgGACGFA0AA_QUAIQUnAACLDAAgKAAAjgwAINoDAACMDAAg2wMAAI0MACDgAwAAiQIAIAMnAACLDAAg2gMAAIwMACDgAwAAiQIAIA4DAADbBgAgFAAA2gYAINYCAQAAAAHcAkAAAAAB8wIAAACJAwL0AgEAAAABhQNAAAAAAYYDAQAAAAGHAwAAAIgDAokDEAAAAAGKAyAAAAABiwMBAAAAAYwDQAAAAAGNAwEAAAABAgAAAEgAICcAANkGACADAAAASAAgJwAA2QYAICgAANYGACABIAAAigwAMBMDAACbBQAgBAAA1wUAIBQAANgFACDTAgAA1AUAMNQCAABGABDVAgAA1AUAMNYCAQAAAAHcAkAAvgUAIfMCAADWBYkDIvQCAQCYBQAhgAMBAMEFACGFA0AAvgUAIYYDAQC8BQAhhwMAANUFiAMiiQMQAMcFACGKAyAAowUAIYsDAQCYBQAhjANAAJkFACGNAwEAvAUAIQIAAABIACAgAADWBgAgAgAAANIGACAgAADTBgAgENMCAADRBgAw1AIAANIGABDVAgAA0QYAMNYCAQDBBQAh3AJAAL4FACHzAgAA1gWJAyL0AgEAmAUAIYADAQDBBQAhhQNAAL4FACGGAwEAvAUAIYcDAADVBYgDIokDEADHBQAhigMgAKMFACGLAwEAmAUAIYwDQACZBQAhjQMBALwFACEQ0wIAANEGADDUAgAA0gYAENUCAADRBgAw1gIBAMEFACHcAkAAvgUAIfMCAADWBYkDIvQCAQCYBQAhgAMBAMEFACGFA0AAvgUAIYYDAQC8BQAhhwMAANUFiAMiiQMQAMcFACGKAyAAowUAIYsDAQCYBQAhjANAAJkFACGNAwEAvAUAIQzWAgEA-wUAIdwCQAD9BQAh8wIAANUGiQMi9AIBAPwFACGFA0AA_QUAIYYDAQD8BQAhhwMAANQGiAMiiQMQAIcGACGKAyAAiAYAIYsDAQD8BQAhjANAALYGACGNAwEA_AUAIQHdAwAAAIgDAgHdAwAAAIkDAg4DAADYBgAgFAAA1wYAINYCAQD7BQAh3AJAAP0FACHzAgAA1QaJAyL0AgEA_AUAIYUDQAD9BQAhhgMBAPwFACGHAwAA1AaIAyKJAxAAhwYAIYoDIACIBgAhiwMBAPwFACGMA0AAtgYAIY0DAQD8BQAhBycAAIIMACAoAACIDAAg2gMAAIMMACDbAwAAhwwAIN4DAAA3ACDfAwAANwAg4AMAADkAIAcnAACADAAgKAAAhQwAINoDAACBDAAg2wMAAIQMACDeAwAABQAg3wMAAAUAIOADAAABACAOAwAA2wYAIBQAANoGACDWAgEAAAAB3AJAAAAAAfMCAAAAiQMC9AIBAAAAAYUDQAAAAAGGAwEAAAABhwMAAACIAwKJAxAAAAABigMgAAAAAYsDAQAAAAGMA0AAAAABjQMBAAAAAQMnAACCDAAg2gMAAIMMACDgAwAAOQAgAycAAIAMACDaAwAAgQwAIOADAAABACAUAwAAhwcAIBIAAIYHACAVAACIBwAg1gIBAAAAAdwCQAAAAAH0AgEAAAABhQNAAAAAAY4DAQAAAAGPAxAAAAABkAMQAAAAAZEDEAAAAAGSAxAAAAABkwMQAAAAAZQDEAAAAAGVAxAAAAABlgMQAAAAAZcDEAAAAAGYAxAAAAABmQMBAAAAAZoDQAAAAAECAAAAOQAgJwAAhQcAIAMAAAA5ACAnAACFBwAgKAAA5gYAIAEgAAD_CwAwGQMAAJsFACAEAADXBQAgEgAAzwUAIBUAAN0FACDTAgAA3AUAMNQCAAA3ABDVAgAA3AUAMNYCAQAAAAHcAkAAvgUAIfQCAQCYBQAhgAMBAMEFACGFA0AAvgUAIY4DAQAAAAGPAxAAxwUAIZADEADHBQAhkQMQAMcFACGSAxAAxwUAIZMDEADHBQAhlAMQAMcFACGVAxAAxwUAIZYDEADHBQAhlwMQAMcFACGYAxAAxwUAIZkDAQC8BQAhmgNAAL4FACECAAAAOQAgIAAA5gYAIAIAAADkBgAgIAAA5QYAIBXTAgAA4wYAMNQCAADkBgAQ1QIAAOMGADDWAgEAwQUAIdwCQAC-BQAh9AIBAJgFACGAAwEAwQUAIYUDQAC-BQAhjgMBAJcFACGPAxAAxwUAIZADEADHBQAhkQMQAMcFACGSAxAAxwUAIZMDEADHBQAhlAMQAMcFACGVAxAAxwUAIZYDEADHBQAhlwMQAMcFACGYAxAAxwUAIZkDAQC8BQAhmgNAAL4FACEV0wIAAOMGADDUAgAA5AYAENUCAADjBgAw1gIBAMEFACHcAkAAvgUAIfQCAQCYBQAhgAMBAMEFACGFA0AAvgUAIY4DAQCXBQAhjwMQAMcFACGQAxAAxwUAIZEDEADHBQAhkgMQAMcFACGTAxAAxwUAIZQDEADHBQAhlQMQAMcFACGWAxAAxwUAIZcDEADHBQAhmAMQAMcFACGZAwEAvAUAIZoDQAC-BQAhEdYCAQD7BQAh3AJAAP0FACH0AgEA_AUAIYUDQAD9BQAhjgMBAPsFACGPAxAAhwYAIZADEACHBgAhkQMQAIcGACGSAxAAhwYAIZMDEACHBgAhlAMQAIcGACGVAxAAhwYAIZYDEACHBgAhlwMQAIcGACGYAxAAhwYAIZkDAQD8BQAhmgNAAP0FACEUAwAA6AYAIBIAAOcGACAVAADpBgAg1gIBAPsFACHcAkAA_QUAIfQCAQD8BQAhhQNAAP0FACGOAwEA-wUAIY8DEACHBgAhkAMQAIcGACGRAxAAhwYAIZIDEACHBgAhkwMQAIcGACGUAxAAhwYAIZUDEACHBgAhlgMQAIcGACGXAxAAhwYAIZgDEACHBgAhmQMBAPwFACGaA0AA_QUAIQsnAAD1BgAwKAAA-gYAMNoDAAD2BgAw2wMAAPcGADDcAwAA-AYAIN0DAAD5BgAw3gMAAPkGADDfAwAA-QYAMOADAAD5BgAw4QMAAPsGADDiAwAA_AYAMAcnAADpCwAgKAAA_QsAINoDAADqCwAg2wMAAPwLACDeAwAABQAg3wMAAAUAIOADAAABACALJwAA6gYAMCgAAO4GADDaAwAA6wYAMNsDAADsBgAw3AMAAO0GACDdAwAAzgYAMN4DAADOBgAw3wMAAM4GADDgAwAAzgYAMOEDAADvBgAw4gMAANEGADAOAwAA2wYAIAQAAPQGACDWAgEAAAAB3AJAAAAAAfMCAAAAiQMC9AIBAAAAAYADAQAAAAGFA0AAAAABhwMAAACIAwKJAxAAAAABigMgAAAAAYsDAQAAAAGMA0AAAAABjQMBAAAAAQIAAABIACAnAADzBgAgAwAAAEgAICcAAPMGACAoAADxBgAgASAAAPsLADACAAAASAAgIAAA8QYAIAIAAADSBgAgIAAA8AYAIAzWAgEA-wUAIdwCQAD9BQAh8wIAANUGiQMi9AIBAPwFACGAAwEA-wUAIYUDQAD9BQAhhwMAANQGiAMiiQMQAIcGACGKAyAAiAYAIYsDAQD8BQAhjANAALYGACGNAwEA_AUAIQ4DAADYBgAgBAAA8gYAINYCAQD7BQAh3AJAAP0FACHzAgAA1QaJAyL0AgEA_AUAIYADAQD7BQAhhQNAAP0FACGHAwAA1AaIAyKJAxAAhwYAIYoDIACIBgAhiwMBAPwFACGMA0AAtgYAIY0DAQD8BQAhBScAAPYLACAoAAD5CwAg2gMAAPcLACDbAwAA-AsAIOADAAAKACAOAwAA2wYAIAQAAPQGACDWAgEAAAAB3AJAAAAAAfMCAAAAiQMC9AIBAAAAAYADAQAAAAGFA0AAAAABhwMAAACIAwKJAxAAAAABigMgAAAAAYsDAQAAAAGMA0AAAAABjQMBAAAAAQMnAAD2CwAg2gMAAPcLACDgAwAACgAgBwMAAIMHACATAACEBwAg1gIBAAAAAekCAQAAAAGJAxAAAAABmwMBAAAAAZwDAQAAAAECAAAAPQAgJwAAggcAIAMAAAA9ACAnAACCBwAgKAAA_wYAIAEgAAD1CwAwDAMAAJsFACATAADaBQAgFAAA2wUAINMCAADZBQAw1AIAADsAENUCAADZBQAw1gIBAAAAAekCAQCXBQAhhgMBAMEFACGJAxAAxwUAIZsDAQC8BQAhnAMBALwFACECAAAAPQAgIAAA_wYAIAIAAAD9BgAgIAAA_gYAIAnTAgAA_AYAMNQCAAD9BgAQ1QIAAPwGADDWAgEAwQUAIekCAQCXBQAhhgMBAMEFACGJAxAAxwUAIZsDAQC8BQAhnAMBALwFACEJ0wIAAPwGADDUAgAA_QYAENUCAAD8BgAw1gIBAMEFACHpAgEAlwUAIYYDAQDBBQAhiQMQAMcFACGbAwEAvAUAIZwDAQC8BQAhBdYCAQD7BQAh6QIBAPsFACGJAxAAhwYAIZsDAQD8BQAhnAMBAPwFACEHAwAAgAcAIBMAAIEHACDWAgEA-wUAIekCAQD7BQAhiQMQAIcGACGbAwEA_AUAIZwDAQD8BQAhBycAAO0LACAoAADzCwAg2gMAAO4LACDbAwAA8gsAIN4DAAAFACDfAwAABQAg4AMAAAEAIAcnAADrCwAgKAAA8AsAINoDAADsCwAg2wMAAO8LACDeAwAAQAAg3wMAAEAAIOADAABYACAHAwAAgwcAIBMAAIQHACDWAgEAAAAB6QIBAAAAAYkDEAAAAAGbAwEAAAABnAMBAAAAAQMnAADtCwAg2gMAAO4LACDgAwAAAQAgAycAAOsLACDaAwAA7AsAIOADAABYACAUAwAAhwcAIBIAAIYHACAVAACIBwAg1gIBAAAAAdwCQAAAAAH0AgEAAAABhQNAAAAAAY4DAQAAAAGPAxAAAAABkAMQAAAAAZEDEAAAAAGSAxAAAAABkwMQAAAAAZQDEAAAAAGVAxAAAAABlgMQAAAAAZcDEAAAAAGYAxAAAAABmQMBAAAAAZoDQAAAAAEEJwAA9QYAMNoDAAD2BgAw3AMAAPgGACDgAwAA-QYAMAMnAADpCwAg2gMAAOoLACDgAwAAAQAgBCcAAOoGADDaAwAA6wYAMNwDAADtBgAg4AMAAM4GADAMDwAAmAcAIBAAAJkHACDWAgEAAAAB3AJAAAAAAfMCAAAAuwMC9AIBAAAAAYUDQAAAAAGYAxAAAAABuAMBAAAAAbkDAQAAAAG7A0AAAAABvAMBAAAAAQIAAAAzACAnAACXBwAgAwAAADMAICcAAJcHACAoAACUBwAgASAAAOgLADARBAAA1wUAIA8AAJsFACAQAACbBQAg0wIAAN4FADDUAgAAMQAQ1QIAAN4FADDWAgEAAAAB3AJAAL4FACHzAgAA3wW7AyL0AgEAmAUAIYADAQDBBQAhhQNAAL4FACGYAxAA0gUAIbgDAQC8BQAhuQMBAJgFACG7A0AAmQUAIbwDAQC8BQAhAgAAADMAICAAAJQHACACAAAAkQcAICAAAJIHACAO0wIAAJAHADDUAgAAkQcAENUCAACQBwAw1gIBAMEFACHcAkAAvgUAIfMCAADfBbsDIvQCAQCYBQAhgAMBAMEFACGFA0AAvgUAIZgDEADSBQAhuAMBALwFACG5AwEAmAUAIbsDQACZBQAhvAMBALwFACEO0wIAAJAHADDUAgAAkQcAENUCAACQBwAw1gIBAMEFACHcAkAAvgUAIfMCAADfBbsDIvQCAQCYBQAhgAMBAMEFACGFA0AAvgUAIZgDEADSBQAhuAMBALwFACG5AwEAmAUAIbsDQACZBQAhvAMBALwFACEK1gIBAPsFACHcAkAA_QUAIfMCAACTB7sDIvQCAQD8BQAhhQNAAP0FACGYAxAAtwYAIbgDAQD8BQAhuQMBAPwFACG7A0AAtgYAIbwDAQD8BQAhAd0DAAAAuwMCDA8AAJUHACAQAACWBwAg1gIBAPsFACHcAkAA_QUAIfMCAACTB7sDIvQCAQD8BQAhhQNAAP0FACGYAxAAtwYAIbgDAQD8BQAhuQMBAPwFACG7A0AAtgYAIbwDAQD8BQAhBycAAOALACAoAADmCwAg2gMAAOELACDbAwAA5QsAIN4DAAAFACDfAwAABQAg4AMAAAEAIAcnAADeCwAgKAAA4wsAINoDAADfCwAg2wMAAOILACDeAwAABQAg3wMAAAUAIOADAAABACAMDwAAmAcAIBAAAJkHACDWAgEAAAAB3AJAAAAAAfMCAAAAuwMC9AIBAAAAAYUDQAAAAAGYAxAAAAABuAMBAAAAAbkDAQAAAAG7A0AAAAABvAMBAAAAAQMnAADgCwAg2gMAAOELACDgAwAAAQAgAycAAN4LACDaAwAA3wsAIOADAAABACAJAwAAmgYAIAgAAKQHACDWAgEAAAABlQMQAAAAAZwDAQAAAAHOAwEAAAABzwMCAAAAAdADEAAAAAHRA0AAAAABAgAAAA4AICcAAKMHACADAAAADgAgJwAAowcAICgAAKEHACABIAAA3QsAMAIAAAAOACAgAAChBwAgAgAAAJMGACAgAACgBwAgB9YCAQD7BQAhlQMQAIcGACGcAwEA_AUAIc4DAQD7BQAhzwMCAJUGACHQAxAAhwYAIdEDQAD9BQAhCQMAAJcGACAIAACiBwAg1gIBAPsFACGVAxAAhwYAIZwDAQD8BQAhzgMBAPsFACHPAwIAlQYAIdADEACHBgAh0QNAAP0FACEFJwAA2AsAICgAANsLACDaAwAA2QsAINsDAADaCwAg4AMAAGYAIAkDAACaBgAgCAAApAcAINYCAQAAAAGVAxAAAAABnAMBAAAAAc4DAQAAAAHPAwIAAAAB0AMQAAAAAdEDQAAAAAEDJwAA2AsAINoDAADZCwAg4AMAAGYAICIDAACoBwAgBQAApgcAIAYAAKcHACAJAACrBwAgDAAAqQcAIA0AAK8HACAOAACqBwAgEQAArAcAIBQAAK0HACAVAACuBwAg1gIBAAAAAdcCAQAAAAHcAkAAAAAB7QIBAAAAAfMCAAAAwgMC9AIBAAAAAYEDAQAAAAGFA0AAAAABlAMQAAAAAZUDEAAAAAG-AwEAAAABwAMAAADBAwLCA0AAAAABwwNAAAAAAcQDQAAAAAHFA0AAAAABxgMCAAAAAccDEAAAAAHIAxAAAAAByQMBAAAAAcoDEAAAAAHLA0AAAAABzAMBAAAAAc0DQAAAAAEEJwAAmgcAMNoDAACbBwAw3AMAAJ0HACDgAwAAjwYAMAMnAADWCwAg2gMAANcLACDgAwAA1wEAIAMnAADUCwAg2gMAANULACDgAwAAAQAgAycAANILACDaAwAA0wsAIOADAACJAgAgAycAANALACDaAwAA0QsAIOADAABVACADJwAAzgsAINoDAADPCwAg4AMAAGEAIAQnAACJBwAw2gMAAIoHADDcAwAAjAcAIOADAACNBwAwBCcAANwGADDaAwAA3QYAMNwDAADfBgAg4AMAAOAGADAEJwAAygYAMNoDAADLBgAw3AMAAM0GACDgAwAAzgYAMAMnAADDBgAg2gMAAMQGACDgAwAAKAAgAd0DAQAAAAQB3QMBAAAABAQnAACqBgAw2gMAAKsGADDcAwAArQYAIOADAACuBgAwAycAAMwLACDaAwAAzQsAIOADAADXAQAgAycAAMoLACDaAwAAywsAIOADAABhACAAAAAAAALdAwEAAAAE5wMBAAAABQsnAADXBwAwKAAA2wcAMNoDAADYBwAw2wMAANkHADDcAwAA2gcAIN0DAACuBgAw3gMAAK4GADDfAwAArgYAMOADAACuBgAw4QMAANwHADDiAwAAsQYAMAsnAADLBwAwKAAA0AcAMNoDAADMBwAw2wMAAM0HADDcAwAAzgcAIN0DAADPBwAw3gMAAM8HADDfAwAAzwcAMOADAADPBwAw4QMAANEHADDiAwAA0gcAMAUnAAC9CwAgKAAAyAsAINoDAAC-CwAg2wMAAMcLACDgAwAA1wEAIAsnAAC_BwAwKAAAxAcAMNoDAADABwAw2wMAAMEHADDcAwAAwgcAIN0DAADDBwAw3gMAAMMHADDfAwAAwwcAMOADAADDBwAw4QMAAMUHADDiAwAAxgcAMAsEAACyBwAgBgAAswcAINYCAQAAAAHXAgEAAAAB7AIgAAAAAe4CAQAAAAHvAgIAAAAB8AIAALAHACDxAgAAsQcAIPMCAAAA8wIC9AIBAAAAAQIAAAAdACAnAADKBwAgAwAAAB0AICcAAMoHACAoAADJBwAgASAAAMYLADARBAAAmgUAIAYAAMUFACAJAADlBQAg0wIAAOMFADDUAgAAFAAQ1QIAAOMFADDWAgEAAAAB1wIBAMEFACHsAiAAowUAIe0CAQDBBQAh7gIBAJcFACHvAgIA0wUAIfACAADuBAAg8QIAAO4EACDzAgAA5AXzAiL0AgEAmAUAIdcDAADiBQAgAgAAAB0AICAAAMkHACACAAAAxwcAICAAAMgHACAN0wIAAMYHADDUAgAAxwcAENUCAADGBwAw1gIBAMEFACHXAgEAwQUAIewCIACjBQAh7QIBAMEFACHuAgEAlwUAIe8CAgDTBQAh8AIAAO4EACDxAgAA7gQAIPMCAADkBfMCIvQCAQCYBQAhDdMCAADGBwAw1AIAAMcHABDVAgAAxgcAMNYCAQDBBQAh1wIBAMEFACHsAiAAowUAIe0CAQDBBQAh7gIBAJcFACHvAgIA0wUAIfACAADuBAAg8QIAAO4EACDzAgAA5AXzAiL0AgEAmAUAIQnWAgEA-wUAIdcCAQD7BQAh7AIgAIgGACHuAgEA-wUAIe8CAgCjBgAh8AIAAKQGACDxAgAApQYAIPMCAACmBvMCIvQCAQD8BQAhCwQAAKcGACAGAACoBgAg1gIBAPsFACHXAgEA-wUAIewCIACIBgAh7gIBAPsFACHvAgIAowYAIfACAACkBgAg8QIAAKUGACDzAgAApgbzAiL0AgEA_AUAIQsEAACyBwAgBgAAswcAINYCAQAAAAHXAgEAAAAB7AIgAAAAAe4CAQAAAAHvAgIAAAAB8AIAALAHACDxAgAAsQcAIPMCAAAA8wIC9AIBAAAAAQfWAgEAAAAB-gIQAAAAAfsCEAAAAAH8AhAAAAAB_QIQAAAAAf4CQAAAAAH_AkAAAAABAgAAABoAICcAANYHACADAAAAGgAgJwAA1gcAICgAANUHACABIAAAxQsAMAwJAADlBQAg0wIAAOYFADDUAgAAGAAQ1QIAAOYFADDWAgEAAAAB7QIBAAAAAfoCEADSBQAh-wIQANIFACH8AhAAxwUAIf0CEADHBQAh_gJAAL4FACH_AkAAmQUAIQIAAAAaACAgAADVBwAgAgAAANMHACAgAADUBwAgC9MCAADSBwAw1AIAANMHABDVAgAA0gcAMNYCAQDBBQAh7QIBAMEFACH6AhAA0gUAIfsCEADSBQAh_AIQAMcFACH9AhAAxwUAIf4CQAC-BQAh_wJAAJkFACEL0wIAANIHADDUAgAA0wcAENUCAADSBwAw1gIBAMEFACHtAgEAwQUAIfoCEADSBQAh-wIQANIFACH8AhAAxwUAIf0CEADHBQAh_gJAAL4FACH_AkAAmQUAIQfWAgEA-wUAIfoCEAC3BgAh-wIQALcGACH8AhAAhwYAIf0CEACHBgAh_gJAAP0FACH_AkAAtgYAIQfWAgEA-wUAIfoCEAC3BgAh-wIQALcGACH8AhAAhwYAIf0CEACHBgAh_gJAAP0FACH_AkAAtgYAIQfWAgEAAAAB-gIQAAAAAfsCEAAAAAH8AhAAAAAB_QIQAAAAAf4CQAAAAAH_AkAAAAABIgMAAKgHACAFAACmBwAgBgAApwcAIAsAAOEHACAMAACpBwAgDQAArwcAIA4AAKoHACARAACsBwAgFAAArQcAIBUAAK4HACDWAgEAAAAB1wIBAAAAAdwCQAAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQIAAAAKACAnAADgBwAgAwAAAAoAICcAAOAHACAoAADeBwAgASAAAMQLADACAAAACgAgIAAA3gcAIAIAAACyBgAgIAAA3QcAIBjWAgEA-wUAIdcCAQD7BQAh3AJAAP0FACHzAgAAtQbCAyL0AgEA_AUAIYEDAQD7BQAhhQNAAP0FACGUAxAAhwYAIZUDEAC3BgAhvgMBAPsFACG_AwEA_AUAIcADAAC0BsEDIsIDQAD9BQAhwwNAAP0FACHEA0AAtgYAIcUDQAC2BgAhxgMCAJUGACHHAxAAhwYAIcgDEAC3BgAhyQMBAPwFACHKAxAAhwYAIcsDQAC2BgAhzAMBAPwFACHNA0AAtgYAISIDAAC7BgAgBQAAuQYAIAYAALoGACALAADfBwAgDAAAvAYAIA0AAMIGACAOAAC9BgAgEQAAvwYAIBQAAMAGACAVAADBBgAg1gIBAPsFACHXAgEA-wUAIdwCQAD9BQAh8wIAALUGwgMi9AIBAPwFACGBAwEA-wUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhvwMBAPwFACHAAwAAtAbBAyLCA0AA_QUAIcMDQAD9BQAhxANAALYGACHFA0AAtgYAIcYDAgCVBgAhxwMQAIcGACHIAxAAtwYAIckDAQD8BQAhygMQAIcGACHLA0AAtgYAIcwDAQD8BQAhzQNAALYGACEHJwAAvwsAICgAAMILACDaAwAAwAsAINsDAADBCwAg3gMAABQAIN8DAAAUACDgAwAAHQAgIgMAAKgHACAFAACmBwAgBgAApwcAIAsAAOEHACAMAACpBwAgDQAArwcAIA4AAKoHACARAACsBwAgFAAArQcAIBUAAK4HACDWAgEAAAAB1wIBAAAAAdwCQAAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQMnAAC_CwAg2gMAAMALACDgAwAAHQAgAd0DAQAAAAQEJwAA1wcAMNoDAADYBwAw3AMAANoHACDgAwAArgYAMAQnAADLBwAw2gMAAMwHADDcAwAAzgcAIOADAADPBwAwAycAAL0LACDaAwAAvgsAIOADAADXAQAgBCcAAL8HADDaAwAAwAcAMNwDAADCBwAg4AMAAMMHADAAAAAAAAUnAAC4CwAgKAAAuwsAINoDAAC5CwAg2wMAALoLACDgAwAAYQAgAycAALgLACDaAwAAuQsAIOADAABhACAAAAAAAAUnAACzCwAgKAAAtgsAINoDAAC0CwAg2wMAALULACDgAwAACgAgAycAALMLACDaAwAAtAsAIOADAAAKACAAAAAAAAAAAAAABScAAK4LACAoAACxCwAg2gMAAK8LACDbAwAAsAsAIOADAAAKACADJwAArgsAINoDAACvCwAg4AMAAAoAIAAAAAAABScAAKkLACAoAACsCwAg2gMAAKoLACDbAwAAqwsAIOADAAA5ACADJwAAqQsAINoDAACqCwAg4AMAADkAIAAAAAcnAACkCwAgKAAApwsAINoDAAClCwAg2wMAAKYLACDeAwAAAwAg3wMAAAMAIOADAADXAQAgAycAAKQLACDaAwAApQsAIOADAADXAQAgAAAAAAAF3QMEAAAAAeMDBAAAAAHkAwQAAAAB5QMEAAAAAeYDBAAAAAEHJwAAnwsAICgAAKILACDaAwAAoAsAINsDAAChCwAg3gMAAAUAIN8DAAAFACDgAwAAAQAgAycAAJ8LACDaAwAAoAsAIOADAAABACAAAAAAAAcnAACZCwAgKAAAnQsAINoDAACaCwAg2wMAAJwLACDeAwAAAwAg3wMAAAMAIOADAADXAQAgCycAAJwIADAoAACgCAAw2gMAAJ0IADDbAwAAnggAMNwDAACfCAAg3QMAAPkGADDeAwAA-QYAMN8DAAD5BgAw4AMAAPkGADDhAwAAoQgAMOIDAAD8BgAwBwMAAIMHACAUAACHCAAg1gIBAAAAAekCAQAAAAGGAwEAAAABiQMQAAAAAZwDAQAAAAECAAAAPQAgJwAApAgAIAMAAAA9ACAnAACkCAAgKAAAowgAIAEgAACbCwAwAgAAAD0AICAAAKMIACACAAAA_QYAICAAAKIIACAF1gIBAPsFACHpAgEA-wUAIYYDAQD7BQAhiQMQAIcGACGcAwEA_AUAIQcDAACABwAgFAAAhggAINYCAQD7BQAh6QIBAPsFACGGAwEA-wUAIYkDEACHBgAhnAMBAPwFACEHAwAAgwcAIBQAAIcIACDWAgEAAAAB6QIBAAAAAYYDAQAAAAGJAxAAAAABnAMBAAAAAQMnAACZCwAg2gMAAJoLACDgAwAA1wEAIAQnAACcCAAw2gMAAJ0IADDcAwAAnwgAIOADAAD5BgAwAAAAAAAB3QMAAACqAwILJwAArwgAMCgAALMIADDaAwAAsAgAMNsDAACxCAAw3AMAALIIACDdAwAArgYAMN4DAACuBgAw3wMAAK4GADDgAwAArgYAMOEDAAC0CAAw4gMAALEGADAHJwAAkwsAICgAAJcLACDaAwAAlAsAINsDAACWCwAg3gMAAAMAIN8DAAADACDgAwAA1wEAICIDAACoBwAgBQAApgcAIAYAAKcHACAJAACrBwAgCwAA4QcAIAwAAKkHACANAACvBwAgEQAArAcAIBQAAK0HACAVAACuBwAg1gIBAAAAAdcCAQAAAAHcAkAAAAAB7QIBAAAAAfMCAAAAwgMC9AIBAAAAAYEDAQAAAAGFA0AAAAABlAMQAAAAAZUDEAAAAAG-AwEAAAABvwMBAAAAAcADAAAAwQMCwgNAAAAAAcMDQAAAAAHEA0AAAAABxQNAAAAAAcYDAgAAAAHHAxAAAAAByAMQAAAAAcoDEAAAAAHLA0AAAAABzAMBAAAAAc0DQAAAAAECAAAACgAgJwAAtwgAIAMAAAAKACAnAAC3CAAgKAAAtggAIAEgAACVCwAwAgAAAAoAICAAALYIACACAAAAsgYAICAAALUIACAY1gIBAPsFACHXAgEA-wUAIdwCQAD9BQAh7QIBAPsFACHzAgAAtQbCAyL0AgEA_AUAIYEDAQD7BQAhhQNAAP0FACGUAxAAhwYAIZUDEAC3BgAhvgMBAPsFACG_AwEA_AUAIcADAAC0BsEDIsIDQAD9BQAhwwNAAP0FACHEA0AAtgYAIcUDQAC2BgAhxgMCAJUGACHHAxAAhwYAIcgDEAC3BgAhygMQAIcGACHLA0AAtgYAIcwDAQD8BQAhzQNAALYGACEiAwAAuwYAIAUAALkGACAGAAC6BgAgCQAAvgYAIAsAAN8HACAMAAC8BgAgDQAAwgYAIBEAAL8GACAUAADABgAgFQAAwQYAINYCAQD7BQAh1wIBAPsFACHcAkAA_QUAIe0CAQD7BQAh8wIAALUGwgMi9AIBAPwFACGBAwEA-wUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhvwMBAPwFACHAAwAAtAbBAyLCA0AA_QUAIcMDQAD9BQAhxANAALYGACHFA0AAtgYAIcYDAgCVBgAhxwMQAIcGACHIAxAAtwYAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhIgMAAKgHACAFAACmBwAgBgAApwcAIAkAAKsHACALAADhBwAgDAAAqQcAIA0AAK8HACARAACsBwAgFAAArQcAIBUAAK4HACDWAgEAAAAB1wIBAAAAAdwCQAAAAAHtAgEAAAAB8wIAAADCAwL0AgEAAAABgQMBAAAAAYUDQAAAAAGUAxAAAAABlQMQAAAAAb4DAQAAAAG_AwEAAAABwAMAAADBAwLCA0AAAAABwwNAAAAAAcQDQAAAAAHFA0AAAAABxgMCAAAAAccDEAAAAAHIAxAAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQQnAACvCAAw2gMAALAIADDcAwAAsggAIOADAACuBgAwAycAAJMLACDaAwAAlAsAIOADAADXAQAgAAAACycAAMwIADAoAADQCAAw2gMAAM0IADDbAwAAzggAMNwDAADPCAAg3QMAAK4GADDeAwAArgYAMN8DAACuBgAw4AMAAK4GADDhAwAA0QgAMOIDAACxBgAwBycAAIwLACAoAACRCwAg2gMAAI0LACDbAwAAkAsAIN4DAAAFACDfAwAABQAg4AMAAAEAIAsnAADACAAwKAAAxQgAMNoDAADBCAAw2wMAAMIIADDcAwAAwwgAIN0DAADECAAw3gMAAMQIADDfAwAAxAgAMOADAADECAAw4QMAAMYIADDiAwAAxwgAMAgEAAD0BwAg1gIBAAAAAdwCQAAAAAGAAwEAAAABggMCAAAAAYMDAQAAAAGEAyAAAAABhQNAAAAAAQIAAAAoACAnAADLCAAgAwAAACgAICcAAMsIACAoAADKCAAgASAAAI8LADANBAAA1wUAIAwAAOEFACDTAgAA4AUAMNQCAAAmABDVAgAA4AUAMNYCAQAAAAHcAkAAvgUAIYADAQAAAAGBAwEAwQUAIYIDAgDLBQAhgwMBAJgFACGEAyAAowUAIYUDQAC-BQAhAgAAACgAICAAAMoIACACAAAAyAgAICAAAMkIACAL0wIAAMcIADDUAgAAyAgAENUCAADHCAAw1gIBAMEFACHcAkAAvgUAIYADAQDBBQAhgQMBAMEFACGCAwIAywUAIYMDAQCYBQAhhAMgAKMFACGFA0AAvgUAIQvTAgAAxwgAMNQCAADICAAQ1QIAAMcIADDWAgEAwQUAIdwCQAC-BQAhgAMBAMEFACGBAwEAwQUAIYIDAgDLBQAhgwMBAJgFACGEAyAAowUAIYUDQAC-BQAhB9YCAQD7BQAh3AJAAP0FACGAAwEA-wUAIYIDAgCVBgAhgwMBAPwFACGEAyAAiAYAIYUDQAD9BQAhCAQAAPMHACDWAgEA-wUAIdwCQAD9BQAhgAMBAPsFACGCAwIAlQYAIYMDAQD8BQAhhAMgAIgGACGFA0AA_QUAIQgEAAD0BwAg1gIBAAAAAdwCQAAAAAGAAwEAAAABggMCAAAAAYMDAQAAAAGEAyAAAAABhQNAAAAAASIDAACoBwAgBQAApgcAIAYAAKcHACAJAACrBwAgCwAA4QcAIA0AAK8HACAOAACqBwAgEQAArAcAIBQAAK0HACAVAACuBwAg1gIBAAAAAdcCAQAAAAHcAkAAAAAB7QIBAAAAAfMCAAAAwgMC9AIBAAAAAYUDQAAAAAGUAxAAAAABlQMQAAAAAb4DAQAAAAG_AwEAAAABwAMAAADBAwLCA0AAAAABwwNAAAAAAcQDQAAAAAHFA0AAAAABxgMCAAAAAccDEAAAAAHIAxAAAAAByQMBAAAAAcoDEAAAAAHLA0AAAAABzAMBAAAAAc0DQAAAAAECAAAACgAgJwAA1AgAIAMAAAAKACAnAADUCAAgKAAA0wgAIAEgAACOCwAwAgAAAAoAICAAANMIACACAAAAsgYAICAAANIIACAY1gIBAPsFACHXAgEA-wUAIdwCQAD9BQAh7QIBAPsFACHzAgAAtQbCAyL0AgEA_AUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhvwMBAPwFACHAAwAAtAbBAyLCA0AA_QUAIcMDQAD9BQAhxANAALYGACHFA0AAtgYAIcYDAgCVBgAhxwMQAIcGACHIAxAAtwYAIckDAQD8BQAhygMQAIcGACHLA0AAtgYAIcwDAQD8BQAhzQNAALYGACEiAwAAuwYAIAUAALkGACAGAAC6BgAgCQAAvgYAIAsAAN8HACANAADCBgAgDgAAvQYAIBEAAL8GACAUAADABgAgFQAAwQYAINYCAQD7BQAh1wIBAPsFACHcAkAA_QUAIe0CAQD7BQAh8wIAALUGwgMi9AIBAPwFACGFA0AA_QUAIZQDEACHBgAhlQMQALcGACG-AwEA-wUAIb8DAQD8BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhIgMAAKgHACAFAACmBwAgBgAApwcAIAkAAKsHACALAADhBwAgDQAArwcAIA4AAKoHACARAACsBwAgFAAArQcAIBUAAK4HACDWAgEAAAAB1wIBAAAAAdwCQAAAAAHtAgEAAAAB8wIAAADCAwL0AgEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQQnAADMCAAw2gMAAM0IADDcAwAAzwgAIOADAACuBgAwAycAAIwLACDaAwAAjQsAIOADAAABACAEJwAAwAgAMNoDAADBCAAw3AMAAMMIACDgAwAAxAgAMAAMBAAA2AgAIAUAAOAKACAGAADfCgAgDAAA5woAIBIAAOIKACAUAADtCgAgFQAA5goAIBcAAPAKACAYAADsCgAgGQAA7AoAIBoAAO8KACDXAgAA9wUAIAAAAAAAAAUnAACHCwAgKAAAigsAINoDAACICwAg2wMAAIkLACDgAwAACgAgAycAAIcLACDaAwAAiAsAIOADAAAKACAAAAALJwAAyAkAMCgAAM0JADDaAwAAyQkAMNsDAADKCQAw3AMAAMsJACDdAwAAzAkAMN4DAADMCQAw3wMAAMwJADDgAwAAzAkAMOEDAADOCQAw4gMAAM8JADALJwAAvwkAMCgAAMMJADDaAwAAwAkAMNsDAADBCQAw3AMAAMIJACDdAwAArgYAMN4DAACuBgAw3wMAAK4GADDgAwAArgYAMOEDAADECQAw4gMAALEGADALJwAAswkAMCgAALgJADDaAwAAtAkAMNsDAAC1CQAw3AMAALYJACDdAwAAtwkAMN4DAAC3CQAw3wMAALcJADDgAwAAtwkAMOEDAAC5CQAw4gMAALoJADALJwAApwkAMCgAAKwJADDaAwAAqAkAMNsDAACpCQAw3AMAAKoJACDdAwAAqwkAMN4DAACrCQAw3wMAAKsJADDgAwAAqwkAMOEDAACtCQAw4gMAAK4JADALJwAAmwkAMCgAAKAJADDaAwAAnAkAMNsDAACdCQAw3AMAAJ4JACDdAwAAnwkAMN4DAACfCQAw3wMAAJ8JADDgAwAAnwkAMOEDAAChCQAw4gMAAKIJADALJwAAjwkAMCgAAJQJADDaAwAAkAkAMNsDAACRCQAw3AMAAJIJACDdAwAAkwkAMN4DAACTCQAw3wMAAJMJADDgAwAAkwkAMOEDAACVCQAw4gMAAJYJADALJwAAhgkAMCgAAIoJADDaAwAAhwkAMNsDAACICQAw3AMAAIkJACDdAwAAwwcAMN4DAADDBwAw3wMAAMMHADDgAwAAwwcAMOEDAACLCQAw4gMAAMYHADALJwAA-ggAMCgAAP8IADDaAwAA-wgAMNsDAAD8CAAw3AMAAP0IACDdAwAA_ggAMN4DAAD-CAAw3wMAAP4IADDgAwAA_ggAMOEDAACACQAw4gMAAIEJADALJwAA7ggAMCgAAPMIADDaAwAA7wgAMNsDAADwCAAw3AMAAPEIACDdAwAA8ggAMN4DAADyCAAw3wMAAPIIADDgAwAA8ggAMOEDAAD0CAAw4gMAAPUIADAHAwAAgAYAINYCAQAAAAHYAgEAAAAB2QIBAAAAAdoCAQAAAAHbAgEAAAAB3AJAAAAAAQIAAABqACAnAAD5CAAgAwAAAGoAICcAAPkIACAoAAD4CAAgASAAAIYLADAMAwAAxAUAIAYAAMUFACDTAgAAwwUAMNQCAABoABDVAgAAwwUAMNYCAQAAAAHXAgEAwQUAIdgCAQAAAAHZAgEAlwUAIdoCAQAAAAHbAgEAmAUAIdwCQAC-BQAhAgAAAGoAICAAAPgIACACAAAA9ggAICAAAPcIACAK0wIAAPUIADDUAgAA9ggAENUCAAD1CAAw1gIBAMEFACHXAgEAwQUAIdgCAQDBBQAh2QIBAJcFACHaAgEAmAUAIdsCAQCYBQAh3AJAAL4FACEK0wIAAPUIADDUAgAA9ggAENUCAAD1CAAw1gIBAMEFACHXAgEAwQUAIdgCAQDBBQAh2QIBAJcFACHaAgEAmAUAIdsCAQCYBQAh3AJAAL4FACEG1gIBAPsFACHYAgEA-wUAIdkCAQD7BQAh2gIBAPwFACHbAgEA_AUAIdwCQAD9BQAhBwMAAP4FACDWAgEA-wUAIdgCAQD7BQAh2QIBAPsFACHaAgEA_AUAIdsCAQD8BQAh3AJAAP0FACEHAwAAgAYAINYCAQAAAAHYAgEAAAAB2QIBAAAAAdoCAQAAAAHbAgEAAAAB3AJAAAAAAQcFAACcBgAg1gIBAAAAAegCAQAAAAHpAgEAAAAB6gIQAAAAAesCAQAAAAHsAiAAAAABAgAAAGYAICcAAIUJACADAAAAZgAgJwAAhQkAICgAAIQJACABIAAAhQsAMAwFAADIBQAgBgAAyQUAINMCAADGBQAw1AIAAGQAENUCAADGBQAw1gIBAAAAAdcCAQC8BQAh6AIBAJcFACHpAgEAmAUAIeoCEADHBQAh6wIBAJgFACHsAiAAowUAIQIAAABmACAgAACECQAgAgAAAIIJACAgAACDCQAgCtMCAACBCQAw1AIAAIIJABDVAgAAgQkAMNYCAQDBBQAh1wIBALwFACHoAgEAlwUAIekCAQCYBQAh6gIQAMcFACHrAgEAmAUAIewCIACjBQAhCtMCAACBCQAw1AIAAIIJABDVAgAAgQkAMNYCAQDBBQAh1wIBALwFACHoAgEAlwUAIekCAQCYBQAh6gIQAMcFACHrAgEAmAUAIewCIACjBQAhBtYCAQD7BQAh6AIBAPsFACHpAgEA_AUAIeoCEACHBgAh6wIBAPwFACHsAiAAiAYAIQcFAACJBgAg1gIBAPsFACHoAgEA-wUAIekCAQD8BQAh6gIQAIcGACHrAgEA_AUAIewCIACIBgAhBwUAAJwGACDWAgEAAAAB6AIBAAAAAekCAQAAAAHqAhAAAAAB6wIBAAAAAewCIAAAAAELBAAAsgcAIAkAALQHACDWAgEAAAAB7AIgAAAAAe0CAQAAAAHuAgEAAAAB7wICAAAAAfACAACwBwAg8QIAALEHACDzAgAAAPMCAvQCAQAAAAECAAAAHQAgJwAAjgkAIAMAAAAdACAnAACOCQAgKAAAjQkAIAEgAACECwAwAgAAAB0AICAAAI0JACACAAAAxwcAICAAAIwJACAJ1gIBAPsFACHsAiAAiAYAIe0CAQD7BQAh7gIBAPsFACHvAgIAowYAIfACAACkBgAg8QIAAKUGACDzAgAApgbzAiL0AgEA_AUAIQsEAACnBgAgCQAAqQYAINYCAQD7BQAh7AIgAIgGACHtAgEA-wUAIe4CAQD7BQAh7wICAKMGACHwAgAApAYAIPECAAClBgAg8wIAAKYG8wIi9AIBAPwFACELBAAAsgcAIAkAALQHACDWAgEAAAAB7AIgAAAAAe0CAQAAAAHuAgEAAAAB7wICAAAAAfACAACwBwAg8QIAALEHACDzAgAAAPMCAvQCAQAAAAEJBAAA4wcAIAoAAOQHACALAADmBwAg1gIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAfgCAgAAAAH5AgAA4gcAIAIAAABhACAnAACaCQAgAwAAAGEAICcAAJoJACAoAACZCQAgASAAAIMLADAOBAAAmgUAIAYAAMUFACAKAADMBQAgCwAAqQUAINMCAADKBQAw1AIAAF8AENUCAADKBQAw1gIBAAAAAdcCAQDBBQAh6AIBAJcFACHpAgEAmAUAIewCIACjBQAh-AICAMsFACH5AgAA7gQAIAIAAABhACAgAACZCQAgAgAAAJcJACAgAACYCQAgCtMCAACWCQAw1AIAAJcJABDVAgAAlgkAMNYCAQDBBQAh1wIBAMEFACHoAgEAlwUAIekCAQCYBQAh7AIgAKMFACH4AgIAywUAIfkCAADuBAAgCtMCAACWCQAw1AIAAJcJABDVAgAAlgkAMNYCAQDBBQAh1wIBAMEFACHoAgEAlwUAIekCAQCYBQAh7AIgAKMFACH4AgIAywUAIfkCAADuBAAgBtYCAQD7BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAh-AICAJUGACH5AgAAugcAIAkEAAC7BwAgCgAAvAcAIAsAAL4HACDWAgEA-wUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIfgCAgCVBgAh-QIAALoHACAJBAAA4wcAIAoAAOQHACALAADmBwAg1gIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAfgCAgAAAAH5AgAA4gcAIAPWAgEAAAAB6AIBAAAAAZ0DQAAAAAECAAAAXAAgJwAApgkAIAMAAABcACAnAACmCQAgKAAApQkAIAEgAACCCwAwCAYAAMkFACDTAgAAzQUAMNQCAABaABDVAgAAzQUAMNYCAQAAAAHXAgEAvAUAIegCAQCYBQAhnQNAAL4FACECAAAAXAAgIAAApQkAIAIAAACjCQAgIAAApAkAIAfTAgAAogkAMNQCAACjCQAQ1QIAAKIJADDWAgEAwQUAIdcCAQC8BQAh6AIBAJgFACGdA0AAvgUAIQfTAgAAogkAMNQCAACjCQAQ1QIAAKIJADDWAgEAwQUAIdcCAQC8BQAh6AIBAJgFACGdA0AAvgUAIQPWAgEA-wUAIegCAQD8BQAhnQNAAP0FACED1gIBAPsFACHoAgEA_AUAIZ0DQAD9BQAhA9YCAQAAAAHoAgEAAAABnQNAAAAAAQUSAACmCAAg1gIBAAAAAegCAQAAAAHpAgEAAAAB6gIQAAAAAQIAAABYACAnAACyCQAgAwAAAFgAICcAALIJACAoAACxCQAgASAAAIELADAKBgAAyQUAIBIAAM8FACDTAgAAzgUAMNQCAABAABDVAgAAzgUAMNYCAQAAAAHXAgEAvAUAIegCAQCXBQAh6QIBAJgFACHqAhAAxwUAIQIAAABYACAgAACxCQAgAgAAAK8JACAgAACwCQAgCNMCAACuCQAw1AIAAK8JABDVAgAArgkAMNYCAQDBBQAh1wIBALwFACHoAgEAlwUAIekCAQCYBQAh6gIQAMcFACEI0wIAAK4JADDUAgAArwkAENUCAACuCQAw1gIBAMEFACHXAgEAvAUAIegCAQCXBQAh6QIBAJgFACHqAhAAxwUAIQTWAgEA-wUAIegCAQD7BQAh6QIBAPwFACHqAhAAhwYAIQUSAACbCAAg1gIBAPsFACHoAgEA-wUAIekCAQD8BQAh6gIQAIcGACEFEgAApggAINYCAQAAAAHoAgEAAAAB6QIBAAAAAeoCEAAAAAEMBAAAuAgAINYCAQAAAAHpAgEAAAAB7AIgAAAAAagDAQAAAAGpAwAAAKoDAqoDEAAAAAGrAxAAAAABrAMCAAAAAa0DAgAAAAGuA0AAAAABrwNAAAAAAQIAAABVACAnAAC-CQAgAwAAAFUAICcAAL4JACAoAAC9CQAgASAAAIALADARBAAAmgUAIAYAAMkFACDTAgAA0AUAMNQCAAAsABDVAgAA0AUAMNYCAQAAAAHXAgEAvAUAIekCAQCYBQAh7AIgAKMFACGoAwEAAAABqQMAANEFqgMiqgMQAMcFACGrAxAA0gUAIawDAgDTBQAhrQMCAMsFACGuA0AAmQUAIa8DQACZBQAhAgAAAFUAICAAAL0JACACAAAAuwkAICAAALwJACAP0wIAALoJADDUAgAAuwkAENUCAAC6CQAw1gIBAMEFACHXAgEAvAUAIekCAQCYBQAh7AIgAKMFACGoAwEAlwUAIakDAADRBaoDIqoDEADHBQAhqwMQANIFACGsAwIA0wUAIa0DAgDLBQAhrgNAAJkFACGvA0AAmQUAIQ_TAgAAugkAMNQCAAC7CQAQ1QIAALoJADDWAgEAwQUAIdcCAQC8BQAh6QIBAJgFACHsAiAAowUAIagDAQCXBQAhqQMAANEFqgMiqgMQAMcFACGrAxAA0gUAIawDAgDTBQAhrQMCAMsFACGuA0AAmQUAIa8DQACZBQAhC9YCAQD7BQAh6QIBAPwFACHsAiAAiAYAIagDAQD7BQAhqQMAAKwIqgMiqgMQAIcGACGrAxAAtwYAIawDAgCjBgAhrQMCAJUGACGuA0AAtgYAIa8DQAC2BgAhDAQAAK0IACDWAgEA-wUAIekCAQD8BQAh7AIgAIgGACGoAwEA-wUAIakDAACsCKoDIqoDEACHBgAhqwMQALcGACGsAwIAowYAIa0DAgCVBgAhrgNAALYGACGvA0AAtgYAIQwEAAC4CAAg1gIBAAAAAekCAQAAAAHsAiAAAAABqAMBAAAAAakDAAAAqgMCqgMQAAAAAasDEAAAAAGsAwIAAAABrQMCAAAAAa4DQAAAAAGvA0AAAAABIgMAAKgHACAFAACmBwAgCQAAqwcAIAsAAOEHACAMAACpBwAgDQAArwcAIA4AAKoHACARAACsBwAgFAAArQcAIBUAAK4HACDWAgEAAAAB3AJAAAAAAe0CAQAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQIAAAAKACAnAADHCQAgAwAAAAoAICcAAMcJACAoAADGCQAgASAAAP8KADACAAAACgAgIAAAxgkAIAIAAACyBgAgIAAAxQkAIBjWAgEA-wUAIdwCQAD9BQAh7QIBAPsFACHzAgAAtQbCAyL0AgEA_AUAIYEDAQD7BQAhhQNAAP0FACGUAxAAhwYAIZUDEAC3BgAhvgMBAPsFACG_AwEA_AUAIcADAAC0BsEDIsIDQAD9BQAhwwNAAP0FACHEA0AAtgYAIcUDQAC2BgAhxgMCAJUGACHHAxAAhwYAIcgDEAC3BgAhyQMBAPwFACHKAxAAhwYAIcsDQAC2BgAhzAMBAPwFACHNA0AAtgYAISIDAAC7BgAgBQAAuQYAIAkAAL4GACALAADfBwAgDAAAvAYAIA0AAMIGACAOAAC9BgAgEQAAvwYAIBQAAMAGACAVAADBBgAg1gIBAPsFACHcAkAA_QUAIe0CAQD7BQAh8wIAALUGwgMi9AIBAPwFACGBAwEA-wUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhvwMBAPwFACHAAwAAtAbBAyLCA0AA_QUAIcMDQAD9BQAhxANAALYGACHFA0AAtgYAIcYDAgCVBgAhxwMQAIcGACHIAxAAtwYAIckDAQD8BQAhygMQAIcGACHLA0AAtgYAIcwDAQD8BQAhzQNAALYGACEiAwAAqAcAIAUAAKYHACAJAACrBwAgCwAA4QcAIAwAAKkHACANAACvBwAgDgAAqgcAIBEAAKwHACAUAACtBwAgFQAArgcAINYCAQAAAAHcAkAAAAAB7QIBAAAAAfMCAAAAwgMC9AIBAAAAAYEDAQAAAAGFA0AAAAABlAMQAAAAAZUDEAAAAAG-AwEAAAABvwMBAAAAAcADAAAAwQMCwgNAAAAAAcMDQAAAAAHEA0AAAAABxQNAAAAAAcYDAgAAAAHHAxAAAAAByAMQAAAAAckDAQAAAAHKAxAAAAABywNAAAAAAcwDAQAAAAHNA0AAAAABDwQAALYKACAFAAC1CgAgDAAAuQoAIBIAALsKACAUAAC8CgAgFQAAvQoAIBcAAL4KACAYAAC3CgAgGQAAuAoAIBoAALoKACDWAgEAAAAB8wIAAADXAwLSAwEAAAAB0wMBAAAAAdUDAAAA1QMCAgAAAAEAICcAALQKACADAAAAAQAgJwAAtAoAICgAANQJACABIAAA_goAMBQEAACaBQAgBQAAyAUAIAYAAMkFACAMAAD0BQAgEgAAzwUAIBQAAO8FACAVAADdBQAgFwAA9gUAIBgAAO4FACAZAADuBQAgGgAA9QUAINMCAADxBQAw1AIAAAUAENUCAADxBQAw1gIBAAAAAdcCAQC8BQAh8wIAAPMF1wMi0gMBAAAAAdMDAQCXBQAh1QMAAPIF1QMiAgAAAAEAICAAANQJACACAAAA0AkAICAAANEJACAJ0wIAAM8JADDUAgAA0AkAENUCAADPCQAw1gIBAMEFACHXAgEAvAUAIfMCAADzBdcDItIDAQCXBQAh0wMBAJcFACHVAwAA8gXVAyIJ0wIAAM8JADDUAgAA0AkAENUCAADPCQAw1gIBAMEFACHXAgEAvAUAIfMCAADzBdcDItIDAQCXBQAh0wMBAJcFACHVAwAA8gXVAyIF1gIBAPsFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiAd0DAAAA1QMCAd0DAAAA1wMCDwQAANYJACAFAADVCQAgDAAA2QkAIBIAANsJACAUAADcCQAgFQAA3QkAIBcAAN4JACAYAADXCQAgGQAA2AkAIBoAANoJACDWAgEA-wUAIfMCAADTCdcDItIDAQD7BQAh0wMBAPsFACHVAwAA0gnVAyILJwAAqwoAMCgAAK8KADDaAwAArAoAMNsDAACtCgAw3AMAAK4KACDdAwAAjwYAMN4DAACPBgAw3wMAAI8GADDgAwAAjwYAMOEDAACwCgAw4gMAAJIGADALJwAAogoAMCgAAKYKADDaAwAAowoAMNsDAACkCgAw3AMAAKUKACDdAwAArgYAMN4DAACuBgAw3wMAAK4GADDgAwAArgYAMOEDAACnCgAw4gMAALEGADALJwAAmQoAMCgAAJ0KADDaAwAAmgoAMNsDAACbCgAw3AMAAJwKACDdAwAAjQcAMN4DAACNBwAw3wMAAI0HADDgAwAAjQcAMOEDAACeCgAw4gMAAJAHADALJwAAkAoAMCgAAJQKADDaAwAAkQoAMNsDAACSCgAw3AMAAJMKACDdAwAAjQcAMN4DAACNBwAw3wMAAI0HADDgAwAAjQcAMOEDAACVCgAw4gMAAJAHADAHJwAAiwoAICgAAI4KACDaAwAAjAoAINsDAACNCgAg3gMAAHkAIN8DAAB5ACDgAwAAiQIAIAsnAAD_CQAwKAAAhAoAMNoDAACACgAw2wMAAIEKADDcAwAAggoAIN0DAACDCgAw3gMAAIMKADDfAwAAgwoAMOADAACDCgAw4QMAAIUKADDiAwAAhgoAMAsnAAD2CQAwKAAA-gkAMNoDAAD3CQAw2wMAAPgJADDcAwAA-QkAIN0DAAD5BgAw3gMAAPkGADDfAwAA-QYAMOADAAD5BgAw4QMAAPsJADDiAwAA_AYAMAsnAADtCQAwKAAA8QkAMNoDAADuCQAw2wMAAO8JADDcAwAA8AkAIN0DAADgBgAw3gMAAOAGADDfAwAA4AYAMOADAADgBgAw4QMAAPIJADDiAwAA4wYAMAsnAADkCQAwKAAA6AkAMNoDAADlCQAw2wMAAOYJADDcAwAA5wkAIN0DAADOBgAw3gMAAM4GADDfAwAAzgYAMOADAADOBgAw4QMAAOkJADDiAwAA0QYAMAcnAADfCQAgKAAA4gkAINoDAADgCQAg2wMAAOEJACDeAwAAaAAg3wMAAGgAIOADAABqACAHBgAAgQYAINYCAQAAAAHXAgEAAAAB2QIBAAAAAdoCAQAAAAHbAgEAAAAB3AJAAAAAAQIAAABqACAnAADfCQAgAwAAAGgAICcAAN8JACAoAADjCQAgCQAAAGgAIAYAAP8FACAgAADjCQAg1gIBAPsFACHXAgEA-wUAIdkCAQD7BQAh2gIBAPwFACHbAgEA_AUAIdwCQAD9BQAhBwYAAP8FACDWAgEA-wUAIdcCAQD7BQAh2QIBAPsFACHaAgEA_AUAIdsCAQD8BQAh3AJAAP0FACEOBAAA9AYAIBQAANoGACDWAgEAAAAB3AJAAAAAAfMCAAAAiQMC9AIBAAAAAYADAQAAAAGFA0AAAAABhgMBAAAAAYcDAAAAiAMCiQMQAAAAAYoDIAAAAAGLAwEAAAABjANAAAAAAQIAAABIACAnAADsCQAgAwAAAEgAICcAAOwJACAoAADrCQAgASAAAP0KADACAAAASAAgIAAA6wkAIAIAAADSBgAgIAAA6gkAIAzWAgEA-wUAIdwCQAD9BQAh8wIAANUGiQMi9AIBAPwFACGAAwEA-wUAIYUDQAD9BQAhhgMBAPwFACGHAwAA1AaIAyKJAxAAhwYAIYoDIACIBgAhiwMBAPwFACGMA0AAtgYAIQ4EAADyBgAgFAAA1wYAINYCAQD7BQAh3AJAAP0FACHzAgAA1QaJAyL0AgEA_AUAIYADAQD7BQAhhQNAAP0FACGGAwEA_AUAIYcDAADUBogDIokDEACHBgAhigMgAIgGACGLAwEA_AUAIYwDQAC2BgAhDgQAAPQGACAUAADaBgAg1gIBAAAAAdwCQAAAAAHzAgAAAIkDAvQCAQAAAAGAAwEAAAABhQNAAAAAAYYDAQAAAAGHAwAAAIgDAokDEAAAAAGKAyAAAAABiwMBAAAAAYwDQAAAAAEUBAAAgAgAIBIAAIYHACAVAACIBwAg1gIBAAAAAdwCQAAAAAH0AgEAAAABgAMBAAAAAYUDQAAAAAGOAwEAAAABjwMQAAAAAZADEAAAAAGRAxAAAAABkgMQAAAAAZMDEAAAAAGUAxAAAAABlQMQAAAAAZYDEAAAAAGXAxAAAAABmAMQAAAAAZoDQAAAAAECAAAAOQAgJwAA9QkAIAMAAAA5ACAnAAD1CQAgKAAA9AkAIAEgAAD8CgAwAgAAADkAICAAAPQJACACAAAA5AYAICAAAPMJACAR1gIBAPsFACHcAkAA_QUAIfQCAQD8BQAhgAMBAPsFACGFA0AA_QUAIY4DAQD7BQAhjwMQAIcGACGQAxAAhwYAIZEDEACHBgAhkgMQAIcGACGTAxAAhwYAIZQDEACHBgAhlQMQAIcGACGWAxAAhwYAIZcDEACHBgAhmAMQAIcGACGaA0AA_QUAIRQEAAD_BwAgEgAA5wYAIBUAAOkGACDWAgEA-wUAIdwCQAD9BQAh9AIBAPwFACGAAwEA-wUAIYUDQAD9BQAhjgMBAPsFACGPAxAAhwYAIZADEACHBgAhkQMQAIcGACGSAxAAhwYAIZMDEACHBgAhlAMQAIcGACGVAxAAhwYAIZYDEACHBgAhlwMQAIcGACGYAxAAhwYAIZoDQAD9BQAhFAQAAIAIACASAACGBwAgFQAAiAcAINYCAQAAAAHcAkAAAAAB9AIBAAAAAYADAQAAAAGFA0AAAAABjgMBAAAAAY8DEAAAAAGQAxAAAAABkQMQAAAAAZIDEAAAAAGTAxAAAAABlAMQAAAAAZUDEAAAAAGWAxAAAAABlwMQAAAAAZgDEAAAAAGaA0AAAAABBxMAAIQHACAUAACHCAAg1gIBAAAAAekCAQAAAAGGAwEAAAABiQMQAAAAAZsDAQAAAAECAAAAPQAgJwAA_gkAIAMAAAA9ACAnAAD-CQAgKAAA_QkAIAEgAAD7CgAwAgAAAD0AICAAAP0JACACAAAA_QYAICAAAPwJACAF1gIBAPsFACHpAgEA-wUAIYYDAQD7BQAhiQMQAIcGACGbAwEA_AUAIQcTAACBBwAgFAAAhggAINYCAQD7BQAh6QIBAPsFACGGAwEA-wUAIYkDEACHBgAhmwMBAPwFACEHEwAAhAcAIBQAAIcIACDWAgEAAAAB6QIBAAAAAYYDAQAAAAGJAxAAAAABmwMBAAAAAQfWAgQAAAAB3AJAAAAAAekCAQAAAAGeAwEAAAABnwMBAAAAAaADAQAAAAGhA4AAAAABAgAAAH0AICcAAIoKACADAAAAfQAgJwAAigoAICgAAIkKACABIAAA-goAMAwDAACbBQAg0wIAALsFADDUAgAAewAQ1QIAALsFADDWAgQAAAAB2AIBALwFACHcAkAAvgUAIekCAQCYBQAhngMBAJcFACGfAwEAmAUAIaADAQC8BQAhoQMAAL0FACACAAAAfQAgIAAAiQoAIAIAAACHCgAgIAAAiAoAIAvTAgAAhgoAMNQCAACHCgAQ1QIAAIYKADDWAgQAwAUAIdgCAQC8BQAh3AJAAL4FACHpAgEAmAUAIZ4DAQCXBQAhnwMBAJgFACGgAwEAvAUAIaEDAAC9BQAgC9MCAACGCgAw1AIAAIcKABDVAgAAhgoAMNYCBADABQAh2AIBALwFACHcAkAAvgUAIekCAQCYBQAhngMBAJcFACGfAwEAmAUAIaADAQC8BQAhoQMAAL0FACAH1gIEAJIIACHcAkAA_QUAIekCAQD8BQAhngMBAPsFACGfAwEA_AUAIaADAQD8BQAhoQOAAAAAAQfWAgQAkggAIdwCQAD9BQAh6QIBAPwFACGeAwEA-wUAIZ8DAQD8BQAhoAMBAPwFACGhA4AAAAABB9YCBAAAAAHcAkAAAAAB6QIBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaEDgAAAAAEKBAAA1QgAIA0AANcIACDWAgEAAAAB2QIBAAAAAdoCAQAAAAGwAwEAAAABsQMBAAAAAbIDAQAAAAGzA0AAAAABtAMBAAAAAQIAAACJAgAgJwAAiwoAIAMAAAB5ACAnAACLCgAgKAAAjwoAIAwAAAB5ACAEAAC9CAAgDQAAvwgAICAAAI8KACDWAgEA-wUAIdkCAQD7BQAh2gIBAPwFACGwAwEA_AUAIbEDAQD8BQAhsgMBAPwFACGzA0AAtgYAIbQDAQD8BQAhCgQAAL0IACANAAC_CAAg1gIBAPsFACHZAgEA-wUAIdoCAQD8BQAhsAMBAPwFACGxAwEA_AUAIbIDAQD8BQAhswNAALYGACG0AwEA_AUAIQwEAADhCAAgDwAAmAcAINYCAQAAAAHcAkAAAAAB8wIAAAC7AwL0AgEAAAABgAMBAAAAAYUDQAAAAAGYAxAAAAABuAMBAAAAAbkDAQAAAAG7A0AAAAABAgAAADMAICcAAJgKACADAAAAMwAgJwAAmAoAICgAAJcKACABIAAA-QoAMAIAAAAzACAgAACXCgAgAgAAAJEHACAgAACWCgAgCtYCAQD7BQAh3AJAAP0FACHzAgAAkwe7AyL0AgEA_AUAIYADAQD7BQAhhQNAAP0FACGYAxAAtwYAIbgDAQD8BQAhuQMBAPwFACG7A0AAtgYAIQwEAADgCAAgDwAAlQcAINYCAQD7BQAh3AJAAP0FACHzAgAAkwe7AyL0AgEA_AUAIYADAQD7BQAhhQNAAP0FACGYAxAAtwYAIbgDAQD8BQAhuQMBAPwFACG7A0AAtgYAIQwEAADhCAAgDwAAmAcAINYCAQAAAAHcAkAAAAAB8wIAAAC7AwL0AgEAAAABgAMBAAAAAYUDQAAAAAGYAxAAAAABuAMBAAAAAbkDAQAAAAG7A0AAAAABDAQAAOEIACAQAACZBwAg1gIBAAAAAdwCQAAAAAHzAgAAALsDAvQCAQAAAAGAAwEAAAABhQNAAAAAAZgDEAAAAAG5AwEAAAABuwNAAAAAAbwDAQAAAAECAAAAMwAgJwAAoQoAIAMAAAAzACAnAAChCgAgKAAAoAoAIAEgAAD4CgAwAgAAADMAICAAAKAKACACAAAAkQcAICAAAJ8KACAK1gIBAPsFACHcAkAA_QUAIfMCAACTB7sDIvQCAQD8BQAhgAMBAPsFACGFA0AA_QUAIZgDEAC3BgAhuQMBAPwFACG7A0AAtgYAIbwDAQD8BQAhDAQAAOAIACAQAACWBwAg1gIBAPsFACHcAkAA_QUAIfMCAACTB7sDIvQCAQD8BQAhgAMBAPsFACGFA0AA_QUAIZgDEAC3BgAhuQMBAPwFACG7A0AAtgYAIbwDAQD8BQAhDAQAAOEIACAQAACZBwAg1gIBAAAAAdwCQAAAAAHzAgAAALsDAvQCAQAAAAGAAwEAAAABhQNAAAAAAZgDEAAAAAG5AwEAAAABuwNAAAAAAbwDAQAAAAEiBQAApgcAIAYAAKcHACAJAACrBwAgCwAA4QcAIAwAAKkHACANAACvBwAgDgAAqgcAIBEAAKwHACAUAACtBwAgFQAArgcAINYCAQAAAAHXAgEAAAAB3AJAAAAAAe0CAQAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHNA0AAAAABAgAAAAoAICcAAKoKACADAAAACgAgJwAAqgoAICgAAKkKACABIAAA9woAMAIAAAAKACAgAACpCgAgAgAAALIGACAgAACoCgAgGNYCAQD7BQAh1wIBAPsFACHcAkAA_QUAIe0CAQD7BQAh8wIAALUGwgMi9AIBAPwFACGBAwEA-wUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhvwMBAPwFACHAAwAAtAbBAyLCA0AA_QUAIcMDQAD9BQAhxANAALYGACHFA0AAtgYAIcYDAgCVBgAhxwMQAIcGACHIAxAAtwYAIckDAQD8BQAhygMQAIcGACHLA0AAtgYAIc0DQAC2BgAhIgUAALkGACAGAAC6BgAgCQAAvgYAIAsAAN8HACAMAAC8BgAgDQAAwgYAIA4AAL0GACARAAC_BgAgFAAAwAYAIBUAAMEGACDWAgEA-wUAIdcCAQD7BQAh3AJAAP0FACHtAgEA-wUAIfMCAAC1BsIDIvQCAQD8BQAhgQMBAPsFACGFA0AA_QUAIZQDEACHBgAhlQMQALcGACG-AwEA-wUAIb8DAQD8BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHNA0AAtgYAISIFAACmBwAgBgAApwcAIAkAAKsHACALAADhBwAgDAAAqQcAIA0AAK8HACAOAACqBwAgEQAArAcAIBQAAK0HACAVAACuBwAg1gIBAAAAAdcCAQAAAAHcAkAAAAAB7QIBAAAAAfMCAAAAwgMC9AIBAAAAAYEDAQAAAAGFA0AAAAABlAMQAAAAAZUDEAAAAAG-AwEAAAABvwMBAAAAAcADAAAAwQMCwgNAAAAAAcMDQAAAAAHEA0AAAAABxQNAAAAAAcYDAgAAAAHHAxAAAAAByAMQAAAAAckDAQAAAAHKAxAAAAABywNAAAAAAc0DQAAAAAEJBAAAmwYAIAgAAKQHACDWAgEAAAABgAMBAAAAAZUDEAAAAAHOAwEAAAABzwMCAAAAAdADEAAAAAHRA0AAAAABAgAAAA4AICcAALMKACADAAAADgAgJwAAswoAICgAALIKACABIAAA9goAMAIAAAAOACAgAACyCgAgAgAAAJMGACAgAACxCgAgB9YCAQD7BQAhgAMBAPsFACGVAxAAhwYAIc4DAQD7BQAhzwMCAJUGACHQAxAAhwYAIdEDQAD9BQAhCQQAAJgGACAIAACiBwAg1gIBAPsFACGAAwEA-wUAIZUDEACHBgAhzgMBAPsFACHPAwIAlQYAIdADEACHBgAh0QNAAP0FACEJBAAAmwYAIAgAAKQHACDWAgEAAAABgAMBAAAAAZUDEAAAAAHOAwEAAAABzwMCAAAAAdADEAAAAAHRA0AAAAABDwQAALYKACAFAAC1CgAgDAAAuQoAIBIAALsKACAUAAC8CgAgFQAAvQoAIBcAAL4KACAYAAC3CgAgGQAAuAoAIBoAALoKACDWAgEAAAAB8wIAAADXAwLSAwEAAAAB0wMBAAAAAdUDAAAA1QMCBCcAAKsKADDaAwAArAoAMNwDAACuCgAg4AMAAI8GADAEJwAAogoAMNoDAACjCgAw3AMAAKUKACDgAwAArgYAMAQnAACZCgAw2gMAAJoKADDcAwAAnAoAIOADAACNBwAwBCcAAJAKADDaAwAAkQoAMNwDAACTCgAg4AMAAI0HADADJwAAiwoAINoDAACMCgAg4AMAAIkCACAEJwAA_wkAMNoDAACACgAw3AMAAIIKACDgAwAAgwoAMAQnAAD2CQAw2gMAAPcJADDcAwAA-QkAIOADAAD5BgAwBCcAAO0JADDaAwAA7gkAMNwDAADwCQAg4AMAAOAGADAEJwAA5AkAMNoDAADlCQAw3AMAAOcJACDgAwAAzgYAMAMnAADfCQAg2gMAAOAJACDgAwAAagAgBCcAAMgJADDaAwAAyQkAMNwDAADLCQAg4AMAAMwJADAEJwAAvwkAMNoDAADACQAw3AMAAMIJACDgAwAArgYAMAQnAACzCQAw2gMAALQJADDcAwAAtgkAIOADAAC3CQAwBCcAAKcJADDaAwAAqAkAMNwDAACqCQAg4AMAAKsJADAEJwAAmwkAMNoDAACcCQAw3AMAAJ4JACDgAwAAnwkAMAQnAACPCQAw2gMAAJAJADDcAwAAkgkAIOADAACTCQAwBCcAAIYJADDaAwAAhwkAMNwDAACJCQAg4AMAAMMHADAEJwAA-ggAMNoDAAD7CAAw3AMAAP0IACDgAwAA_ggAMAQnAADuCAAw2gMAAO8IADDcAwAA8QgAIOADAADyCAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAABycAAPEKACAoAAD0CgAg2gMAAPIKACDbAwAA8woAIN4DAAADACDfAwAAAwAg4AMAANcBACADJwAA8QoAINoDAADyCgAg4AMAANcBACANAwAAyAoAIAQAANgIACAIAADOCgAgCQAAzAoAIAsAAM0KACAOAADJCgAgEwAAygoAIBYAAMsKACAXAADPCgAg2gIAAPcFACDpAgAA9wUAILADAAD3BQAgvQMAAPcFACAAAAAVAwAA2QgAIAUAAOAKACAGAADfCgAgCQAA6AoAIAsAAOoKACAMAADnCgAgDQAA7goAIA4AAOsKACARAADsCgAgFAAA7QoAIBUAAOYKACD0AgAA9wUAIJUDAAD3BQAgvwMAAPcFACDEAwAA9wUAIMUDAAD3BQAgyAMAAPcFACDJAwAA9wUAIMsDAAD3BQAgzAMAAPcFACDNAwAA9wUAIAYDAADZCAAgBAAA4woAIBIAAOIKACAVAADmCgAg9AIAAPcFACCZAwAA9wUAIAQGAADfCgAgEgAA4goAINcCAAD3BQAg6QIAAPcFACAACgMAANkIACAEAADYCAAgDQAA2ggAINgCAAD3BQAg2gIAAPcFACCwAwAA9wUAILEDAAD3BQAgsgMAAPcFACCzAwAA9wUAILQDAAD3BQAgBQQAANgIACAGAADfCgAgCgAA4QoAIAsAAM0KACDpAgAA9wUAIAUFAADgCgAgBgAA3woAINcCAAD3BQAg6QIAAPcFACDrAgAA9wUAIAUEAADYCAAgBgAA3woAIAkAAOgKACDvAgAA9wUAIPQCAAD3BQAgCAQAANgIACAGAADfCgAg1wIAAPcFACDpAgAA9wUAIKsDAAD3BQAgrAMAAPcFACCuAwAA9wUAIK8DAAD3BQAgAAADBAAA4woAIAwAAOcKACCDAwAA9wUAIAAEAwAA2QgAIAYAAN8KACDaAgAA9wUAINsCAAD3BQAgEAQAAMAKACAIAADGCgAgCQAAxAoAIAsAAMUKACAOAADBCgAgEwAAwgoAIBYAAMMKACAXAADHCgAg1gIBAAAAAdoCAQAAAAHoAgEAAAAB6QIBAAAAAewCIAAAAAGwAwEAAAABtAMBAAAAAb0DAQAAAAECAAAA1wEAICcAAPEKACADAAAAAwAgJwAA8QoAICgAAPUKACASAAAAAwAgBAAA5ggAIAgAAOwIACAJAADqCAAgCwAA6wgAIA4AAOcIACATAADoCAAgFgAA6QgAIBcAAO0IACAgAAD1CgAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIRAEAADmCAAgCAAA7AgAIAkAAOoIACALAADrCAAgDgAA5wgAIBMAAOgIACAWAADpCAAgFwAA7QgAINYCAQD7BQAh2gIBAPwFACHoAgEA-wUAIekCAQD8BQAh7AIgAIgGACGwAwEA_AUAIbQDAQD7BQAhvQMBAPwFACEH1gIBAAAAAYADAQAAAAGVAxAAAAABzgMBAAAAAc8DAgAAAAHQAxAAAAAB0QNAAAAAARjWAgEAAAAB1wIBAAAAAdwCQAAAAAHtAgEAAAAB8wIAAADCAwL0AgEAAAABgQMBAAAAAYUDQAAAAAGUAxAAAAABlQMQAAAAAb4DAQAAAAG_AwEAAAABwAMAAADBAwLCA0AAAAABwwNAAAAAAcQDQAAAAAHFA0AAAAABxgMCAAAAAccDEAAAAAHIAxAAAAAByQMBAAAAAcoDEAAAAAHLA0AAAAABzQNAAAAAAQrWAgEAAAAB3AJAAAAAAfMCAAAAuwMC9AIBAAAAAYADAQAAAAGFA0AAAAABmAMQAAAAAbkDAQAAAAG7A0AAAAABvAMBAAAAAQrWAgEAAAAB3AJAAAAAAfMCAAAAuwMC9AIBAAAAAYADAQAAAAGFA0AAAAABmAMQAAAAAbgDAQAAAAG5AwEAAAABuwNAAAAAAQfWAgQAAAAB3AJAAAAAAekCAQAAAAGeAwEAAAABnwMBAAAAAaADAQAAAAGhA4AAAAABBdYCAQAAAAHpAgEAAAABhgMBAAAAAYkDEAAAAAGbAwEAAAABEdYCAQAAAAHcAkAAAAAB9AIBAAAAAYADAQAAAAGFA0AAAAABjgMBAAAAAY8DEAAAAAGQAxAAAAABkQMQAAAAAZIDEAAAAAGTAxAAAAABlAMQAAAAAZUDEAAAAAGWAxAAAAABlwMQAAAAAZgDEAAAAAGaA0AAAAABDNYCAQAAAAHcAkAAAAAB8wIAAACJAwL0AgEAAAABgAMBAAAAAYUDQAAAAAGGAwEAAAABhwMAAACIAwKJAxAAAAABigMgAAAAAYsDAQAAAAGMA0AAAAABBdYCAQAAAAHzAgAAANcDAtIDAQAAAAHTAwEAAAAB1QMAAADVAwIY1gIBAAAAAdwCQAAAAAHtAgEAAAAB8wIAAADCAwL0AgEAAAABgQMBAAAAAYUDQAAAAAGUAxAAAAABlQMQAAAAAb4DAQAAAAG_AwEAAAABwAMAAADBAwLCA0AAAAABwwNAAAAAAcQDQAAAAAHFA0AAAAABxgMCAAAAAccDEAAAAAHIAxAAAAAByQMBAAAAAcoDEAAAAAHLA0AAAAABzAMBAAAAAc0DQAAAAAEL1gIBAAAAAekCAQAAAAHsAiAAAAABqAMBAAAAAakDAAAAqgMCqgMQAAAAAasDEAAAAAGsAwIAAAABrQMCAAAAAa4DQAAAAAGvA0AAAAABBNYCAQAAAAHoAgEAAAAB6QIBAAAAAeoCEAAAAAED1gIBAAAAAegCAQAAAAGdA0AAAAABBtYCAQAAAAHoAgEAAAAB6QIBAAAAAewCIAAAAAH4AgIAAAAB-QIAAOIHACAJ1gIBAAAAAewCIAAAAAHtAgEAAAAB7gIBAAAAAe8CAgAAAAHwAgAAsAcAIPECAACxBwAg8wIAAADzAgL0AgEAAAABBtYCAQAAAAHoAgEAAAAB6QIBAAAAAeoCEAAAAAHrAgEAAAAB7AIgAAAAAQbWAgEAAAAB2AIBAAAAAdkCAQAAAAHaAgEAAAAB2wIBAAAAAdwCQAAAAAEjAwAAqAcAIAUAAKYHACAGAACnBwAgCQAAqwcAIAsAAOEHACAMAACpBwAgDQAArwcAIA4AAKoHACAUAACtBwAgFQAArgcAINYCAQAAAAHXAgEAAAAB3AJAAAAAAe0CAQAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQIAAAAKACAnAACHCwAgAwAAAAgAICcAAIcLACAoAACLCwAgJQAAAAgAIAMAALsGACAFAAC5BgAgBgAAugYAIAkAAL4GACALAADfBwAgDAAAvAYAIA0AAMIGACAOAAC9BgAgFAAAwAYAIBUAAMEGACAgAACLCwAg1gIBAPsFACHXAgEA-wUAIdwCQAD9BQAh7QIBAPsFACHzAgAAtQbCAyL0AgEA_AUAIYEDAQD7BQAhhQNAAP0FACGUAxAAhwYAIZUDEAC3BgAhvgMBAPsFACG_AwEA_AUAIcADAAC0BsEDIsIDQAD9BQAhwwNAAP0FACHEA0AAtgYAIcUDQAC2BgAhxgMCAJUGACHHAxAAhwYAIcgDEAC3BgAhyQMBAPwFACHKAxAAhwYAIcsDQAC2BgAhzAMBAPwFACHNA0AAtgYAISMDAAC7BgAgBQAAuQYAIAYAALoGACAJAAC-BgAgCwAA3wcAIAwAALwGACANAADCBgAgDgAAvQYAIBQAAMAGACAVAADBBgAg1gIBAPsFACHXAgEA-wUAIdwCQAD9BQAh7QIBAPsFACHzAgAAtQbCAyL0AgEA_AUAIYEDAQD7BQAhhQNAAP0FACGUAxAAhwYAIZUDEAC3BgAhvgMBAPsFACG_AwEA_AUAIcADAAC0BsEDIsIDQAD9BQAhwwNAAP0FACHEA0AAtgYAIcUDQAC2BgAhxgMCAJUGACHHAxAAhwYAIcgDEAC3BgAhyQMBAPwFACHKAxAAhwYAIcsDQAC2BgAhzAMBAPwFACHNA0AAtgYAIRAEAAC2CgAgBQAAtQoAIAYAAN4KACASAAC7CgAgFAAAvAoAIBUAAL0KACAXAAC-CgAgGAAAtwoAIBkAALgKACAaAAC6CgAg1gIBAAAAAdcCAQAAAAHzAgAAANcDAtIDAQAAAAHTAwEAAAAB1QMAAADVAwICAAAAAQAgJwAAjAsAIBjWAgEAAAAB1wIBAAAAAdwCQAAAAAHtAgEAAAAB8wIAAADCAwL0AgEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQfWAgEAAAAB3AJAAAAAAYADAQAAAAGCAwIAAAABgwMBAAAAAYQDIAAAAAGFA0AAAAABAwAAAAUAICcAAIwLACAoAACSCwAgEgAAAAUAIAQAANYJACAFAADVCQAgBgAA3QoAIBIAANsJACAUAADcCQAgFQAA3QkAIBcAAN4JACAYAADXCQAgGQAA2AkAIBoAANoJACAgAACSCwAg1gIBAPsFACHXAgEA_AUAIfMCAADTCdcDItIDAQD7BQAh0wMBAPsFACHVAwAA0gnVAyIQBAAA1gkAIAUAANUJACAGAADdCgAgEgAA2wkAIBQAANwJACAVAADdCQAgFwAA3gkAIBgAANcJACAZAADYCQAgGgAA2gkAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiEAMAAL8KACAEAADACgAgCAAAxgoAIAkAAMQKACALAADFCgAgEwAAwgoAIBYAAMMKACAXAADHCgAg1gIBAAAAAdoCAQAAAAHoAgEAAAAB6QIBAAAAAewCIAAAAAGwAwEAAAABtAMBAAAAAb0DAQAAAAECAAAA1wEAICcAAJMLACAY1gIBAAAAAdcCAQAAAAHcAkAAAAAB7QIBAAAAAfMCAAAAwgMC9AIBAAAAAYEDAQAAAAGFA0AAAAABlAMQAAAAAZUDEAAAAAG-AwEAAAABvwMBAAAAAcADAAAAwQMCwgNAAAAAAcMDQAAAAAHEA0AAAAABxQNAAAAAAcYDAgAAAAHHAxAAAAAByAMQAAAAAcoDEAAAAAHLA0AAAAABzAMBAAAAAc0DQAAAAAEDAAAAAwAgJwAAkwsAICgAAJgLACASAAAAAwAgAwAA5QgAIAQAAOYIACAIAADsCAAgCQAA6ggAIAsAAOsIACATAADoCAAgFgAA6QgAIBcAAO0IACAgAACYCwAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIRADAADlCAAgBAAA5ggAIAgAAOwIACAJAADqCAAgCwAA6wgAIBMAAOgIACAWAADpCAAgFwAA7QgAINYCAQD7BQAh2gIBAPwFACHoAgEA-wUAIekCAQD8BQAh7AIgAIgGACGwAwEA_AUAIbQDAQD7BQAhvQMBAPwFACEQAwAAvwoAIAQAAMAKACAIAADGCgAgCQAAxAoAIAsAAMUKACAOAADBCgAgFgAAwwoAIBcAAMcKACDWAgEAAAAB2gIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAbADAQAAAAG0AwEAAAABvQMBAAAAAQIAAADXAQAgJwAAmQsAIAXWAgEAAAAB6QIBAAAAAYYDAQAAAAGJAxAAAAABnAMBAAAAAQMAAAADACAnAACZCwAgKAAAngsAIBIAAAADACADAADlCAAgBAAA5ggAIAgAAOwIACAJAADqCAAgCwAA6wgAIA4AAOcIACAWAADpCAAgFwAA7QgAICAAAJ4LACDWAgEA-wUAIdoCAQD8BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAhsAMBAPwFACG0AwEA-wUAIb0DAQD8BQAhEAMAAOUIACAEAADmCAAgCAAA7AgAIAkAAOoIACALAADrCAAgDgAA5wgAIBYAAOkIACAXAADtCAAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIRAEAAC2CgAgBQAAtQoAIAYAAN4KACAMAAC5CgAgEgAAuwoAIBQAALwKACAVAAC9CgAgFwAAvgoAIBgAALcKACAZAAC4CgAg1gIBAAAAAdcCAQAAAAHzAgAAANcDAtIDAQAAAAHTAwEAAAAB1QMAAADVAwICAAAAAQAgJwAAnwsAIAMAAAAFACAnAACfCwAgKAAAowsAIBIAAAAFACAEAADWCQAgBQAA1QkAIAYAAN0KACAMAADZCQAgEgAA2wkAIBQAANwJACAVAADdCQAgFwAA3gkAIBgAANcJACAZAADYCQAgIAAAowsAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiEAQAANYJACAFAADVCQAgBgAA3QoAIAwAANkJACASAADbCQAgFAAA3AkAIBUAAN0JACAXAADeCQAgGAAA1wkAIBkAANgJACDWAgEA-wUAIdcCAQD8BQAh8wIAANMJ1wMi0gMBAPsFACHTAwEA-wUAIdUDAADSCdUDIhADAAC_CgAgBAAAwAoAIAgAAMYKACAJAADECgAgCwAAxQoAIA4AAMEKACATAADCCgAgFwAAxwoAINYCAQAAAAHaAgEAAAAB6AIBAAAAAekCAQAAAAHsAiAAAAABsAMBAAAAAbQDAQAAAAG9AwEAAAABAgAAANcBACAnAACkCwAgAwAAAAMAICcAAKQLACAoAACoCwAgEgAAAAMAIAMAAOUIACAEAADmCAAgCAAA7AgAIAkAAOoIACALAADrCAAgDgAA5wgAIBMAAOgIACAXAADtCAAgIAAAqAsAINYCAQD7BQAh2gIBAPwFACHoAgEA-wUAIekCAQD8BQAh7AIgAIgGACGwAwEA_AUAIbQDAQD7BQAhvQMBAPwFACEQAwAA5QgAIAQAAOYIACAIAADsCAAgCQAA6ggAIAsAAOsIACAOAADnCAAgEwAA6AgAIBcAAO0IACDWAgEA-wUAIdoCAQD8BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAhsAMBAPwFACG0AwEA-wUAIb0DAQD8BQAhFQMAAIcHACAEAACACAAgFQAAiAcAINYCAQAAAAHcAkAAAAAB9AIBAAAAAYADAQAAAAGFA0AAAAABjgMBAAAAAY8DEAAAAAGQAxAAAAABkQMQAAAAAZIDEAAAAAGTAxAAAAABlAMQAAAAAZUDEAAAAAGWAxAAAAABlwMQAAAAAZgDEAAAAAGZAwEAAAABmgNAAAAAAQIAAAA5ACAnAACpCwAgAwAAADcAICcAAKkLACAoAACtCwAgFwAAADcAIAMAAOgGACAEAAD_BwAgFQAA6QYAICAAAK0LACDWAgEA-wUAIdwCQAD9BQAh9AIBAPwFACGAAwEA-wUAIYUDQAD9BQAhjgMBAPsFACGPAxAAhwYAIZADEACHBgAhkQMQAIcGACGSAxAAhwYAIZMDEACHBgAhlAMQAIcGACGVAxAAhwYAIZYDEACHBgAhlwMQAIcGACGYAxAAhwYAIZkDAQD8BQAhmgNAAP0FACEVAwAA6AYAIAQAAP8HACAVAADpBgAg1gIBAPsFACHcAkAA_QUAIfQCAQD8BQAhgAMBAPsFACGFA0AA_QUAIY4DAQD7BQAhjwMQAIcGACGQAxAAhwYAIZEDEACHBgAhkgMQAIcGACGTAxAAhwYAIZQDEACHBgAhlQMQAIcGACGWAxAAhwYAIZcDEACHBgAhmAMQAIcGACGZAwEA_AUAIZoDQAD9BQAhIwMAAKgHACAFAACmBwAgBgAApwcAIAkAAKsHACALAADhBwAgDAAAqQcAIA0AAK8HACAOAACqBwAgEQAArAcAIBUAAK4HACDWAgEAAAAB1wIBAAAAAdwCQAAAAAHtAgEAAAAB8wIAAADCAwL0AgEAAAABgQMBAAAAAYUDQAAAAAGUAxAAAAABlQMQAAAAAb4DAQAAAAG_AwEAAAABwAMAAADBAwLCA0AAAAABwwNAAAAAAcQDQAAAAAHFA0AAAAABxgMCAAAAAccDEAAAAAHIAxAAAAAByQMBAAAAAcoDEAAAAAHLA0AAAAABzAMBAAAAAc0DQAAAAAECAAAACgAgJwAArgsAIAMAAAAIACAnAACuCwAgKAAAsgsAICUAAAAIACADAAC7BgAgBQAAuQYAIAYAALoGACAJAAC-BgAgCwAA3wcAIAwAALwGACANAADCBgAgDgAAvQYAIBEAAL8GACAVAADBBgAgIAAAsgsAINYCAQD7BQAh1wIBAPsFACHcAkAA_QUAIe0CAQD7BQAh8wIAALUGwgMi9AIBAPwFACGBAwEA-wUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhvwMBAPwFACHAAwAAtAbBAyLCA0AA_QUAIcMDQAD9BQAhxANAALYGACHFA0AAtgYAIcYDAgCVBgAhxwMQAIcGACHIAxAAtwYAIckDAQD8BQAhygMQAIcGACHLA0AAtgYAIcwDAQD8BQAhzQNAALYGACEjAwAAuwYAIAUAALkGACAGAAC6BgAgCQAAvgYAIAsAAN8HACAMAAC8BgAgDQAAwgYAIA4AAL0GACARAAC_BgAgFQAAwQYAINYCAQD7BQAh1wIBAPsFACHcAkAA_QUAIe0CAQD7BQAh8wIAALUGwgMi9AIBAPwFACGBAwEA-wUAIYUDQAD9BQAhlAMQAIcGACGVAxAAtwYAIb4DAQD7BQAhvwMBAPwFACHAAwAAtAbBAyLCA0AA_QUAIcMDQAD9BQAhxANAALYGACHFA0AAtgYAIcYDAgCVBgAhxwMQAIcGACHIAxAAtwYAIckDAQD8BQAhygMQAIcGACHLA0AAtgYAIcwDAQD8BQAhzQNAALYGACEjAwAAqAcAIAUAAKYHACAGAACnBwAgCQAAqwcAIAsAAOEHACAMAACpBwAgDgAAqgcAIBEAAKwHACAUAACtBwAgFQAArgcAINYCAQAAAAHXAgEAAAAB3AJAAAAAAe0CAQAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQIAAAAKACAnAACzCwAgAwAAAAgAICcAALMLACAoAAC3CwAgJQAAAAgAIAMAALsGACAFAAC5BgAgBgAAugYAIAkAAL4GACALAADfBwAgDAAAvAYAIA4AAL0GACARAAC_BgAgFAAAwAYAIBUAAMEGACAgAAC3CwAg1gIBAPsFACHXAgEA-wUAIdwCQAD9BQAh7QIBAPsFACHzAgAAtQbCAyL0AgEA_AUAIYEDAQD7BQAhhQNAAP0FACGUAxAAhwYAIZUDEAC3BgAhvgMBAPsFACG_AwEA_AUAIcADAAC0BsEDIsIDQAD9BQAhwwNAAP0FACHEA0AAtgYAIcUDQAC2BgAhxgMCAJUGACHHAxAAhwYAIcgDEAC3BgAhyQMBAPwFACHKAxAAhwYAIcsDQAC2BgAhzAMBAPwFACHNA0AAtgYAISMDAAC7BgAgBQAAuQYAIAYAALoGACAJAAC-BgAgCwAA3wcAIAwAALwGACAOAAC9BgAgEQAAvwYAIBQAAMAGACAVAADBBgAg1gIBAPsFACHXAgEA-wUAIdwCQAD9BQAh7QIBAPsFACHzAgAAtQbCAyL0AgEA_AUAIYEDAQD7BQAhhQNAAP0FACGUAxAAhwYAIZUDEAC3BgAhvgMBAPsFACG_AwEA_AUAIcADAAC0BsEDIsIDQAD9BQAhwwNAAP0FACHEA0AAtgYAIcUDQAC2BgAhxgMCAJUGACHHAxAAhwYAIcgDEAC3BgAhyQMBAPwFACHKAxAAhwYAIcsDQAC2BgAhzAMBAPwFACHNA0AAtgYAIQoEAADjBwAgBgAA5QcAIAsAAOYHACDWAgEAAAAB1wIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAfgCAgAAAAH5AgAA4gcAIAIAAABhACAnAAC4CwAgAwAAAF8AICcAALgLACAoAAC8CwAgDAAAAF8AIAQAALsHACAGAAC9BwAgCwAAvgcAICAAALwLACDWAgEA-wUAIdcCAQD7BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAh-AICAJUGACH5AgAAugcAIAoEAAC7BwAgBgAAvQcAIAsAAL4HACDWAgEA-wUAIdcCAQD7BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAh-AICAJUGACH5AgAAugcAIBADAAC_CgAgBAAAwAoAIAgAAMYKACALAADFCgAgDgAAwQoAIBMAAMIKACAWAADDCgAgFwAAxwoAINYCAQAAAAHaAgEAAAAB6AIBAAAAAekCAQAAAAHsAiAAAAABsAMBAAAAAbQDAQAAAAG9AwEAAAABAgAAANcBACAnAAC9CwAgDAYAALMHACAJAAC0BwAg1gIBAAAAAdcCAQAAAAHsAiAAAAAB7QIBAAAAAe4CAQAAAAHvAgIAAAAB8AIAALAHACDxAgAAsQcAIPMCAAAA8wIC9AIBAAAAAQIAAAAdACAnAAC_CwAgAwAAABQAICcAAL8LACAoAADDCwAgDgAAABQAIAYAAKgGACAJAACpBgAgIAAAwwsAINYCAQD7BQAh1wIBAPsFACHsAiAAiAYAIe0CAQD7BQAh7gIBAPsFACHvAgIAowYAIfACAACkBgAg8QIAAKUGACDzAgAApgbzAiL0AgEA_AUAIQwGAACoBgAgCQAAqQYAINYCAQD7BQAh1wIBAPsFACHsAiAAiAYAIe0CAQD7BQAh7gIBAPsFACHvAgIAowYAIfACAACkBgAg8QIAAKUGACDzAgAApgbzAiL0AgEA_AUAIRjWAgEAAAAB1wIBAAAAAdwCQAAAAAHzAgAAAMIDAvQCAQAAAAGBAwEAAAABhQNAAAAAAZQDEAAAAAGVAxAAAAABvgMBAAAAAb8DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQfWAgEAAAAB-gIQAAAAAfsCEAAAAAH8AhAAAAAB_QIQAAAAAf4CQAAAAAH_AkAAAAABCdYCAQAAAAHXAgEAAAAB7AIgAAAAAe4CAQAAAAHvAgIAAAAB8AIAALAHACDxAgAAsQcAIPMCAAAA8wIC9AIBAAAAAQMAAAADACAnAAC9CwAgKAAAyQsAIBIAAAADACADAADlCAAgBAAA5ggAIAgAAOwIACALAADrCAAgDgAA5wgAIBMAAOgIACAWAADpCAAgFwAA7QgAICAAAMkLACDWAgEA-wUAIdoCAQD8BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAhsAMBAPwFACG0AwEA-wUAIb0DAQD8BQAhEAMAAOUIACAEAADmCAAgCAAA7AgAIAsAAOsIACAOAADnCAAgEwAA6AgAIBYAAOkIACAXAADtCAAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIQoEAADjBwAgBgAA5QcAIAoAAOQHACDWAgEAAAAB1wIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAfgCAgAAAAH5AgAA4gcAIAIAAABhACAnAADKCwAgEAMAAL8KACAEAADACgAgCAAAxgoAIAkAAMQKACAOAADBCgAgEwAAwgoAIBYAAMMKACAXAADHCgAg1gIBAAAAAdoCAQAAAAHoAgEAAAAB6QIBAAAAAewCIAAAAAGwAwEAAAABtAMBAAAAAb0DAQAAAAECAAAA1wEAICcAAMwLACAKBgAA5QcAIAoAAOQHACALAADmBwAg1gIBAAAAAdcCAQAAAAHoAgEAAAAB6QIBAAAAAewCIAAAAAH4AgIAAAAB-QIAAOIHACACAAAAYQAgJwAAzgsAIA0GAAC5CAAg1gIBAAAAAdcCAQAAAAHpAgEAAAAB7AIgAAAAAagDAQAAAAGpAwAAAKoDAqoDEAAAAAGrAxAAAAABrAMCAAAAAa0DAgAAAAGuA0AAAAABrwNAAAAAAQIAAABVACAnAADQCwAgCwMAANYIACANAADXCAAg1gIBAAAAAdgCAQAAAAHZAgEAAAAB2gIBAAAAAbADAQAAAAGxAwEAAAABsgMBAAAAAbMDQAAAAAG0AwEAAAABAgAAAIkCACAnAADSCwAgEAUAALUKACAGAADeCgAgDAAAuQoAIBIAALsKACAUAAC8CgAgFQAAvQoAIBcAAL4KACAYAAC3CgAgGQAAuAoAIBoAALoKACDWAgEAAAAB1wIBAAAAAfMCAAAA1wMC0gMBAAAAAdMDAQAAAAHVAwAAANUDAgIAAAABACAnAADUCwAgEAMAAL8KACAIAADGCgAgCQAAxAoAIAsAAMUKACAOAADBCgAgEwAAwgoAIBYAAMMKACAXAADHCgAg1gIBAAAAAdoCAQAAAAHoAgEAAAAB6QIBAAAAAewCIAAAAAGwAwEAAAABtAMBAAAAAb0DAQAAAAECAAAA1wEAICcAANYLACAIBgAAnQYAINYCAQAAAAHXAgEAAAAB6AIBAAAAAekCAQAAAAHqAhAAAAAB6wIBAAAAAewCIAAAAAECAAAAZgAgJwAA2AsAIAMAAABkACAnAADYCwAgKAAA3AsAIAoAAABkACAGAACKBgAgIAAA3AsAINYCAQD7BQAh1wIBAPwFACHoAgEA-wUAIekCAQD8BQAh6gIQAIcGACHrAgEA_AUAIewCIACIBgAhCAYAAIoGACDWAgEA-wUAIdcCAQD8BQAh6AIBAPsFACHpAgEA_AUAIeoCEACHBgAh6wIBAPwFACHsAiAAiAYAIQfWAgEAAAABlQMQAAAAAZwDAQAAAAHOAwEAAAABzwMCAAAAAdADEAAAAAHRA0AAAAABEAQAALYKACAFAAC1CgAgBgAA3goAIAwAALkKACASAAC7CgAgFAAAvAoAIBUAAL0KACAXAAC-CgAgGAAAtwoAIBoAALoKACDWAgEAAAAB1wIBAAAAAfMCAAAA1wMC0gMBAAAAAdMDAQAAAAHVAwAAANUDAgIAAAABACAnAADeCwAgEAQAALYKACAFAAC1CgAgBgAA3goAIAwAALkKACASAAC7CgAgFAAAvAoAIBUAAL0KACAXAAC-CgAgGQAAuAoAIBoAALoKACDWAgEAAAAB1wIBAAAAAfMCAAAA1wMC0gMBAAAAAdMDAQAAAAHVAwAAANUDAgIAAAABACAnAADgCwAgAwAAAAUAICcAAN4LACAoAADkCwAgEgAAAAUAIAQAANYJACAFAADVCQAgBgAA3QoAIAwAANkJACASAADbCQAgFAAA3AkAIBUAAN0JACAXAADeCQAgGAAA1wkAIBoAANoJACAgAADkCwAg1gIBAPsFACHXAgEA_AUAIfMCAADTCdcDItIDAQD7BQAh0wMBAPsFACHVAwAA0gnVAyIQBAAA1gkAIAUAANUJACAGAADdCgAgDAAA2QkAIBIAANsJACAUAADcCQAgFQAA3QkAIBcAAN4JACAYAADXCQAgGgAA2gkAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiAwAAAAUAICcAAOALACAoAADnCwAgEgAAAAUAIAQAANYJACAFAADVCQAgBgAA3QoAIAwAANkJACASAADbCQAgFAAA3AkAIBUAAN0JACAXAADeCQAgGQAA2AkAIBoAANoJACAgAADnCwAg1gIBAPsFACHXAgEA_AUAIfMCAADTCdcDItIDAQD7BQAh0wMBAPsFACHVAwAA0gnVAyIQBAAA1gkAIAUAANUJACAGAADdCgAgDAAA2QkAIBIAANsJACAUAADcCQAgFQAA3QkAIBcAAN4JACAZAADYCQAgGgAA2gkAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiCtYCAQAAAAHcAkAAAAAB8wIAAAC7AwL0AgEAAAABhQNAAAAAAZgDEAAAAAG4AwEAAAABuQMBAAAAAbsDQAAAAAG8AwEAAAABEAQAALYKACAFAAC1CgAgBgAA3goAIAwAALkKACASAAC7CgAgFQAAvQoAIBcAAL4KACAYAAC3CgAgGQAAuAoAIBoAALoKACDWAgEAAAAB1wIBAAAAAfMCAAAA1wMC0gMBAAAAAdMDAQAAAAHVAwAAANUDAgIAAAABACAnAADpCwAgBgYAAKUIACDWAgEAAAAB1wIBAAAAAegCAQAAAAHpAgEAAAAB6gIQAAAAAQIAAABYACAnAADrCwAgEAQAALYKACAFAAC1CgAgBgAA3goAIAwAALkKACAUAAC8CgAgFQAAvQoAIBcAAL4KACAYAAC3CgAgGQAAuAoAIBoAALoKACDWAgEAAAAB1wIBAAAAAfMCAAAA1wMC0gMBAAAAAdMDAQAAAAHVAwAAANUDAgIAAAABACAnAADtCwAgAwAAAEAAICcAAOsLACAoAADxCwAgCAAAAEAAIAYAAJoIACAgAADxCwAg1gIBAPsFACHXAgEA_AUAIegCAQD7BQAh6QIBAPwFACHqAhAAhwYAIQYGAACaCAAg1gIBAPsFACHXAgEA_AUAIegCAQD7BQAh6QIBAPwFACHqAhAAhwYAIQMAAAAFACAnAADtCwAgKAAA9AsAIBIAAAAFACAEAADWCQAgBQAA1QkAIAYAAN0KACAMAADZCQAgFAAA3AkAIBUAAN0JACAXAADeCQAgGAAA1wkAIBkAANgJACAaAADaCQAgIAAA9AsAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiEAQAANYJACAFAADVCQAgBgAA3QoAIAwAANkJACAUAADcCQAgFQAA3QkAIBcAAN4JACAYAADXCQAgGQAA2AkAIBoAANoJACDWAgEA-wUAIdcCAQD8BQAh8wIAANMJ1wMi0gMBAPsFACHTAwEA-wUAIdUDAADSCdUDIgXWAgEAAAAB6QIBAAAAAYkDEAAAAAGbAwEAAAABnAMBAAAAASMDAACoBwAgBQAApgcAIAYAAKcHACAJAACrBwAgCwAA4QcAIAwAAKkHACANAACvBwAgDgAAqgcAIBEAAKwHACAUAACtBwAg1gIBAAAAAdcCAQAAAAHcAkAAAAAB7QIBAAAAAfMCAAAAwgMC9AIBAAAAAYEDAQAAAAGFA0AAAAABlAMQAAAAAZUDEAAAAAG-AwEAAAABvwMBAAAAAcADAAAAwQMCwgNAAAAAAcMDQAAAAAHEA0AAAAABxQNAAAAAAcYDAgAAAAHHAxAAAAAByAMQAAAAAckDAQAAAAHKAxAAAAABywNAAAAAAcwDAQAAAAHNA0AAAAABAgAAAAoAICcAAPYLACADAAAACAAgJwAA9gsAICgAAPoLACAlAAAACAAgAwAAuwYAIAUAALkGACAGAAC6BgAgCQAAvgYAIAsAAN8HACAMAAC8BgAgDQAAwgYAIA4AAL0GACARAAC_BgAgFAAAwAYAICAAAPoLACDWAgEA-wUAIdcCAQD7BQAh3AJAAP0FACHtAgEA-wUAIfMCAAC1BsIDIvQCAQD8BQAhgQMBAPsFACGFA0AA_QUAIZQDEACHBgAhlQMQALcGACG-AwEA-wUAIb8DAQD8BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhIwMAALsGACAFAAC5BgAgBgAAugYAIAkAAL4GACALAADfBwAgDAAAvAYAIA0AAMIGACAOAAC9BgAgEQAAvwYAIBQAAMAGACDWAgEA-wUAIdcCAQD7BQAh3AJAAP0FACHtAgEA-wUAIfMCAAC1BsIDIvQCAQD8BQAhgQMBAPsFACGFA0AA_QUAIZQDEACHBgAhlQMQALcGACG-AwEA-wUAIb8DAQD8BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhDNYCAQAAAAHcAkAAAAAB8wIAAACJAwL0AgEAAAABgAMBAAAAAYUDQAAAAAGHAwAAAIgDAokDEAAAAAGKAyAAAAABiwMBAAAAAYwDQAAAAAGNAwEAAAABAwAAAAUAICcAAOkLACAoAAD-CwAgEgAAAAUAIAQAANYJACAFAADVCQAgBgAA3QoAIAwAANkJACASAADbCQAgFQAA3QkAIBcAAN4JACAYAADXCQAgGQAA2AkAIBoAANoJACAgAAD-CwAg1gIBAPsFACHXAgEA_AUAIfMCAADTCdcDItIDAQD7BQAh0wMBAPsFACHVAwAA0gnVAyIQBAAA1gkAIAUAANUJACAGAADdCgAgDAAA2QkAIBIAANsJACAVAADdCQAgFwAA3gkAIBgAANcJACAZAADYCQAgGgAA2gkAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiEdYCAQAAAAHcAkAAAAAB9AIBAAAAAYUDQAAAAAGOAwEAAAABjwMQAAAAAZADEAAAAAGRAxAAAAABkgMQAAAAAZMDEAAAAAGUAxAAAAABlQMQAAAAAZYDEAAAAAGXAxAAAAABmAMQAAAAAZkDAQAAAAGaA0AAAAABEAQAALYKACAFAAC1CgAgBgAA3goAIAwAALkKACASAAC7CgAgFAAAvAoAIBcAAL4KACAYAAC3CgAgGQAAuAoAIBoAALoKACDWAgEAAAAB1wIBAAAAAfMCAAAA1wMC0gMBAAAAAdMDAQAAAAHVAwAAANUDAgIAAAABACAnAACADAAgFQMAAIcHACAEAACACAAgEgAAhgcAINYCAQAAAAHcAkAAAAAB9AIBAAAAAYADAQAAAAGFA0AAAAABjgMBAAAAAY8DEAAAAAGQAxAAAAABkQMQAAAAAZIDEAAAAAGTAxAAAAABlAMQAAAAAZUDEAAAAAGWAxAAAAABlwMQAAAAAZgDEAAAAAGZAwEAAAABmgNAAAAAAQIAAAA5ACAnAACCDAAgAwAAAAUAICcAAIAMACAoAACGDAAgEgAAAAUAIAQAANYJACAFAADVCQAgBgAA3QoAIAwAANkJACASAADbCQAgFAAA3AkAIBcAAN4JACAYAADXCQAgGQAA2AkAIBoAANoJACAgAACGDAAg1gIBAPsFACHXAgEA_AUAIfMCAADTCdcDItIDAQD7BQAh0wMBAPsFACHVAwAA0gnVAyIQBAAA1gkAIAUAANUJACAGAADdCgAgDAAA2QkAIBIAANsJACAUAADcCQAgFwAA3gkAIBgAANcJACAZAADYCQAgGgAA2gkAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiAwAAADcAICcAAIIMACAoAACJDAAgFwAAADcAIAMAAOgGACAEAAD_BwAgEgAA5wYAICAAAIkMACDWAgEA-wUAIdwCQAD9BQAh9AIBAPwFACGAAwEA-wUAIYUDQAD9BQAhjgMBAPsFACGPAxAAhwYAIZADEACHBgAhkQMQAIcGACGSAxAAhwYAIZMDEACHBgAhlAMQAIcGACGVAxAAhwYAIZYDEACHBgAhlwMQAIcGACGYAxAAhwYAIZkDAQD8BQAhmgNAAP0FACEVAwAA6AYAIAQAAP8HACASAADnBgAg1gIBAPsFACHcAkAA_QUAIfQCAQD8BQAhgAMBAPsFACGFA0AA_QUAIY4DAQD7BQAhjwMQAIcGACGQAxAAhwYAIZEDEACHBgAhkgMQAIcGACGTAxAAhwYAIZQDEACHBgAhlQMQAIcGACGWAxAAhwYAIZcDEACHBgAhmAMQAIcGACGZAwEA_AUAIZoDQAD9BQAhDNYCAQAAAAHcAkAAAAAB8wIAAACJAwL0AgEAAAABhQNAAAAAAYYDAQAAAAGHAwAAAIgDAokDEAAAAAGKAyAAAAABiwMBAAAAAYwDQAAAAAGNAwEAAAABCwMAANYIACAEAADVCAAg1gIBAAAAAdgCAQAAAAHZAgEAAAAB2gIBAAAAAbADAQAAAAGxAwEAAAABsgMBAAAAAbMDQAAAAAG0AwEAAAABAgAAAIkCACAnAACLDAAgAwAAAHkAICcAAIsMACAoAACPDAAgDQAAAHkAIAMAAL4IACAEAAC9CAAgIAAAjwwAINYCAQD7BQAh2AIBAPwFACHZAgEA-wUAIdoCAQD8BQAhsAMBAPwFACGxAwEA_AUAIbIDAQD8BQAhswNAALYGACG0AwEA_AUAIQsDAAC-CAAgBAAAvQgAINYCAQD7BQAh2AIBAPwFACHZAgEA-wUAIdoCAQD8BQAhsAMBAPwFACGxAwEA_AUAIbIDAQD8BQAhswNAALYGACG0AwEA_AUAIQMAAABfACAnAADOCwAgKAAAkgwAIAwAAABfACAGAAC9BwAgCgAAvAcAIAsAAL4HACAgAACSDAAg1gIBAPsFACHXAgEA-wUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIfgCAgCVBgAh-QIAALoHACAKBgAAvQcAIAoAALwHACALAAC-BwAg1gIBAPsFACHXAgEA-wUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIfgCAgCVBgAh-QIAALoHACADAAAALAAgJwAA0AsAICgAAJUMACAPAAAALAAgBgAArggAICAAAJUMACDWAgEA-wUAIdcCAQD8BQAh6QIBAPwFACHsAiAAiAYAIagDAQD7BQAhqQMAAKwIqgMiqgMQAIcGACGrAxAAtwYAIawDAgCjBgAhrQMCAJUGACGuA0AAtgYAIa8DQAC2BgAhDQYAAK4IACDWAgEA-wUAIdcCAQD8BQAh6QIBAPwFACHsAiAAiAYAIagDAQD7BQAhqQMAAKwIqgMiqgMQAIcGACGrAxAAtwYAIawDAgCjBgAhrQMCAJUGACGuA0AAtgYAIa8DQAC2BgAhAwAAAHkAICcAANILACAoAACYDAAgDQAAAHkAIAMAAL4IACANAAC_CAAgIAAAmAwAINYCAQD7BQAh2AIBAPwFACHZAgEA-wUAIdoCAQD8BQAhsAMBAPwFACGxAwEA_AUAIbIDAQD8BQAhswNAALYGACG0AwEA_AUAIQsDAAC-CAAgDQAAvwgAINYCAQD7BQAh2AIBAPwFACHZAgEA-wUAIdoCAQD8BQAhsAMBAPwFACGxAwEA_AUAIbIDAQD8BQAhswNAALYGACG0AwEA_AUAIQMAAAAFACAnAADUCwAgKAAAmwwAIBIAAAAFACAFAADVCQAgBgAA3QoAIAwAANkJACASAADbCQAgFAAA3AkAIBUAAN0JACAXAADeCQAgGAAA1wkAIBkAANgJACAaAADaCQAgIAAAmwwAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiEAUAANUJACAGAADdCgAgDAAA2QkAIBIAANsJACAUAADcCQAgFQAA3QkAIBcAAN4JACAYAADXCQAgGQAA2AkAIBoAANoJACDWAgEA-wUAIdcCAQD8BQAh8wIAANMJ1wMi0gMBAPsFACHTAwEA-wUAIdUDAADSCdUDIgMAAAADACAnAADWCwAgKAAAngwAIBIAAAADACADAADlCAAgCAAA7AgAIAkAAOoIACALAADrCAAgDgAA5wgAIBMAAOgIACAWAADpCAAgFwAA7QgAICAAAJ4MACDWAgEA-wUAIdoCAQD8BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAhsAMBAPwFACG0AwEA-wUAIb0DAQD8BQAhEAMAAOUIACAIAADsCAAgCQAA6ggAIAsAAOsIACAOAADnCAAgEwAA6AgAIBYAAOkIACAXAADtCAAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIRjWAgEAAAAB1wIBAAAAAdwCQAAAAAHtAgEAAAAB8wIAAADCAwL0AgEAAAABgQMBAAAAAYUDQAAAAAGUAxAAAAABlQMQAAAAAb4DAQAAAAHAAwAAAMEDAsIDQAAAAAHDA0AAAAABxANAAAAAAcUDQAAAAAHGAwIAAAABxwMQAAAAAcgDEAAAAAHJAwEAAAABygMQAAAAAcsDQAAAAAHMAwEAAAABzQNAAAAAAQMAAABfACAnAADKCwAgKAAAogwAIAwAAABfACAEAAC7BwAgBgAAvQcAIAoAALwHACAgAACiDAAg1gIBAPsFACHXAgEA-wUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIfgCAgCVBgAh-QIAALoHACAKBAAAuwcAIAYAAL0HACAKAAC8BwAg1gIBAPsFACHXAgEA-wUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIfgCAgCVBgAh-QIAALoHACADAAAAAwAgJwAAzAsAICgAAKUMACASAAAAAwAgAwAA5QgAIAQAAOYIACAIAADsCAAgCQAA6ggAIA4AAOcIACATAADoCAAgFgAA6QgAIBcAAO0IACAgAAClDAAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIRADAADlCAAgBAAA5ggAIAgAAOwIACAJAADqCAAgDgAA5wgAIBMAAOgIACAWAADpCAAgFwAA7QgAINYCAQD7BQAh2gIBAPwFACHoAgEA-wUAIekCAQD8BQAh7AIgAIgGACGwAwEA_AUAIbQDAQD7BQAhvQMBAPwFACEQAwAAvwoAIAQAAMAKACAJAADECgAgCwAAxQoAIA4AAMEKACATAADCCgAgFgAAwwoAIBcAAMcKACDWAgEAAAAB2gIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAbADAQAAAAG0AwEAAAABvQMBAAAAAQIAAADXAQAgJwAApgwAICMDAACoBwAgBgAApwcAIAkAAKsHACALAADhBwAgDAAAqQcAIA0AAK8HACAOAACqBwAgEQAArAcAIBQAAK0HACAVAACuBwAg1gIBAAAAAdcCAQAAAAHcAkAAAAAB7QIBAAAAAfMCAAAAwgMC9AIBAAAAAYEDAQAAAAGFA0AAAAABlAMQAAAAAZUDEAAAAAG-AwEAAAABvwMBAAAAAcADAAAAwQMCwgNAAAAAAcMDQAAAAAHEA0AAAAABxQNAAAAAAcYDAgAAAAHHAxAAAAAByAMQAAAAAckDAQAAAAHKAxAAAAABywNAAAAAAcwDAQAAAAHNA0AAAAABAgAAAAoAICcAAKgMACAQBAAAtgoAIAYAAN4KACAMAAC5CgAgEgAAuwoAIBQAALwKACAVAAC9CgAgFwAAvgoAIBgAALcKACAZAAC4CgAgGgAAugoAINYCAQAAAAHXAgEAAAAB8wIAAADXAwLSAwEAAAAB0wMBAAAAAdUDAAAA1QMCAgAAAAEAICcAAKoMACADAAAACAAgJwAAqAwAICgAAK4MACAlAAAACAAgAwAAuwYAIAYAALoGACAJAAC-BgAgCwAA3wcAIAwAALwGACANAADCBgAgDgAAvQYAIBEAAL8GACAUAADABgAgFQAAwQYAICAAAK4MACDWAgEA-wUAIdcCAQD7BQAh3AJAAP0FACHtAgEA-wUAIfMCAAC1BsIDIvQCAQD8BQAhgQMBAPsFACGFA0AA_QUAIZQDEACHBgAhlQMQALcGACG-AwEA-wUAIb8DAQD8BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhIwMAALsGACAGAAC6BgAgCQAAvgYAIAsAAN8HACAMAAC8BgAgDQAAwgYAIA4AAL0GACARAAC_BgAgFAAAwAYAIBUAAMEGACDWAgEA-wUAIdcCAQD7BQAh3AJAAP0FACHtAgEA-wUAIfMCAAC1BsIDIvQCAQD8BQAhgQMBAPsFACGFA0AA_QUAIZQDEACHBgAhlQMQALcGACG-AwEA-wUAIb8DAQD8BQAhwAMAALQGwQMiwgNAAP0FACHDA0AA_QUAIcQDQAC2BgAhxQNAALYGACHGAwIAlQYAIccDEACHBgAhyAMQALcGACHJAwEA_AUAIcoDEACHBgAhywNAALYGACHMAwEA_AUAIc0DQAC2BgAhAwAAAAUAICcAAKoMACAoAACxDAAgEgAAAAUAIAQAANYJACAGAADdCgAgDAAA2QkAIBIAANsJACAUAADcCQAgFQAA3QkAIBcAAN4JACAYAADXCQAgGQAA2AkAIBoAANoJACAgAACxDAAg1gIBAPsFACHXAgEA_AUAIfMCAADTCdcDItIDAQD7BQAh0wMBAPsFACHVAwAA0gnVAyIQBAAA1gkAIAYAAN0KACAMAADZCQAgEgAA2wkAIBQAANwJACAVAADdCQAgFwAA3gkAIBgAANcJACAZAADYCQAgGgAA2gkAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiB9YCAQAAAAGAAwEAAAABlQMQAAAAAZwDAQAAAAHPAwIAAAAB0AMQAAAAAdEDQAAAAAEDAAAAAwAgJwAApgwAICgAALUMACASAAAAAwAgAwAA5QgAIAQAAOYIACAJAADqCAAgCwAA6wgAIA4AAOcIACATAADoCAAgFgAA6QgAIBcAAO0IACAgAAC1DAAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIRADAADlCAAgBAAA5ggAIAkAAOoIACALAADrCAAgDgAA5wgAIBMAAOgIACAWAADpCAAgFwAA7QgAINYCAQD7BQAh2gIBAPwFACHoAgEA-wUAIekCAQD8BQAh7AIgAIgGACGwAwEA_AUAIbQDAQD7BQAhvQMBAPwFACEQAwAAvwoAIAQAAMAKACAIAADGCgAgCQAAxAoAIAsAAMUKACAOAADBCgAgEwAAwgoAIBYAAMMKACDWAgEAAAAB2gIBAAAAAegCAQAAAAHpAgEAAAAB7AIgAAAAAbADAQAAAAG0AwEAAAABvQMBAAAAAQIAAADXAQAgJwAAtgwAIBAEAAC2CgAgBQAAtQoAIAYAAN4KACAMAAC5CgAgEgAAuwoAIBQAALwKACAVAAC9CgAgGAAAtwoAIBkAALgKACAaAAC6CgAg1gIBAAAAAdcCAQAAAAHzAgAAANcDAtIDAQAAAAHTAwEAAAAB1QMAAADVAwICAAAAAQAgJwAAuAwAIAMAAAADACAnAAC2DAAgKAAAvAwAIBIAAAADACADAADlCAAgBAAA5ggAIAgAAOwIACAJAADqCAAgCwAA6wgAIA4AAOcIACATAADoCAAgFgAA6QgAICAAALwMACDWAgEA-wUAIdoCAQD8BQAh6AIBAPsFACHpAgEA_AUAIewCIACIBgAhsAMBAPwFACG0AwEA-wUAIb0DAQD8BQAhEAMAAOUIACAEAADmCAAgCAAA7AgAIAkAAOoIACALAADrCAAgDgAA5wgAIBMAAOgIACAWAADpCAAg1gIBAPsFACHaAgEA_AUAIegCAQD7BQAh6QIBAPwFACHsAiAAiAYAIbADAQD8BQAhtAMBAPsFACG9AwEA_AUAIQMAAAAFACAnAAC4DAAgKAAAvwwAIBIAAAAFACAEAADWCQAgBQAA1QkAIAYAAN0KACAMAADZCQAgEgAA2wkAIBQAANwJACAVAADdCQAgGAAA1wkAIBkAANgJACAaAADaCQAgIAAAvwwAINYCAQD7BQAh1wIBAPwFACHzAgAA0wnXAyLSAwEA-wUAIdMDAQD7BQAh1QMAANIJ1QMiEAQAANYJACAFAADVCQAgBgAA3QoAIAwAANkJACASAADbCQAgFAAA3AkAIBUAAN0JACAYAADXCQAgGQAA2AkAIBoAANoJACDWAgEA-wUAIdcCAQD8BQAh8wIAANMJ1wMi0gMBAPsFACHTAwEA-wUAIdUDAADSCdUDIgwEdgMFdQQGBAIHAB0MegwSgAETFIEBEhWCARYXgwEaGHcRGXgRGn4cCgMHAQQLAwcAGwhnBQliCAtjBw5WDxNZFBZdGRdrGgwDIwEFDwQGAAIHABgJAAgLFQcMAAwNTw0OLQ8RNBEUOhIVThYDAxABBAADCAAFAwURBAYSAgcABgEFEwAEBBYDBgACBwALCQAIBQQXAwYAAgcACgobCQseBwEJAAgDBB8ACiAACyEAAQQiAAQDJQEEJAMHAA4NKQ0CBAADDAAMAgQqAA0rAAMELgMGLwIHABABBDAAAwQAAw81ARA2AQUDRQEEAAMHABcSPhMVSRYDAz8BE0EUFAASAwZCAgcAFRJDEwESRAADA0sBBAADFEoSAhJMABVNAAQFUAARUQAUUgAVUwABBl4CAgMAAQYAAgkDbAAEbQAIcwAJcQALcgAObgATbwAWcAAXdAABA38BCASFAQAFhAEAEokBABSKAQAViwEAGIYBABmHAQAaiAEAAAEGlQECAQabAQIDBwAiLQAjLgAkAAAAAwcAIi0AIy4AJAMDrQEBBAADCAAFAwOzAQEEAAMIAAUFBwApLQAsLgAtPwAqQAArAAAAAAAFBwApLQAsLgAtPwAqQAArBgPGAQEGAAIJAAgLxQEHDAAMDscBDwYDzgEBBgACCQAIC80BBwwADA7PAQ8FBwAyLQA1LgA2PwAzQAA0AAAAAAAFBwAyLQA1LgA2PwAzQAA0AAADBwA7LQA8LgA9AAAAAwcAOy0APC4APQMEAAMP-QEBEPoBAQMEAAMPgAIBEIECAQUHAEItAEUuAEY_AENAAEQAAAAAAAUHAEItAEUuAEY_AENAAEQBA5UCAQEDmwIBAwcASy0ATC4ATQAAAAMHAEstAEwuAE0BBq0CAgEGswICBQcAUi0AVS4AVj8AU0AAVAAAAAAABQcAUi0AVS4AVj8AU0AAVAEGxQICAQbLAgIFBwBbLQBeLgBfPwBcQABdAAAAAAAFBwBbLQBeLgBfPwBcQABdAQPdAgEBA-MCAQUHAGQtAGcuAGg_AGVAAGYAAAAAAAUHAGQtAGcuAGg_AGVAAGYBBvUCAgEG-wICAwcAbS0Abi4AbwAAAAMHAG0tAG4uAG8DA40DAROOAxQUABIDA5QDAROVAxQUABIFBwB0LQB3LgB4PwB1QAB2AAAAAAAFBwB0LQB3LgB4PwB1QAB2AgOnAwEEAAMCA60DAQQAAwUHAH0tAIABLgCBAT8AfkAAfwAAAAAABQcAfS0AgAEuAIEBPwB-QAB_AwPAAwEEAAMUvwMSAwPHAwEEAAMUxgMSBQcAhgEtAIkBLgCKAT8AhwFAAIgBAAAAAAAFBwCGAS0AiQEuAIoBPwCHAUAAiAECBAADDAAMAgQAAwwADAUHAI8BLQCSAS4AkwE_AJABQACRAQAAAAAABQcAjwEtAJIBLgCTAT8AkAFAAJEBAQkACAEJAAgFBwCYAS0AmwEuAJwBPwCZAUAAmgEAAAAAAAUHAJgBLQCbAS4AnAE_AJkBQACaAQEGAAIBBgACBQcAoQEtAKQBLgClAT8AogFAAKMBAAAAAAAFBwChAS0ApAEuAKUBPwCiAUAAowECBgACCQAIAgYAAgkACAUHAKoBLQCtAS4ArgE_AKsBQACsAQAAAAAABQcAqgEtAK0BLgCuAT8AqwFAAKwBAQaxBAIBBrcEAgUHALMBLQC2AS4AtwE_ALQBQAC1AQAAAAAABQcAswEtALYBLgC3AT8AtAFAALUBAgMAAQYAAgIDAAEGAAIDBwC8AS0AvQEuAL4BAAAAAwcAvAEtAL0BLgC-ARsCARyMAQEdjQEBHo4BAR-PAQEhkQEBIpMBHiOUAR8klwEBJZkBHiaaASApnAEBKp0BASueAR4voQEhMKIBJTGjAQQypAEEM6UBBDSmAQQ1pwEENqkBBDerAR44rAEmOa8BBDqxAR47sgEnPLQBBD21AQQ-tgEeQbkBKEK6AS5DuwEDRLwBA0W9AQNGvgEDR78BA0jBAQNJwwEeSsQBL0vJAQNMywEeTcwBME7QAQNP0QEDUNIBHlHVATFS1gE3U9gBAlTZAQJV2wECVtwBAlfdAQJY3wECWeEBHlriAThb5AECXOYBHl3nATle6AECX-kBAmDqAR5h7QE6Yu4BPmPvARFk8AERZfEBEWbyARFn8wERaPUBEWn3AR5q-AE_a_wBEWz-AR5t_wFAboICEW-DAhFwhAIecYcCQXKIAkdzigIMdIsCDHWNAgx2jgIMd48CDHiRAgx5kwIeepQCSHuXAgx8mQIefZoCSX6cAgx_nQIMgAGeAh6BAaECSoIBogJOgwGjAg-EAaQCD4UBpQIPhgGmAg-HAacCD4gBqQIPiQGrAh6KAawCT4sBrwIPjAGxAh6NAbICUI4BtAIPjwG1Ag-QAbYCHpEBuQJRkgG6AleTAbsCFJQBvAIUlQG9AhSWAb4CFJcBvwIUmAHBAhSZAcMCHpoBxAJYmwHHAhScAckCHp0BygJZngHMAhSfAc0CFKABzgIeoQHRAlqiAdICYKMB0wIcpAHUAhylAdUCHKYB1gIcpwHXAhyoAdkCHKkB2wIeqgHcAmGrAd8CHKwB4QIerQHiAmKuAeQCHK8B5QIcsAHmAh6xAekCY7IB6gJpswHrAhm0AewCGbUB7QIZtgHuAhm3Ae8CGbgB8QIZuQHzAh66AfQCarsB9wIZvAH5Ah69AfoCa74B_AIZvwH9AhnAAf4CHsEBgQNswgGCA3DDAYMDE8QBhAMTxQGFAxPGAYYDE8cBhwMTyAGJAxPJAYsDHsoBjANxywGQAxPMAZIDHs0BkwNyzgGWAxPPAZcDE9ABmAMe0QGbA3PSAZwDedMBnQMS1AGeAxLVAZ8DEtYBoAMS1wGhAxLYAaMDEtkBpQMe2gGmA3rbAakDEtwBqwMe3QGsA3veAa4DEt8BrwMS4AGwAx7hAbMDfOIBtAOCAeMBtQMW5AG2AxblAbcDFuYBuAMW5wG5AxboAbsDFukBvQMe6gG-A4MB6wHCAxbsAcQDHu0BxQOEAe4ByAMW7wHJAxbwAcoDHvEBzQOFAfIBzgOLAfMBzwMN9AHQAw31AdEDDfYB0gMN9wHTAw34AdUDDfkB1wMe-gHYA4wB-wHaAw38AdwDHv0B3QONAf4B3gMN_wHfAw2AAuADHoEC4wOOAYIC5AOUAYMC5QMJhALmAwmFAucDCYYC6AMJhwLpAwmIAusDCYkC7QMeigLuA5UBiwLwAwmMAvIDHo0C8wOWAY4C9AMJjwL1AwmQAvYDHpEC-QOXAZIC-gOdAZMC-wMIlAL8AwiVAv0DCJYC_gMIlwL_AwiYAoEECJkCgwQemgKEBJ4BmwKGBAicAogEHp0CiQSfAZ4CigQInwKLBAigAowEHqECjwSgAaICkASmAaMCkQQHpAKSBAelApMEB6YClAQHpwKVBAeoApcEB6kCmQQeqgKaBKcBqwKcBAesAp4EHq0CnwSoAa4CoAQHrwKhBAewAqIEHrECpQSpAbICpgSvAbMCpwQFtAKoBAW1AqkEBbYCqgQFtwKrBAW4Aq0EBbkCrwQeugKwBLABuwKzBAW8ArUEHr0CtgSxAb4CuAQFvwK5BAXAAroEHsECvQSyAcICvgS4AcMCvwQaxALABBrFAsEEGsYCwgQaxwLDBBrIAsUEGskCxwQeygLIBLkBywLKBBrMAswEHs0CzQS6Ac4CzgQazwLPBBrQAtAEHtEC0wS7AdIC1AS_AQ"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/config/prisma.ts
var envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/repositories/branchRepo.ts
var BranchRepository = class {
  async getAllBranches() {
    return await prisma.branches.findMany();
  }
  async getBranchById(id) {
    return await prisma.branches.findUnique({
      where: { id }
    });
  }
  async createBranch(data) {
    return await prisma.branches.create({
      data
    });
  }
  async updateBranch(id, data) {
    return await prisma.branches.update({
      where: { id },
      data
    });
  }
  async deleteBranch(id) {
    return await prisma.branches.delete({ where: { id } });
  }
  async getValidatingInformation() {
    return await prisma.branches.findMany({
      select: {
        id: true,
        email: true,
        phone: true
      }
    });
  }
};
var branchRepo_default = new BranchRepository();

// src/middlewares/validateData.ts
var Validator = class {
  error;
  constructor() {
    this.error = [];
  }
  pushError(message) {
    this.error.push(message);
  }
  clearError() {
    let result = this.error.length + " validation error(s): " + this.error.join("; ");
    this.error = [];
    return result;
  }
  isEmpty(typeOfData, data) {
    if (data === void 0 || data === null || data === "") {
      this.error.push(`${typeOfData} is required`);
      return true;
    }
    return false;
  }
  isNumber(typeOfData, data) {
    if (isNaN(data)) {
      this.error.push(`${typeOfData} must be a number`);
      return false;
    }
    return true;
  }
  validateEmail(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data)) {
      this.error.push("Invalid email format");
      return false;
    }
    return true;
  }
  validatePhoneNumber(data) {
    const phoneRegex = /^0+\d{9}$/;
    if (!phoneRegex.test(data)) {
      this.error.push("Invalid phone number format");
      return false;
    }
    return true;
  }
  validateDate(data) {
    const date = new Date(data);
    if (isNaN(date.getTime())) {
      this.error.push("Invalid date format");
      return false;
    }
    return true;
  }
  validatePassword(data) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(data)) {
      this.error.push("Invalid password format");
      return false;
    }
    return true;
  }
  validateDiscountType(data) {
    const validTypes = ["percentage", "fixed_amount"];
    if (!validTypes.includes(data)) {
      this.error.push("Invalid discount type");
      return false;
    }
    return true;
  }
  validateRoomStatus(data) {
    const validStatuses = ["available", "unavailable", "occupied", "cleaning", "maintenance"];
    if (!validStatuses.includes(data)) {
      this.error.push("Invalid room status");
      return false;
    }
    return true;
  }
  validateDateOrder(startDate, endDate) {
    if (startDate === void 0 && endDate === void 0) {
      return true;
    } else if (endDate !== void 0) {
      const end = new Date(endDate);
      if (startDate !== void 0) {
        const start2 = new Date(startDate);
        if (isNaN(start2.getTime()) || isNaN(end.getTime())) {
          this.error.push("Invalid date format");
        }
        if (start2 >= end) {
          this.error.push("Start date must be before end date");
        }
        return true;
      }
      const start = /* @__PURE__ */ new Date();
      if (isNaN(end.getTime())) {
        this.error.push("Invalid date format");
      }
      if (start >= end) {
        this.error.push("Start date must be before end date");
      }
      return true;
    }
    return true;
  }
  isDecimal(typeOfData, data) {
    if (data === void 0 || data === null) {
      return true;
    }
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    if (!decimalRegex.test(String(data))) {
      this.error.push(`${typeOfData} must be a valid decimal number`);
      return false;
    }
    return true;
  }
  isBoolean(typeOfData, data) {
    if (data === void 0 || data === null) {
      return true;
    }
    if (typeof data !== "boolean") {
      this.error.push(`${typeOfData} must be a boolean`);
      return false;
    }
    return true;
  }
  isArray(typeOfData, data) {
    if (data === void 0 || data === null) {
      return true;
    }
    if (!Array.isArray(data)) {
      this.error.push(`${typeOfData} must be an array`);
      return false;
    }
    return true;
  }
  isString(typeOfData, data) {
    if (data === void 0 || data === null) {
      return true;
    }
    if (typeof data !== "string") {
      this.error.push(`${typeOfData} must be a string`);
      return false;
    }
    return true;
  }
  isUUID(typeOfData, data) {
    if (data === void 0 || data === null) {
      return true;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(String(data))) {
      this.error.push(`${typeOfData} must be a valid UUID`);
      return false;
    }
    return true;
  }
  minLength(typeOfData, data, minLength) {
    if (data === void 0 || data === null || data === "") {
      return true;
    }
    if (String(data).length < minLength) {
      this.error.push(`${typeOfData} must be at least ${minLength} characters`);
      return false;
    }
    return true;
  }
  maxLength(typeOfData, data, maxLength) {
    if (data === void 0 || data === null || data === "") {
      return true;
    }
    if (String(data).length > maxLength) {
      this.error.push(`${typeOfData} must not exceed ${maxLength} characters`);
      return false;
    }
    return true;
  }
  isPositiveNumber(typeOfData, data) {
    if (data === void 0 || data === null) {
      return true;
    }
    if (isNaN(data) || Number(data) <= 0) {
      this.error.push(`${typeOfData} must be a positive number`);
      return false;
    }
    return true;
  }
  isNonNegativeNumber(typeOfData, data) {
    if (data === void 0 || data === null) {
      return true;
    }
    if (isNaN(data) || Number(data) < 0) {
      this.error.push(`${typeOfData} must be a non-negative number`);
      return false;
    }
    return true;
  }
  validateEnum(typeOfData, data, validValues) {
    if (data === void 0 || data === null || data === "") {
      return true;
    }
    if (!validValues.includes(data)) {
      this.error.push(`${typeOfData} must be one of: ${validValues.join(", ")}`);
      return false;
    }
    return true;
  }
  validateAccountRole(data) {
    const validRoles = ["customer", "staff", "manager", "admin"];
    return this.validateEnum("Account role", data, validRoles);
  }
  validateAccountStatus(data) {
    const validStatuses = ["active", "inactive"];
    return this.validateEnum("Account status", data, validStatuses);
  }
  validateBookingStatus(data) {
    const validStatuses = ["pending", "confirmed", "checked_in", "checked_out", "completed", "cancelled"];
    return this.validateEnum("Booking status", data, validStatuses);
  }
  validateBookingType(data) {
    const validTypes = ["daily", "hourly"];
    return this.validateEnum("Booking type", data, validTypes);
  }
  validateCancellationStatus(data) {
    const validStatuses = ["pending", "confirmed", "failed"];
    return this.validateEnum("Cancellation status", data, validStatuses);
  }
  validatePaymentMethod(data) {
    const validMethods = ["cash", "bank_transfer", "online"];
    return this.validateEnum("Payment method", data, validMethods);
  }
  validatePaymentStatus(data) {
    const validStatuses = ["pending", "paid", "refunded", "failed"];
    return this.validateEnum("Payment status", data, validStatuses);
  }
};
var ValidationError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};

// src/services/branchServices.ts
var BranchService = class {
  async getAllBranches() {
    return await branchRepo_default.getAllBranches();
  }
  async getBranchById(id) {
    return await branchRepo_default.getBranchById(id);
  }
  async createBranch(data) {
    const validatedData = {
      ...data.name && { name: data.name },
      ...data.address && { address: data.address },
      ...data.city && { city: data.city },
      ...data.phone && { phone: data.phone },
      ...data.email && { email: data.email },
      ...data.description && { description: data.description },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (validator.isEmpty("Name", validatedData.name))
      throw new ValidationError("400", "Name is required");
    if (validator.isEmpty("Address", validatedData.address))
      throw new ValidationError("400", "Address is required");
    validator.isString("Name", validatedData.name);
    validator.isString("Address", validatedData.address);
    validator.maxLength("Name", validatedData.name, 150);
    validator.maxLength("Address", validatedData.address, 255);
    if (validatedData.city) {
      validator.isString("City", validatedData.city);
      validator.maxLength("City", validatedData.city, 100);
    }
    if (validatedData.email) {
      validator.validateEmail(validatedData.email);
      validator.maxLength("Email", validatedData.email, 150);
    }
    if (validatedData.phone) {
      validator.validatePhoneNumber(validatedData.phone);
      validator.maxLength("Phone", validatedData.phone, 20);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const validatingInfo = await branchRepo_default.getValidatingInformation();
    const emailExists = validatingInfo.some((branch) => branch.email === validatedData.email);
    const phoneExists = validatingInfo.some((branch) => branch.phone === validatedData.phone);
    if (emailExists) {
      validator.pushError("Email already exists");
    }
    if (phoneExists) {
      validator.pushError("Phone number already exists");
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await branchRepo_default.createBranch(validatedData);
  }
  async updateBranch(id, data) {
    const validator = new Validator();
    const validatedData = {
      ...data.name && { name: data.name },
      ...data.address && { address: data.address },
      ...data.city && { city: data.city },
      ...data.phone && { phone: data.phone },
      ...data.email && { email: data.email },
      ...data.description && { description: data.description },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    if (validatedData.name) {
      validator.isString("Name", validatedData.name);
      validator.maxLength("Name", validatedData.name, 150);
    }
    if (validatedData.address) {
      validator.isString("Address", validatedData.address);
      validator.maxLength("Address", validatedData.address, 255);
    }
    if (validatedData.city) {
      validator.isString("City", validatedData.city);
      validator.maxLength("City", validatedData.city, 100);
    }
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
    }
    if (validatedData.email) {
      validator.validateEmail(validatedData.email);
      validator.maxLength("Email", validatedData.email, 150);
    }
    if (validatedData.phone) {
      validator.validatePhoneNumber(validatedData.phone);
      validator.maxLength("Phone", validatedData.phone, 20);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const validatingInfo = await branchRepo_default.getValidatingInformation();
    const idExists = validatingInfo.some((branch) => branch.id === id);
    const emailExists = validatingInfo.some((branch) => branch.email === validatedData.email && branch.id !== id);
    const phoneExists = validatingInfo.some((branch) => branch.phone === validatedData.phone && branch.id !== id);
    if (!idExists) {
      throw new ValidationError("404", "Branch not found");
    }
    if (emailExists) {
      validator.pushError("Email already exists");
    }
    if (phoneExists) {
      validator.pushError("Phone number already exists");
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await branchRepo_default.updateBranch(id, validatedData);
  }
  async deleteBranch(id) {
    return await branchRepo_default.deleteBranch(id);
  }
};
var branchServices_default = new BranchService();

// src/controllers/branchController.ts
var BranchController = class {
  async getAllBranches(req, res) {
    return await branchServices_default.getAllBranches().then((branches) => res.status(200).json(branches)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getBranchById(req, res) {
    const { id } = req.params;
    return await branchServices_default.getBranchById(id).then((branch) => {
      if (!branch) {
        return res.status(404).json({ error: "Branch not found" });
      }
      res.status(200).json(branch);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async createBranch(req, res) {
    const { name, address, city, phone, email, description, is_active } = req.body;
    const data = { name, address, city, phone, email, description, is_active };
    return await branchServices_default.createBranch(data).then((createdBranch) => res.status(201).json(createdBranch)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateBranch(req, res) {
    const { id } = req.params;
    const { name, address, city, phone, email, description, is_active } = req.body;
    const data = { name, address, city, phone, email, description, is_active };
    return await branchServices_default.updateBranch(id, data).then((updatedBranch) => res.status(200).json(updatedBranch)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteBranch(req, res) {
    const { id } = req.params;
    return await branchServices_default.deleteBranch(id).then((deletedBranch) => res.status(200).json(deletedBranch)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Branch not found" });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var branchController_default = new BranchController();

// src/routes/branchRoutes.ts
var router = express.Router();
router.get("/", branchController_default.getAllBranches);
router.get("/:id", branchController_default.getBranchById);
router.post("/", branchController_default.createBranch);
router.put("/:id", branchController_default.updateBranch);
router.delete("/:id", branchController_default.deleteBranch);
var branchRoutes_default = router;

// src/routes/roomTypeRoutes.ts
import express2 from "express";

// src/repositories/roomTypeRepo.ts
var RoomTypeRepository = class {
  async getAllRoomTypes() {
    return await prisma.room_types.findMany({
      include: {
        branches: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async getRoomTypeById(id) {
    return await prisma.room_types.findUnique({
      where: { id },
      include: {
        branches: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async getRoomTypesByBranchId(branchId) {
    return await prisma.room_types.findMany({
      where: { branch_id: branchId },
      include: {
        branches: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async createRoomType(data) {
    return await prisma.room_types.create({
      data
    });
  }
  async updateRoomType(id, data) {
    return await prisma.room_types.update({
      where: { id },
      data
    });
  }
  async deleteRoomType(id) {
    return await prisma.room_types.delete({ where: { id } });
  }
};
var roomTypeRepo_default = new RoomTypeRepository();

// src/services/roomTypeServices.ts
var RoomTypeService = class {
  async getAllRoomTypes() {
    return await roomTypeRepo_default.getAllRoomTypes();
  }
  async getRoomTypeById(id) {
    return await roomTypeRepo_default.getRoomTypeById(id);
  }
  async getRoomTypesByBranchId(branchId) {
    const validator = new Validator();
    if (validator.isUUID("Branch ID", branchId)) {
      const branchExists = await branchRepo_default.getBranchById(branchId);
      if (!branchExists) {
        throw new ValidationError("400", "Invalid branch ID");
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await roomTypeRepo_default.getRoomTypesByBranchId(branchId);
  }
  async createRoomType(data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.name && { name: data.name },
      ...data.description && { description: data.description },
      ...data.max_guests && { max_guests: data.max_guests },
      ...data.images && { images: data.images },
      ...data.is_active && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Branch ID", validatedData.branch_id))
      validator.isUUID("Branch ID", validatedData.branch_id);
    if (!validator.isEmpty("Name", validatedData.name))
      validator.isString("Name", validatedData.name);
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
    }
    if (validatedData.max_guests) {
      validator.isPositiveNumber("Max Guests", validatedData.max_guests);
    }
    if (validatedData.images) {
      validator.isArray("Images", validatedData.images);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
    if (!branchExists) {
      throw new ValidationError("400", "Invalid branch ID");
    }
    return await roomTypeRepo_default.createRoomType(validatedData);
  }
  async updateRoomType(id, data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.name && { name: data.name },
      ...data.description && { description: data.description },
      ...data.max_guests && { max_guests: data.max_guests },
      ...data.images && { images: data.images },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (validatedData.branch_id) {
      if (validator.isUUID("Branch ID", validatedData.branch_id)) {
        const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
        if (!branchExists) {
          validator.pushError("Invalid branch ID");
        }
      }
    }
    if (validatedData.name) {
      validator.isString("Name", validatedData.name);
    }
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
    }
    if (validatedData.max_guests) {
      validator.isPositiveNumber("Max Guests", validatedData.max_guests);
    }
    if (validatedData.images) {
      validator.isArray("Images", validatedData.images);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const existingRoomType = await roomTypeRepo_default.getRoomTypeById(id);
    if (!existingRoomType) {
      throw new ValidationError("404", "Room type not found");
    }
    return await roomTypeRepo_default.updateRoomType(id, validatedData);
  }
  async deleteRoomType(id) {
    return await roomTypeRepo_default.deleteRoomType(id);
  }
};
var roomTypeServices_default = new RoomTypeService();

// src/controllers/roomTypeController.ts
var RoomTypeController = class {
  async getAllRoomTypes(req, res) {
    return await roomTypeServices_default.getAllRoomTypes().then((roomTypes) => res.status(200).json(roomTypes)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getRoomTypeById(req, res) {
    const { id } = req.params;
    return await roomTypeServices_default.getRoomTypeById(id).then((roomType) => {
      if (!roomType) {
        return res.status(404).json({ error: "Room type not found" });
      }
      res.status(200).json(roomType);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getRoomTypesByBranchId(req, res) {
    const { id } = req.params;
    return await roomTypeServices_default.getRoomTypesByBranchId(id).then((roomTypes) => res.status(200).json(roomTypes)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createRoomType(req, res) {
    const { branch_id, name, description, max_guests, images, is_active } = req.body;
    const data = { branch_id, name, description, max_guests, images, is_active };
    return await roomTypeServices_default.createRoomType(data).then((createdRoomType) => res.status(201).json(createdRoomType)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateRoomType(req, res) {
    const { id } = req.params;
    const { branch_id, name, description, max_guests, images, is_active } = req.body;
    const data = { branch_id, name, description, max_guests, images, is_active };
    return await roomTypeServices_default.updateRoomType(id, data).then((updatedRoomType) => res.status(200).json(updatedRoomType)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteRoomType(req, res) {
    const { id } = req.params;
    return await roomTypeServices_default.deleteRoomType(id).then((deletedRoomType) => res.status(200).json(deletedRoomType)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var roomTypeController_default = new RoomTypeController();

// src/routes/roomTypeRoutes.ts
var router2 = express2.Router();
router2.get("/branch/:id", roomTypeController_default.getRoomTypesByBranchId);
router2.get("/", roomTypeController_default.getAllRoomTypes);
router2.get("/:id", roomTypeController_default.getRoomTypeById);
router2.post("/", roomTypeController_default.createRoomType);
router2.put("/:id", roomTypeController_default.updateRoomType);
router2.delete("/:id", roomTypeController_default.deleteRoomType);
var roomTypeRoutes_default = router2;

// src/routes/roomRoutes.ts
import express3 from "express";

// src/repositories/roomRepo.ts
var RoomRepository = class {
  async getAllRooms() {
    return await prisma.rooms.findMany({
      include: {
        branches: {
          select: {
            name: true
          }
        },
        room_types: true
      }
    });
  }
  async getRoomsByBranchId(id) {
    return await prisma.rooms.findMany({
      where: {
        branch_id: id
      },
      include: {
        branches: {
          select: {
            name: true
          }
        },
        room_types: true
      }
    });
  }
  async getRoomById(id) {
    return await prisma.rooms.findUnique({
      where: { id },
      include: {
        branches: {
          select: {
            name: true
          }
        },
        room_types: true
      }
    });
  }
  async createRoom(data) {
    return await prisma.rooms.create({ data });
  }
  async updateRoom(id, data) {
    return await prisma.rooms.update({
      where: { id },
      data,
      include: {
        branches: {
          select: {
            name: true
          }
        },
        room_types: true
      }
    });
  }
  async deleteRoom(id) {
    return await prisma.rooms.delete({ where: { id } });
  }
};
var roomRepo_default = new RoomRepository();

// src/services/roomServices.ts
var RoomService = class {
  async getAllRooms() {
    return await roomRepo_default.getAllRooms();
  }
  async getRoomsByBranchId(id) {
    const allRooms = await roomRepo_default.getAllRooms();
    return allRooms.filter((room) => room.branch_id === id);
  }
  async getRoomById(id) {
    return await roomRepo_default.getRoomById(id);
  }
  async createRoom(data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id.trim() },
      ...data.room_type_id && { room_type_id: data.room_type_id.trim() },
      ...data.room_number && { room_number: data.room_number.trim() },
      ...data.floor && { floor: data.floor },
      ...data.basic && { basic: data.basic },
      ...data.extra && { extra: data.extra },
      ...data.status && { status: data.status.trim() },
      ...data.notes && { notes: data.notes.trim() },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Branch ID", validatedData.branch_id))
      validator.isUUID("Branch ID", validatedData.branch_id);
    if (!validator.isEmpty("Room Type ID", validatedData.room_type_id))
      validator.isUUID("Room Type ID", validatedData.room_type_id);
    if (!validator.isEmpty("Room Number", validatedData.room_number))
      validator.isString("Room Number", validatedData.room_number);
    if (!validator.isEmpty("Status", validatedData.status))
      validator.validateRoomStatus(validatedData.status);
    if (validatedData.floor) {
      validator.isNonNegativeNumber("Floor", validatedData.floor);
    }
    if (validatedData.basic) {
      validator.isArray("Basic", validatedData.basic);
    }
    if (validatedData.extra) {
      validator.isArray("Extra", validatedData.extra);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const branches = await branchRepo_default.getBranchById(validatedData.branch_id);
    if (!branches) {
      throw new ValidationError("400", "Invalid branch ID");
    }
    const roomTypes = await roomTypeRepo_default.getRoomTypeById(validatedData.room_type_id);
    if (!roomTypes) {
      throw new ValidationError("400", "Invalid room type ID");
    }
    return await roomRepo_default.createRoom(data);
  }
  async updateRoom(id, data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.room_type_id && { room_type_id: data.room_type_id },
      ...data.room_number && { room_number: data.room_number },
      ...data.floor && { floor: data.floor },
      ...data.basic && { basic: data.basic },
      ...data.extra && { extra: data.extra },
      ...data.status && { status: data.status },
      ...data.notes && { notes: data.notes },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (validatedData.branch_id) {
      validator.isUUID("Branch ID", validatedData.branch_id);
    }
    if (validatedData.room_type_id) {
      validator.isUUID("Room Type ID", validatedData.room_type_id);
    }
    if (validatedData.room_number) {
      validator.isString("Room Number", validatedData.room_number);
      validator.maxLength("Room Number", validatedData.room_number, 20);
    }
    if (validatedData.floor !== void 0) {
      validator.isNonNegativeNumber("Floor", validatedData.floor);
    }
    if (validatedData.status) {
      validator.validateRoomStatus(validatedData.status);
    }
    if (validatedData.basic) {
      validator.isArray("Basic", validatedData.basic);
    }
    if (validatedData.extra) {
      validator.isArray("Extra", validatedData.extra);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const existingRoom = await roomRepo_default.getRoomById(id);
    if (!existingRoom) {
      throw new ValidationError("404", "Room not found");
    }
    return await roomRepo_default.updateRoom(id, validatedData);
  }
  async deleteRoom(id) {
    return await roomRepo_default.deleteRoom(id);
  }
};
var roomServices_default = new RoomService();

// src/controllers/roomController.ts
var RoomController = class {
  async getAllRooms(req, res) {
    return await roomServices_default.getAllRooms().then((rooms) => res.status(200).json(rooms)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getRoomsByBranchId(req, res) {
    const { branchId } = req.params;
    return await roomServices_default.getRoomsByBranchId(branchId).then((rooms) => res.status(200).json(rooms)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getRoomById(req, res) {
    const { id } = req.params;
    return await roomServices_default.getRoomById(id).then((room) => {
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.status(200).json(room);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async createRoom(req, res) {
    const { branch_id, room_type_id, room_number, floor, basic, extra, status, notes, is_active } = req.body;
    const data = { branch_id, room_type_id, room_number, floor, basic, extra, status, notes, is_active };
    return await roomServices_default.createRoom(data).then((createdRoom) => res.status(201).json(createdRoom)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateRoom(req, res) {
    const { id } = req.params;
    const { branch_id, room_type_id, room_number, floor, basic, extra, status, notes, is_active } = req.body;
    const data = { branch_id, room_type_id, room_number, floor, basic, extra, status, notes, is_active };
    return await roomServices_default.updateRoom(id, data).then((updatedRoom) => res.status(200).json(updatedRoom)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteRoom(req, res) {
    const { id } = req.params;
    return await roomServices_default.deleteRoom(id).then((deletedRoom) => res.status(200).json(deletedRoom)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var roomController_default = new RoomController();

// src/routes/roomRoutes.ts
var router3 = express3.Router();
router3.get("/branch/:id", roomController_default.getRoomsByBranchId);
router3.get("/", roomController_default.getAllRooms);
router3.get("/:id", roomController_default.getRoomById);
router3.post("/", roomController_default.createRoom);
router3.put("/:id", roomController_default.updateRoom);
router3.delete("/:id", roomController_default.deleteRoom);
var roomRoutes_default = router3;

// src/routes/roomPriceRoutes.ts
import express4 from "express";

// src/repositories/roomPriceRepo.ts
var RoomPriceRepository = class {
  async getAllRoomPrices() {
    return await prisma.room_prices.findMany({
      include: {
        room_types: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async getRoomPriceById(id) {
    return await prisma.room_prices.findUnique({
      where: { id },
      include: {
        room_types: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async getRoomPricesByRoomTypeId(id) {
    return await prisma.room_prices.findFirst({
      where: { room_type_id: id },
      include: {
        room_types: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async createRoomPrice(data) {
    return await prisma.room_prices.create({ data });
  }
  async updateRoomPrice(id, data) {
    return await prisma.room_prices.update({ where: { id }, data });
  }
  async deleteRoomPrice(id) {
    return await prisma.room_prices.delete({ where: { id } });
  }
  async getValidatingInformation() {
    return await prisma.room_prices.findMany({
      select: {
        id: true,
        room_type_id: true,
        include: {
          room_types: {
            select: {
              name: true
            }
          }
        }
      }
    });
  }
};
var roomPriceRepo_default = new RoomPriceRepository();

// src/services/roomPriceServices.ts
var RoomPriceService = class {
  async getAllRoomPrices() {
    return await roomPriceRepo_default.getAllRoomPrices();
  }
  async getRoomPricesByRoomTypeId(id) {
    const roomPrice = await roomPriceRepo_default.getRoomPricesByRoomTypeId(id);
    if (!roomPrice) {
      throw new ValidationError("404", "Room price not found for the given room type ID");
    }
    return roomPrice;
  }
  async getRoomPriceById(id) {
    const roomPrice = await roomPriceRepo_default.getRoomPriceById(id);
    if (!roomPrice) {
      throw new ValidationError("404", "Room price not found");
    }
    return roomPrice;
  }
  async createRoomPrice(data) {
    const validatedData = {
      ...data.room_type_id && { room_type_id: data.room_type_id.trim() },
      ...data.price_per_day && { price_per_day: data.price_per_day },
      ...data.price_per_hour && { price_per_hour: data.price_per_hour },
      ...data.weekend_rate && { weekend_rate: data.weekend_rate },
      ...data.holiday_rate && { holiday_rate: data.holiday_rate },
      ...data.effective_from && { effective_from: data.effective_from.trim() },
      ...data.effective_to && { effective_to: data.effective_to.trim() }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Room Type ID", validatedData.room_type_id))
      validator.isUUID("Room Type ID", validatedData.room_type_id);
    if (validatedData.price_per_day) {
      validator.isDecimal("Price Per Day", validatedData.price_per_day);
      validator.isNonNegativeNumber("Price Per Day", validatedData.price_per_day);
    }
    if (validatedData.price_per_hour) {
      validator.isDecimal("Price Per Hour", validatedData.price_per_hour);
      validator.isNonNegativeNumber("Price Per Hour", validatedData.price_per_hour);
    }
    if (validatedData.weekend_rate) {
      validator.isDecimal("Weekend Rate", validatedData.weekend_rate);
      validator.isNonNegativeNumber("Weekend Rate", validatedData.weekend_rate);
    }
    if (validatedData.holiday_rate) {
      validator.isDecimal("Holiday Rate", validatedData.holiday_rate);
      validator.isNonNegativeNumber("Holiday Rate", validatedData.holiday_rate);
    }
    if (validatedData.effective_from && validatedData.effective_to) {
      if (validator.validateDateOrder(validatedData.effective_from, validatedData.effective_to)) {
        validatedData.effective_from = new Date(validatedData.effective_from);
        validatedData.effective_to = new Date(validatedData.effective_to);
      }
    } else if (validatedData.effective_from) {
      if (validator.validateDate(validatedData.effective_from)) {
        validatedData.effective_from = new Date(validatedData.effective_from);
      }
    } else if (validatedData.effective_to) {
      if (validator.validateDate(validatedData.effective_to)) {
        validatedData.effective_to = new Date(validatedData.effective_to);
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const roomTypeExists = await roomTypeRepo_default.getRoomTypeById(validatedData.room_type_id);
    if (!roomTypeExists) {
      throw new ValidationError("400", "Room type ID not found");
    }
    return await roomPriceRepo_default.createRoomPrice(validatedData);
  }
  async updateRoomPrice(id, data) {
    const validatedData = {
      ...data.price_per_day && { price_per_day: data.price_per_day },
      ...data.price_per_hour && { price_per_hour: data.price_per_hour },
      ...data.weekend_rate && { weekend_rate: data.weekend_rate },
      ...data.holiday_rate && { holiday_rate: data.holiday_rate },
      ...data.effective_from && { effective_from: data.effective_from.trim() },
      ...data.effective_to && { effective_to: data.effective_to.trim() }
    };
    const validator = new Validator();
    if (validatedData.price_per_day) {
      validator.isDecimal("Price Per Day", validatedData.price_per_day);
      validator.isNonNegativeNumber("Price Per Day", validatedData.price_per_day);
    }
    if (validatedData.price_per_hour) {
      validator.isDecimal("Price Per Hour", validatedData.price_per_hour);
      validator.isNonNegativeNumber("Price Per Hour", validatedData.price_per_hour);
    }
    if (validatedData.weekend_rate) {
      validator.isDecimal("Weekend Rate", validatedData.weekend_rate);
      validator.isNonNegativeNumber("Weekend Rate", validatedData.weekend_rate);
    }
    if (validatedData.holiday_rate) {
      validator.isDecimal("Holiday Rate", validatedData.holiday_rate);
      validator.isNonNegativeNumber("Holiday Rate", validatedData.holiday_rate);
    }
    if (validatedData.effective_from && validatedData.effective_to) {
      if (validator.validateDateOrder(validatedData.effective_from, validatedData.effective_to)) {
        validatedData.effective_from = new Date(validatedData.effective_from);
        validatedData.effective_to = new Date(validatedData.effective_to);
      }
    } else if (validatedData.effective_from) {
      if (validator.validateDate(validatedData.effective_from)) {
        validatedData.effective_from = new Date(validatedData.effective_from);
      }
    } else if (validatedData.effective_to) {
      if (validator.validateDate(validatedData.effective_to)) {
        validatedData.effective_to = new Date(validatedData.effective_to);
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const roomPriceExists = await roomPriceRepo_default.getRoomPriceById(id);
    if (!roomPriceExists) {
      throw new ValidationError("400", "Room price not found");
    }
    return await roomPriceRepo_default.updateRoomPrice(id, validatedData);
  }
  async deleteRoomPrice(id) {
    return await roomPriceRepo_default.deleteRoomPrice(id);
  }
};
var roomPriceServices_default = new RoomPriceService();

// src/controllers/roomPriceController.ts
var RoomPriceController = class {
  async getAllRoomPrices(req, res) {
    return await roomPriceServices_default.getAllRoomPrices().then((roomPrices) => res.status(200).json(roomPrices)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getRoomPricesByRoomTypeId(req, res) {
    const { id } = req.params;
    return await roomPriceServices_default.getRoomPricesByRoomTypeId(id).then((roomPrices) => res.status(200).json(roomPrices)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async getRoomPriceById(req, res) {
    const { id } = req.params;
    return await roomPriceServices_default.getRoomPriceById(id).then((roomPrice) => res.status(200).json(roomPrice)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createRoomPrice(req, res) {
    const { room_type_id, price_per_day, price_per_hour, weekend_rate, holiday_rate, effective_from, effective_to } = req.body;
    const data = { room_type_id, price_per_day, price_per_hour, weekend_rate, holiday_rate, effective_from, effective_to };
    return await roomPriceServices_default.createRoomPrice(data).then((createdRoomPrice) => res.status(201).json(createdRoomPrice)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateRoomPrice(req, res) {
    const { id } = req.params;
    const { room_type_id, price_per_day, price_per_hour, weekend_rate, holiday_rate, effective_from, effective_to } = req.body;
    const data = { room_type_id, price_per_day, price_per_hour, weekend_rate, holiday_rate, effective_from, effective_to };
    return await roomPriceServices_default.updateRoomPrice(id, data).then((updatedRoomPrice) => res.status(200).json(updatedRoomPrice)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteRoomPrice(req, res) {
    const { id } = req.params;
    return await roomPriceServices_default.deleteRoomPrice(id).then((deletedRoomPrice) => res.status(200).json(deletedRoomPrice)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var roomPriceController_default = new RoomPriceController();

// src/routes/roomPriceRoutes.ts
var router4 = express4.Router();
router4.get("/room-type/:id", roomPriceController_default.getRoomPricesByRoomTypeId);
router4.get("/", roomPriceController_default.getAllRoomPrices);
router4.get("/:id", roomPriceController_default.getRoomPriceById);
router4.post("/", roomPriceController_default.createRoomPrice);
router4.put("/:id", roomPriceController_default.updateRoomPrice);
router4.delete("/:id", roomPriceController_default.deleteRoomPrice);
var roomPriceRoutes_default = router4;

// src/routes/roomServiceRoutes.ts
import express5 from "express";

// src/repositories/roomServiceRepo.ts
var RoomServiceRepository = class {
  async getAllServices() {
    return await prisma.services.findMany({
      include: {
        branches: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async getServiceById(id) {
    return await prisma.services.findUnique({
      where: { id },
      include: {
        branches: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async createService(data) {
    return await prisma.services.create({ data });
  }
  async updateService(id, data) {
    return await prisma.services.update({ where: { id }, data });
  }
  async deleteService(id) {
    return await prisma.services.delete({ where: { id } });
  }
};
var roomServiceRepo_default = new RoomServiceRepository();

// src/services/roomServiceSerives.ts
var RoomServiceService = class {
  async getAllServices() {
    return await roomServiceRepo_default.getAllServices();
  }
  async getServiceById(id) {
    return await roomServiceRepo_default.getServiceById(id);
  }
  async createService(data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.name && { name: data.name },
      ...data.description && { description: data.description },
      ...data.price && { price: data.price },
      ...data.unit && { unit: data.unit },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Name", validatedData.name))
      validator.isString("Name", validatedData.name);
    if (!validator.isEmpty("Price", validatedData.price))
      validator.isDecimal("Price", validatedData.price);
    if (!validator.isEmpty("Unit", validatedData.unit))
      validator.isString("Unit", validatedData.unit);
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatedData.branch_id) {
      const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
      if (!branchExists) {
        throw new ValidationError("400", "Invalid branch ID or branch does not exist");
      }
    }
    return await roomServiceRepo_default.createService(validatedData);
  }
  async updateService(id, data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.name && { name: data.name },
      ...data.description && { description: data.description },
      ...data.price && { price: data.price },
      ...data.unit && { unit: data.unit },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (validatedData.name) {
      validator.isString("Name", validatedData.name);
    }
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
    }
    if (validatedData.price) {
      validator.isDecimal("Price", validatedData.price);
      validator.isPositiveNumber("Price", validatedData.price);
    }
    if (validatedData.unit) {
      validator.isString("Unit", validatedData.unit);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatedData.branch_id) {
      const branch = await branchRepo_default.getBranchById(validatedData.branch_id);
      if (!branch) {
        throw new ValidationError("400", "Invalid branch ID or branch does not exist");
      }
    }
    const serviceExists = await roomServiceRepo_default.getServiceById(id);
    if (!serviceExists) {
      throw new ValidationError("404", "Service not found");
    }
    return await roomServiceRepo_default.updateService(id, validatedData);
  }
  async deleteService(id) {
    return await roomServiceRepo_default.deleteService(id);
  }
};
var roomServiceSerives_default = new RoomServiceService();

// src/controllers/roomServiceController.ts
var RoomServiceController = class {
  async getAllServices(req, res) {
    return await roomServiceSerives_default.getAllServices().then((services) => res.status(200).json(services)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getServiceById(req, res) {
    const { id } = req.params;
    return await roomServiceSerives_default.getServiceById(id).then((service) => {
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.status(200).json(service);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async createService(req, res) {
    const { branch_id, name, description, price, unit, is_active } = req.body;
    const data = { branch_id, name, description, price, unit, is_active };
    return await roomServiceSerives_default.createService(data).then((createdService) => res.status(201).json(createdService)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateService(req, res) {
    const { id } = req.params;
    const { branch_id, name, description, price, unit, is_active } = req.body;
    const data = { branch_id, name, description, price, unit, is_active };
    return await roomServiceSerives_default.updateService(id, data).then((updatedService) => res.status(200).json(updatedService)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteService(req, res) {
    const { id } = req.params;
    return await roomServiceSerives_default.deleteService(id).then((deletedService) => res.status(200).json(deletedService)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var roomServiceController_default = new RoomServiceController();

// src/routes/roomServiceRoutes.ts
var router5 = express5.Router();
router5.get("/", roomServiceController_default.getAllServices);
router5.get("/:id", roomServiceController_default.getServiceById);
router5.post("/", roomServiceController_default.createService);
router5.put("/:id", roomServiceController_default.updateService);
router5.delete("/:id", roomServiceController_default.deleteService);
var roomServiceRoutes_default = router5;

// src/routes/discountRoutes.ts
import express6 from "express";

// src/repositories/discountRepo.ts
var DiscountRepository = class {
  async getAllDiscounts() {
    return await prisma.discounts.findMany({
      include: {
        branches: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async getDiscountById(id) {
    return await prisma.discounts.findUnique({
      where: { id },
      include: {
        branches: {
          select: {
            name: true
          }
        }
      }
    });
  }
  async createDiscount(data) {
    return await prisma.discounts.create({
      data
    });
  }
  async updateDiscount(id, data) {
    return await prisma.discounts.update({
      where: { id },
      data
    });
  }
  async deleteDiscount(id) {
    return await prisma.discounts.delete({
      where: { id }
    });
  }
};
var discountRepo_default = new DiscountRepository();

// src/services/discountServices.ts
var DiscountServices = class {
  async getAllDiscounts() {
    return await discountRepo_default.getAllDiscounts();
  }
  async getDiscountById(id) {
    return await discountRepo_default.getDiscountById(id);
  }
  async createDiscount(data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.code && { code: data.code },
      ...data.description && { description: data.description },
      ...data.discount_type && { discount_type: data.discount_type },
      ...data.discount_value && { discount_value: data.discount_value },
      ...data.min_order_value && { min_order_value: data.min_order_value },
      ...data.usage_limit && { usage_limit: data.usage_limit },
      ...data.valid_from && { valid_from: data.valid_from },
      ...data.valid_to && { valid_to: data.valid_to },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Code", validatedData.code)) {
      validator.isString("Code", validatedData.code);
    }
    if (!validator.isEmpty("Discount Type", validatedData.discount_type)) {
      validator.validateDiscountType(validatedData.discount_type);
    }
    if (validatedData.discount_value !== void 0) {
      validator.isDecimal("Discount Value", validatedData.discount_value);
      validator.isNonNegativeNumber("Discount Value", validatedData.discount_value);
    }
    if (validatedData.min_order_value !== void 0) {
      validator.isDecimal("Min Order Value", validatedData.min_order_value);
      validator.isNonNegativeNumber("Min Order Value", validatedData.min_order_value);
    }
    if (validatedData.usage_limit !== void 0) {
      validator.isPositiveNumber("Usage Limit", validatedData.usage_limit);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.validateDateOrder(validatedData.valid_from, validatedData.valid_to)) {
      if (new Date(validatedData.valid_from).getTime() < (/* @__PURE__ */ new Date()).getTime()) {
        validator.pushError("Valid From date cannot be in the past");
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatedData.branch_id) {
      const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
      if (!branchExists) {
        throw new ValidationError("400", "Invalid branch ID");
      }
    }
    return await discountRepo_default.createDiscount(validatedData);
  }
  async updateDiscount(id, data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.code && { code: data.code },
      ...data.description && { description: data.description },
      ...data.discount_type && { discount_type: data.discount_type },
      ...data.discount_value && { discount_value: data.discount_value },
      ...data.min_order_value && { min_order_value: data.min_order_value },
      ...data.usage_limit && { usage_limit: data.usage_limit },
      ...data.valid_from && { valid_from: data.valid_from },
      ...data.valid_to && { valid_to: data.valid_to },
      ...data.is_active !== void 0 && { is_active: data.is_active }
    };
    const validator = new Validator();
    if (validatedData.code) {
      validator.isString("Code", validatedData.code);
    }
    if (validatedData.discount_type) {
      validator.validateDiscountType(validatedData.discount_type);
    }
    if (validatedData.discount_value !== void 0) {
      validator.isDecimal("Discount Value", validatedData.discount_value);
      validator.isNonNegativeNumber("Discount Value", validatedData.discount_value);
    }
    if (validatedData.min_order_value !== void 0) {
      validator.isDecimal("Min Order Value", validatedData.min_order_value);
      validator.isNonNegativeNumber("Min Order Value", validatedData.min_order_value);
    }
    if (validatedData.usage_limit !== void 0) {
      validator.isPositiveNumber("Usage Limit", validatedData.usage_limit);
    }
    if (validatedData.is_active !== void 0) {
      validator.isBoolean("Is Active", validatedData.is_active);
    }
    if (validator.validateDateOrder(validatedData.valid_from, validatedData.valid_to)) {
      if (new Date(validatedData.valid_from).getTime() < (/* @__PURE__ */ new Date()).getTime()) {
        validator.pushError("Valid From date cannot be in the past");
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatedData.branch_id) {
      const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
      if (!branchExists) {
        throw new ValidationError("400", "Invalid branch ID");
      }
    }
    const existingDiscount = await discountRepo_default.getDiscountById(id);
    if (!existingDiscount) {
      throw new ValidationError("404", "Discount not found");
    }
    return await discountRepo_default.updateDiscount(id, validatedData);
  }
  async deleteDiscount(id) {
    return await discountRepo_default.deleteDiscount(id);
  }
};
var discountServices_default = new DiscountServices();

// src/controllers/discountController.ts
var DiscountController = class {
  async getAllDiscounts(req, res) {
    return await discountServices_default.getAllDiscounts().then((discounts) => res.status(200).json(discounts)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getDiscountById(req, res) {
    const { id } = req.params;
    return await discountServices_default.getDiscountById(id).then((discount) => {
      if (!discount) {
        return res.status(404).json({ error: "Discount not found" });
      }
      res.status(200).json(discount);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async createDiscount(req, res) {
    const { branch_id, code, description, discount_type, discount_value, min_order_value, usage_limit, valid_from, valid_to, is_active } = req.body;
    const data = { branch_id, code, description, discount_type, discount_value, min_order_value, usage_limit, valid_from, valid_to, is_active };
    return await discountServices_default.createDiscount(data).then((createdDiscount) => res.status(201).json(createdDiscount)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateDiscount(req, res) {
    const { id } = req.params;
    const { branch_id, code, description, discount_type, discount_value, min_order_value, usage_limit, valid_from, valid_to, is_active } = req.body;
    const data = { branch_id, code, description, discount_type, discount_value, min_order_value, usage_limit, valid_from, valid_to, is_active };
    return await discountServices_default.updateDiscount(id, data).then((updatedDiscount) => res.status(200).json(updatedDiscount)).catch(
      (error) => {
        if (error.code !== 500) {
          return res.status(parseInt(error.code)).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
      }
    );
  }
  async deleteDiscount(req, res) {
    const { id } = req.params;
    return await discountServices_default.deleteDiscount(id).then((deletedDiscount) => res.status(200).json(deletedDiscount)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var discountController_default = new DiscountController();

// src/routes/discountRoutes.ts
var router6 = express6.Router();
router6.get("/", discountController_default.getAllDiscounts);
router6.get("/:id", discountController_default.getDiscountById);
router6.post("/", discountController_default.createDiscount);
router6.put("/:id", discountController_default.updateDiscount);
router6.delete("/:id", discountController_default.deleteDiscount);
var discountRoutes_default = router6;

// src/routes/accountRoutes.ts
import express7 from "express";

// src/repositories/accountRepo.ts
var AccountRepository = class {
  async getAllAccounts() {
    return await prisma.accounts.findMany();
  }
  async getAccountById(id) {
    return await prisma.accounts.findUnique({
      where: { id }
    });
  }
  async getAccountByUsername(username) {
    return await prisma.accounts.findUnique({
      where: { username }
    });
  }
  async getAccountsByBranchId(branchId) {
    return await prisma.accounts.findMany({
      where: { branch_id: branchId }
    });
  }
  async createAccount(data) {
    return await prisma.accounts.create({
      data
    });
  }
  async updateAccount(id, data) {
    return await prisma.accounts.update({
      where: { id },
      data
    });
  }
  async deleteAccount(id) {
    return await prisma.accounts.delete({
      where: { id }
    });
  }
  async getValidatingInformation() {
    return await prisma.accounts.findMany({
      select: {
        id: true,
        username: true
      }
    });
  }
};
var accountRepo_default = new AccountRepository();

// src/services/accountServices.ts
import brcypt from "bcrypt";
var AccountService = class {
  async getAllAccounts() {
    return await accountRepo_default.getAllAccounts();
  }
  async getAccountByUsername(username) {
    const validator = new Validator();
    validator.isString("Username", username);
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await accountRepo_default.getAccountByUsername(username);
  }
  async getAccountById(id) {
    const validator = new Validator();
    validator.isUUID("Account ID", id);
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await accountRepo_default.getAccountById(id);
  }
  async createAccount(data) {
    const validatedData = {
      ...data.username && { username: data.username },
      ...data.password && { password_hash: data.password },
      ...data.role && { role: data.role },
      ...data.status && { status: data.status },
      ...data.branch_id && { branch_id: data.branch_id }
    };
    const validator = new Validator();
    if (validatedData.username) {
      validator.isEmpty("Username", validatedData.username);
    }
    if (validatedData.password_hash) {
      validator.isEmpty("Password", validatedData.password_hash);
      validator.validatePassword(validatedData.password_hash);
    }
    validator.isString("Username", validatedData.username);
    validator.maxLength("Username", validatedData.username, 200);
    if (validatedData.role) {
      validator.validateAccountRole(validatedData.role);
    }
    if (validatedData.status) {
      validator.validateAccountStatus(validatedData.status);
    }
    if (validatedData.branch_id) {
      validator.isUUID("Branch ID", validatedData.branch_id);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const existingAccount = await accountRepo_default.getAccountByUsername(validatedData.username);
    if (existingAccount) {
      throw new ValidationError("400", "Username already exists");
    }
    if (validatedData.branch_id) {
      const existingBranch = await branchRepo_default.getBranchById(validatedData.branch_id);
      if (!existingBranch) {
        throw new ValidationError("404", "Branch not found");
      }
    }
    validatedData.password_hash = await brcypt.hash(validatedData.password_hash, Number(process.env.SALT_ROUNDS) || 5);
    return await accountRepo_default.createAccount(validatedData);
  }
  async updateAccount(id, data) {
    const validatedData = {
      ...data.password && { password_hash: data.password },
      ...data.role && { role: data.role },
      ...data.status && { status: data.status },
      ...data.branch_id && { branch_id: data.branch_id }
    };
    const validator = new Validator();
    if (validatedData.password_hash) {
      validator.isString("Password Hash", validatedData.password_hash);
      validator.validatePassword(validatedData.password_hash);
      validatedData.password_hash = await brcypt.hash(validatedData.password_hash, Number(process.env.SALT_ROUNDS) || 5);
    }
    if (validatedData.role) {
      validator.validateAccountRole(validatedData.role);
    }
    if (validatedData.status) {
      validator.validateAccountStatus(validatedData.status);
    }
    if (validatedData.branch_id) {
      if (validator.isUUID("Branch ID", validatedData.branch_id)) {
        const existingBranch = await branchRepo_default.getBranchById(validatedData.branch_id);
        if (!existingBranch) {
          throw new ValidationError("404", "Branch not found");
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validator.isUUID("ID", id)) {
      const existingAccount = await accountRepo_default.getAccountById(id);
      if (!existingAccount) {
        throw new ValidationError("404", "Account not found");
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await accountRepo_default.updateAccount(id, validatedData);
  }
  async deleteAccount(id) {
    return await accountRepo_default.deleteAccount(id);
  }
};
var accountServices_default = new AccountService();

// src/controllers/accountController.ts
var AccountController = class {
  async getAllAccounts(req, res) {
    return await accountServices_default.getAllAccounts().then((accounts) => res.status(200).json(accounts)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getAccountByUsername(req, res) {
    const { username } = req.params;
    return await accountServices_default.getAccountByUsername(username).then((account) => {
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.status(200).json(account);
    }).catch((error) => {
      if (typeof parseInt(error.code) === "number")
        return res.status(parseInt(error.code)).json({ error: error.message });
      res.status(500).json({ error: error.message });
    });
  }
  async getAccountById(req, res) {
    const { id } = req.params;
    return await accountServices_default.getAccountById(id).then((account) => {
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.status(200).json(account);
    }).catch((error) => {
      if (typeof parseInt(error.code) === "number")
        return res.status(parseInt(error.code)).json({ error: error.message });
      res.status(500).json({ error: error.message });
    });
  }
  async createAccount(req, res) {
    const { username, password, role, status, branch_id } = req.body;
    const data = { username, password, role, status, branch_id };
    return await accountServices_default.createAccount(data).then((account) => res.status(201).json(account)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateAccount(req, res) {
    const { id } = req.params;
    const { password, role, status, branch_id } = req.body;
    const data = { password, role, status, branch_id };
    return await accountServices_default.updateAccount(id, data).then((account) => res.status(200).json(account)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteAccount(req, res) {
    const { id } = req.params;
    return await accountServices_default.deleteAccount(id).then((account) => res.status(200).json(account)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var accountController_default = new AccountController();

// src/routes/accountRoutes.ts
var router7 = express7.Router();
router7.get("/username/:username", accountController_default.getAccountByUsername);
router7.get("/", accountController_default.getAllAccounts);
router7.get("/:id", accountController_default.getAccountById);
router7.post("/", accountController_default.createAccount);
router7.put("/:id", accountController_default.updateAccount);
router7.delete("/:id", accountController_default.deleteAccount);
var accountRoutes_default = router7;

// src/routes/customerRoutes.ts
import express8 from "express";

// src/repositories/customerRepo.ts
var CustomerRepository = class {
  async getAllCustomers() {
    return await prisma.customers.findMany();
  }
  async getCustomerById(id) {
    return await prisma.customers.findUnique({
      where: { id }
    });
  }
  async getCustomerByAccountId(accountId) {
    return await prisma.customers.findUnique({
      where: { account_id: accountId }
    });
  }
  async createCustomer(data) {
    return await prisma.customers.create({
      data
    });
  }
  async updateCustomer(id, data) {
    return await prisma.customers.update({
      where: { id },
      data
    });
  }
  async deleteCustomer(id) {
    return await prisma.customers.delete({
      where: { id }
    });
  }
  async getValidatingInformation() {
    return await prisma.customers.findMany({
      select: {
        id: true,
        phone: true,
        email: true,
        id_card_number: true
      }
    });
  }
};
var customerRepo_default = new CustomerRepository();

// src/services/customerServices.ts
var CustomerService = class {
  async getAllCustomers() {
    return await customerRepo_default.getAllCustomers();
  }
  async getCustomerById(id) {
    return await customerRepo_default.getCustomerById(id);
  }
  async createCustomer(data) {
    const validatedData = {
      ...data.account_id && { account_id: data.account_id.trim() },
      ...data.full_name && { full_name: data.full_name.trim() },
      ...data.phone && { phone: data.phone.trim() },
      ...data.email && { email: data.email.trim() },
      ...data.id_card_number && { id_card_number: data.id_card_number.trim() },
      ...data.nationality && { nationality: data.nationality.trim() },
      ...data.date_of_birth && { date_of_birth: data.date_of_birth },
      ...data.address && { address: data.address.trim() }
    };
    const validator = new Validator();
    if (validator.isEmpty("Full Name", validatedData.full_name))
      throw new ValidationError("400", "Full Name is required");
    validator.isString("Full Name", validatedData.full_name);
    if (validatedData.email) {
      validator.validateEmail(validatedData.email);
    }
    if (validatedData.phone) {
      validator.validatePhoneNumber(validatedData.phone);
    }
    if (validatedData.id_card_number) {
      validator.isString("ID Card Number", validatedData.id_card_number);
    }
    if (validatedData.nationality) {
      validator.isString("Nationality", validatedData.nationality);
    }
    if (validatedData.date_of_birth) {
      if (validator.validateDate(validatedData.date_of_birth))
        validatedData.date_of_birth = new Date(validatedData.date_of_birth);
    }
    if (validatedData.account_id) {
      validator.isUUID("Account ID", validatedData.account_id);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const validatingInfo = await customerRepo_default.getValidatingInformation();
    if (validatingInfo.some((customer) => customer.email === validatedData.email)) {
      throw new ValidationError("400", "Email already exists");
    }
    if (validatingInfo.some((customer) => customer.phone === validatedData.phone)) {
      throw new ValidationError("400", "Phone number already exists");
    }
    if (validatingInfo.some((customer) => customer.id_card_number === validatedData.id_card_number)) {
      throw new ValidationError("400", "ID Card Number already exists");
    }
    return await customerRepo_default.createCustomer(validatedData);
  }
  async updateCustomer(id, data) {
    const validator = new Validator();
    const validatingInfo = await customerRepo_default.getValidatingInformation();
    const validatedData = {
      ...data.account_id && { account_id: data.account_id.trim() },
      ...data.full_name && { full_name: data.full_name.trim() },
      ...data.phone && { phone: data.phone.trim() },
      ...data.email && { email: data.email.trim() },
      ...data.id_card_number && { id_card_number: data.id_card_number.trim() },
      ...data.nationality && { nationality: data.nationality.trim() },
      ...data.date_of_birth && { date_of_birth: data.date_of_birth },
      ...data.address && { address: data.address.trim() }
    };
    if (validatedData.full_name) {
      if (!validator.isEmpty("Full Name", validatedData.full_name)) {
        validator.isString("Full Name", validatedData.full_name);
      }
    }
    if (validatedData.email) {
      validator.validateEmail(validatedData.email);
      if (validatingInfo.find((customer) => customer.email === validatedData.email && customer.id !== id)) {
        validator.pushError("Email already exists");
      }
    }
    if (validatedData.phone) {
      validator.validatePhoneNumber(validatedData.phone);
      if (validatingInfo.some((customer) => customer.phone === validatedData.phone && customer.id !== id)) {
        validator.pushError("Phone number already exists");
      }
    }
    if (validatedData.id_card_number) {
      validator.isString("ID Card Number", validatedData.id_card_number);
      if (validatingInfo.some((customer) => customer.id_card_number === validatedData.id_card_number && customer.id !== id)) {
        validator.pushError("ID Card Number already exists");
      }
    }
    if (validatedData.nationality) {
      validator.isString("Nationality", validatedData.nationality);
    }
    if (validatedData.date_of_birth) {
      if (validator.validateDate(validatedData.date_of_birth))
        validatedData.date_of_birth = new Date(validatedData.date_of_birth);
    }
    if (validatedData.account_id) {
      validator.isUUID("Account ID", validatedData.account_id);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatingInfo.some((customer) => customer.id === id) === false) {
      throw new ValidationError("404", "Customer not found");
    }
    return await customerRepo_default.updateCustomer(id, validatedData);
  }
  async deleteCustomer(id) {
    return await customerRepo_default.deleteCustomer(id);
  }
};
var customerServices_default = new CustomerService();

// src/controllers/customerController.ts
var CustomerController = class {
  async getAllCustomers(req, res) {
    return await customerServices_default.getAllCustomers().then((customers) => res.status(200).json(customers)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getCustomerById(req, res) {
    const { id } = req.params;
    return await customerServices_default.getCustomerById(id).then((customer) => {
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.status(200).json(customer);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async createCustomer(req, res) {
    const { account_id, full_name, phone, email, id_card_number, nationality, date_of_birth, address } = req.body;
    const data = { account_id, full_name, phone, email, id_card_number, nationality, date_of_birth, address };
    return await customerServices_default.createCustomer(data).then((customer) => res.status(201).json(customer)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateCustomer(req, res) {
    const { id } = req.params;
    const { account_id, full_name, phone, email, id_card_number, nationality, date_of_birth, address } = req.body;
    const data = { account_id, full_name, phone, email, id_card_number, nationality, date_of_birth, address };
    return await customerServices_default.updateCustomer(id, data).then((customer) => res.status(200).json(customer)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteCustomer(req, res) {
    const { id } = req.params;
    return await customerServices_default.deleteCustomer(id).then((customer) => res.status(200).json(customer)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var customerController_default = new CustomerController();

// src/routes/customerRoutes.ts
var router8 = express8.Router();
router8.get("/", customerController_default.getAllCustomers);
router8.get("/:id", customerController_default.getCustomerById);
router8.post("/", customerController_default.createCustomer);
router8.put("/:id", customerController_default.updateCustomer);
router8.delete("/:id", customerController_default.deleteCustomer);
var customerRoutes_default = router8;

// src/routes/staffRoutes.ts
import express9 from "express";

// src/repositories/staffRepo.ts
var StaffRepository = class {
  async getAllStaff() {
    return await prisma.staff.findMany();
  }
  async getStaffById(id) {
    return await prisma.staff.findUnique({
      where: { id }
    });
  }
  async getStaffByAccountId(accountId) {
    return await prisma.staff.findUnique({
      where: { account_id: accountId }
    });
  }
  async getStaffByBranchId(branchId) {
    return await prisma.staff.findMany({
      where: { branch_id: branchId }
    });
  }
  async createStaff(data) {
    return await prisma.staff.create({
      data
    });
  }
  async updateStaff(id, data) {
    return await prisma.staff.update({
      where: { id },
      data
    });
  }
  async deleteStaff(id) {
    return await prisma.staff.delete({
      where: { id }
    });
  }
  async getValidatingInformation() {
    return await prisma.staff.findMany({
      select: {
        id: true,
        phone: true
      }
    });
  }
};
var staffRepo_default = new StaffRepository();

// src/services/staffServices.ts
var StaffService = class {
  async getAllStaff() {
    return await staffRepo_default.getAllStaff();
  }
  async getStaffById(id) {
    return await staffRepo_default.getStaffById(id);
  }
  async getStaffByBranchId(branch_id) {
    return await staffRepo_default.getStaffByBranchId(branch_id);
  }
  async getStaffByAccountId(account_id) {
    return await staffRepo_default.getStaffByAccountId(account_id);
  }
  async createStaff(data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id.trim() },
      ...data.account_id && { account_id: data.account_id.trim() },
      ...data.full_name && { full_name: data.full_name.trim() },
      ...data.phone && { phone: data.phone.trim() },
      ...data.position && { position: data.position.trim() }
    };
    const validator = new Validator();
    if (validator.isEmpty("Branch ID", validatedData.branch_id))
      throw new ValidationError("400", "Branch ID is required");
    if (validator.isEmpty("Account ID", validatedData.account_id))
      throw new ValidationError("400", "Account ID is required");
    if (validator.isEmpty("Full Name", validatedData.full_name))
      throw new ValidationError("400", "Full Name is required");
    validator.isUUID("Branch ID", validatedData.branch_id);
    validator.isUUID("Account ID", validatedData.account_id);
    validator.isString("Full Name", validatedData.full_name);
    if (validatedData.phone) {
      validator.validatePhoneNumber(validatedData.phone);
    }
    if (validatedData.position) {
      validator.isString("Position", validatedData.position);
      validator.validateEnum("Position", validatedData.position, ["manager", "staff", "admin"]);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const validatingAccount = await staffRepo_default.getValidatingInformation();
    const duplicatePhoneStaff = validatingAccount.find((account) => account.phone === validatedData.phone);
    if (duplicatePhoneStaff) {
      throw new ValidationError("400", "Phone number already exists");
    }
    return await staffRepo_default.createStaff(validatedData);
  }
  async updateStaff(id, data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id.trim() },
      ...data.full_name && { full_name: data.full_name.trim() },
      ...data.phone && { phone: data.phone.trim() },
      ...data.position && { position: data.position.trim() }
    };
    const validator = new Validator();
    if (validatedData.branch_id) {
      validator.isUUID("Branch ID", validatedData.branch_id);
    }
    if (validatedData.full_name) {
      validator.isString("Full Name", validatedData.full_name);
    }
    if (validatedData.phone) {
      validator.validatePhoneNumber(validatedData.phone);
    }
    if (validatedData.position) {
      validator.validateEnum("Position", validatedData.position, ["manager", "staff", "admin"]);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const validatingInformation = await staffRepo_default.getValidatingInformation();
    const currentStaff = validatingInformation.find((staff) => staff.id === id);
    const duplicatePhoneStaff = validatingInformation.find((staff) => staff.phone === validatedData.phone && staff.id !== id);
    if (duplicatePhoneStaff) {
      throw new ValidationError("400", "Phone number already exists");
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (!currentStaff) {
      throw new ValidationError("404", "Staff not found");
    }
    const result = await staffRepo_default.updateStaff(id, validatedData);
    return result;
  }
  async deleteStaff(id) {
    return await staffRepo_default.deleteStaff(id);
  }
};
var staffServices_default = new StaffService();

// src/controllers/staffController.ts
var StaffController = class {
  async getAllStaff(req, res) {
    return await staffServices_default.getAllStaff().then((staff) => res.status(200).json(staff)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getStaffById(req, res) {
    const { id } = req.params;
    return await staffServices_default.getStaffById(id).then((staff) => {
      if (!staff) {
        return res.status(404).json({ error: "Staff not found" });
      }
      res.status(200).json(staff);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async createStaff(req, res) {
    const { branch_id, account_id, full_name, phone, position } = req.body;
    const data = { branch_id, account_id, full_name, phone, position };
    return await staffServices_default.createStaff(data).then((staff) => res.status(201).json(staff)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateStaff(req, res) {
    const { id } = req.params;
    const { branch_id, full_name, phone, position } = req.body;
    const data = { branch_id, full_name, phone, position };
    return await staffServices_default.updateStaff(id, data).then((staff) => res.status(200).json(staff)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteStaff(req, res) {
    const { id } = req.params;
    return await staffServices_default.deleteStaff(id).then((staff) => res.status(200).json(staff)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var staffController_default = new StaffController();

// src/routes/staffRoutes.ts
var router9 = express9.Router();
router9.get("/", staffController_default.getAllStaff);
router9.get("/:id", staffController_default.getStaffById);
router9.post("/", staffController_default.createStaff);
router9.put("/:id", staffController_default.updateStaff);
router9.delete("/:id", staffController_default.deleteStaff);
var staffRoutes_default = router9;

// src/routes/bookingRoutes.ts
import express10 from "express";

// src/repositories/bookingRepo.ts
var BookingRepository = class {
  async getAllBookings() {
    return await prisma.bookings.findMany();
  }
  async getBookingById(id) {
    return await prisma.bookings.findUnique({
      where: { id }
    });
  }
  async getBookingByCode(code) {
    return await prisma.bookings.findUnique({
      where: { booking_code: code }
    });
  }
  async getBookingsByBranchId(branchId) {
    return await prisma.bookings.findMany({
      where: { branch_id: branchId }
    });
  }
  async getBookingsByCustomerId(customerId) {
    return await prisma.bookings.findMany({
      where: { customer_id: customerId }
    });
  }
  async getBookingsByStatus(status) {
    return await prisma.bookings.findMany({
      where: { status }
    });
  }
  async getValidatingInformation() {
    return await prisma.bookings.findMany({
      select: {
        booking_code: true
      }
    });
  }
  async createBooking(data) {
    return await prisma.bookings.create({
      data
    });
  }
  async updateBooking(id, data) {
    return await prisma.bookings.update({
      where: { id },
      data
    });
  }
  async deleteBooking(id) {
    return await prisma.bookings.delete({
      where: { id }
    });
  }
};
var bookingRepo_default = new BookingRepository();

// src/middlewares/generator.ts
import crypto from "crypto";
var generateBookingCode = (length) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};
var generateInvoiceCode = () => {
  const prefix = "INV";
  const datePart = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
};
var generateDayDiff = (startDate, endDate) => {
  const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
};
var generateHourDiff = (startDate, endDate) => {
  const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffMs / (1e3 * 60 * 60));
};
var generateDiscountAmount = (subtotal, discountType, discountValue) => {
  if (discountType === "percentage") {
    return subtotal * (discountValue / 100);
  } else if (discountType === "fixed_amount") {
    return discountValue;
  }
};
var generateSubtotal = (roomPrice, start, end, type) => {
  if (type === "daily") {
    const dayDiff = generateDayDiff(start, end);
    return roomPrice * dayDiff;
  } else if (type === "hourly") {
    const hourDiff = generateHourDiff(start, end);
    return roomPrice * hourDiff;
  }
};

// src/services/bookingServices.ts
var BookingService = class {
  async getAllBookings() {
    return await bookingRepo_default.getAllBookings();
  }
  async getBookingById(id) {
    return await bookingRepo_default.getBookingById(id);
  }
  async createBooking(data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.customer_id && { customer_id: data.customer_id },
      ...data.room_type_id && { room_type_id: data.room_type_id },
      ...data.assigned_room_id && { assigned_room_id: data.assigned_room_id },
      ...data.booking_type && { booking_type: data.booking_type },
      ...data.checkin_at && { checkin_at: data.checkin_at },
      ...data.checkout_at && { checkout_at: data.checkout_at },
      ...data.num_guests && { num_guests: data.num_guests },
      ...data.discount_id && { discount_id: data.discount_id },
      ...data.created_by && { created_by: data.created_by },
      ...data.notes && { notes: data.notes }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Branch ID", validatedData.branch_id)) {
      if (validator.isUUID("Branch ID", validatedData.branch_id)) {
        const branch = await branchRepo_default.getBranchById(validatedData.branch_id);
        if (!branch) {
          throw new ValidationError("400", "Branch not found");
        }
      }
    }
    if (!validator.isEmpty("Customer ID", validatedData.customer_id)) {
      if (validator.isUUID("Customer ID", validatedData.customer_id)) {
        const customer = await customerRepo_default.getCustomerById(validatedData.customer_id);
        if (!customer) {
          throw new ValidationError("400", "Customer not found");
        }
      }
    }
    if (!validator.isEmpty("Room Type ID", validatedData.room_type_id)) {
      if (validator.isUUID("Room Type ID", validatedData.room_type_id)) {
        const roomPrice2 = await roomTypeRepo_default.getRoomTypeById(validatedData.room_type_id);
        if (!roomPrice2) {
          throw new ValidationError("400", "Room type not found");
        }
      }
    }
    if (!validator.isEmpty("Booking Type", validatedData.booking_type))
      validator.validateBookingType(validatedData.booking_type);
    if (!validator.isEmpty("Checkin At", validatedData.checkin_at))
      validator.validateDate(validatedData.checkin_at);
    if (!validator.isEmpty("Checkout At", validatedData.checkout_at))
      validator.validateDate(validatedData.checkout_at);
    if (validatedData.created_by) {
      validator.isUUID("Created By", validatedData.created_by);
    }
    if (validator.validateDateOrder(validatedData.checkin_at, validatedData.checkout_at))
      if (new Date(validatedData.checkin_at) < /* @__PURE__ */ new Date())
        validator.pushError("Check-in date must be in the future");
      else {
        validatedData.checkin_at = new Date(validatedData.checkin_at);
        validatedData.checkout_at = new Date(validatedData.checkout_at);
      }
    if (validatedData.num_guests) {
      validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const validatingInfo = await bookingRepo_default.getValidatingInformation();
    validatedData.booking_code = generateBookingCode(8);
    while (validatingInfo.some((booking) => booking.booking_code === validatedData.booking_code)) {
      validatedData.booking_code = generateBookingCode(8);
    }
    const roomPrice = await roomPriceRepo_default.getRoomPricesByRoomTypeId(validatedData.room_type_id);
    if (!roomPrice) {
      throw new ValidationError("400", "No room price found for the specified room type");
    }
    if (validatedData.booking_type === "daily")
      validatedData.room_price_snapshot = roomPrice.price_per_day;
    else
      validatedData.room_price_snapshot = roomPrice.price_per_hour;
    validatedData.subtotal = generateSubtotal(validatedData.room_price_snapshot, validatedData.checkin_at, validatedData.checkout_at, validatedData.booking_type);
    validatedData.total_amount = validatedData.subtotal;
    if (validatedData.discount_id) {
      validator.isUUID("Discount ID", validatedData.discount_id);
      const discount = await discountRepo_default.getDiscountById(validatedData.discount_id);
      if (!discount) {
        validator.pushError("Discount not found");
      } else {
        validatedData.discount_amount = generateDiscountAmount(validatedData.subtotal, discount.discount_type, Number(discount.discount_value));
        validatedData.total_amount -= validatedData.discount_amount;
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (!validatedData.status)
      validatedData.status = "pending";
    validatedData.expires_at = new Date(Date.now() + 15 * 60 * 1e3);
    return await bookingRepo_default.createBooking(validatedData);
  }
  async updateBooking(id, data) {
    const validatedData = {
      ...data.room_type_id && { room_type_id: data.room_type_id },
      ...data.assigned_room_id && { assigned_room_id: data.assigned_room_id },
      ...data.booking_type && { booking_type: data.booking_type },
      ...data.status && { status: data.status },
      ...data.checkin_at && { checkin_at: data.checkin_at },
      ...data.checkout_at && { checkout_at: data.checkout_at },
      ...data.actual_checkin_at && { actual_checkin_at: data.actual_checkin_at },
      ...data.actual_checkout_at && { actual_checkout_at: data.actual_checkout_at },
      ...data.num_guests && { num_guests: data.num_guests },
      ...data.discount_id && { discount_id: data.discount_id },
      ...data.deposit_amount && { deposit_amount: data.deposit_amount },
      ...data.deposit_paid_at && { deposit_paid_at: data.deposit_paid_at },
      ...data.expires_at && { expires_at: data.expires_at },
      ...data.notes && { notes: data.notes }
    };
    const validator = new Validator();
    const existingBooking = await bookingRepo_default.getBookingById(id);
    if (!existingBooking) {
      throw new ValidationError("404", "Booking not found");
    }
    if (validatedData.assigned_room_id) {
      validator.isUUID("Assigned Room ID", validatedData.assigned_room_id);
    }
    if (validatedData.booking_type) {
      validator.validateBookingType(validatedData.booking_type);
    }
    if (validatedData.status) {
      validator.validateBookingStatus(validatedData.status);
    }
    if (validatedData.num_guests) {
      validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
    }
    if (validatedData.checkin_at && validatedData.checkout_at) {
      if (validator.validateDateOrder(validatedData.checkin_at, validatedData.checkout_at)) {
        if (new Date(validatedData.checkin_at) < /* @__PURE__ */ new Date()) {
          validator.pushError("Check-in date must be in the future");
        }
        validatedData.checkin_at = new Date(validatedData.checkin_at);
        validatedData.checkout_at = new Date(validatedData.checkout_at);
      }
    } else if (validatedData.checkin_at) {
      if (validator.validateDate(validatedData.checkin_at)) {
        if (new Date(validatedData.checkin_at) < /* @__PURE__ */ new Date()) {
          validator.pushError("Check-in date must be in the future");
        } else if (new Date(validatedData.checkin_at) >= new Date(existingBooking.checkout_at)) {
          validator.pushError("Check-in date must be before the existing booking's check-out date");
        }
        validatedData.checkin_at = new Date(validatedData.checkin_at);
      }
    } else if (validatedData.checkout_at) {
      if (validator.validateDate(validatedData.checkout_at)) {
        if (new Date(validatedData.checkout_at) < /* @__PURE__ */ new Date()) {
          validator.pushError("Check-out date must be in the future");
        } else if (new Date(validatedData.checkout_at) <= new Date(existingBooking.checkin_at)) {
          validator.pushError("Check-out date must be after the existing booking's check-in date");
        }
        validatedData.checkout_at = new Date(validatedData.checkout_at);
      }
    }
    if (validatedData.actual_checkin_at && validatedData.actual_checkout_at) {
      if (validator.validateDateOrder(validatedData.actual_checkin_at, validatedData.actual_checkout_at)) {
        validatedData.actual_checkin_at = new Date(validatedData.actual_checkin_at);
        validatedData.actual_checkout_at = new Date(validatedData.actual_checkout_at);
      }
    } else if (validatedData.actual_checkin_at) {
      if (validator.validateDate(validatedData.actual_checkin_at)) {
        validatedData.actual_checkin_at = new Date(validatedData.actual_checkin_at);
      }
    } else if (validatedData.actual_checkout_at) {
      if (validator.validateDate(validatedData.actual_checkout_at)) {
        validatedData.actual_checkout_at = new Date(validatedData.actual_checkout_at);
      }
    }
    if (validatedData.num_guests) {
      validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
    }
    if (validatedData.room_price_snapshot) {
      validator.isDecimal("Room Price Snapshot", validatedData.room_price_snapshot);
      validator.isNonNegativeNumber("Room Price Snapshot", validatedData.room_price_snapshot);
    }
    if (validatedData.deposit_amount) {
      validator.isDecimal("Deposit Amount", validatedData.deposit_amount);
      validator.isNonNegativeNumber("Deposit Amount", validatedData.deposit_amount);
    }
    if (validatedData.deposit_paid_at) {
      if (validator.validateDate(validatedData.deposit_paid_at)) {
        validatedData.deposit_paid_at = new Date(validatedData.deposit_paid_at);
      }
    }
    if (validatedData.expires_at) {
      if (validator.validateDate(validatedData.expires_at)) {
        if (new Date(validatedData.expires_at) < /* @__PURE__ */ new Date()) {
          validator.pushError("Expiration date must be in the future");
        }
      } else {
        validatedData.expires_at = new Date(validatedData.expires_at);
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    validatedData.subtotal = generateSubtotal(
      validatedData.room_price_snapshot || existingBooking.room_price_snapshot,
      validatedData.checkin_at || existingBooking.checkin_at,
      validatedData.checkout_at || existingBooking.checkout_at,
      validatedData.booking_type || existingBooking.booking_type
    );
    validatedData.total_amount = validatedData.subtotal;
    if (validatedData.discount_id) {
      if (validator.isUUID("Discount ID", validatedData.discount_id)) {
        const discount = await discountRepo_default.getDiscountById(validatedData.discount_id);
        if (!discount) {
          validator.pushError("Discount not found");
        } else {
          validatedData.discount_amount = generateDiscountAmount(Number(validatedData.subtotal), discount.discount_type, Number(discount.discount_value));
          validatedData.total_amount -= validatedData.discount_amount;
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    validatedData.updated_at = /* @__PURE__ */ new Date();
    return await bookingRepo_default.updateBooking(id, validatedData);
  }
  async deleteBooking(id) {
    return await bookingRepo_default.deleteBooking(id);
  }
};
var bookingServices_default = new BookingService();

// src/controllers/bookingController.ts
var BookingController = class {
  async getAllBookings(req, res) {
    return await bookingServices_default.getAllBookings().then((bookings) => res.status(200).json(bookings)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getBookingById(req, res) {
    const { id } = req.params;
    return await bookingServices_default.getBookingById(id).then((booking) => {
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(200).json(booking);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async createBooking(req, res) {
    const { branch_id, customer_id, room_type_id, booking_type, status, checkin_at, checkout_at, num_guests, discount_id, created_by, notes } = req.body;
    const data = { branch_id, customer_id, room_type_id, booking_type, status, checkin_at, checkout_at, num_guests, discount_id, created_by, notes };
    return await bookingServices_default.createBooking(data).then((booking) => res.status(201).json(booking)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      console.log(error);
      res.status(500).json({ error: error.message });
    });
  }
  async updateBooking(req, res) {
    const { id } = req.params;
    const { room_type_id, assigned_room_id, status, checkin_at, checkout_at, actual_checkin_at, actual_checkout_at, num_guests, discount_id, deposit_amount, deposit_paid_at, expires_at, notes } = req.body;
    const data = { room_type_id, assigned_room_id, status, checkin_at, checkout_at, actual_checkin_at, actual_checkout_at, num_guests, discount_id, deposit_amount, deposit_paid_at, expires_at, notes };
    return await bookingServices_default.updateBooking(id, data).then((booking) => res.status(200).json(booking)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteBooking(req, res) {
    const { id } = req.params;
    return await bookingServices_default.deleteBooking(id).then((booking) => res.status(200).json(booking)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var bookingController_default = new BookingController();

// src/routes/bookingRoutes.ts
var router10 = express10.Router();
router10.get("/", bookingController_default.getAllBookings);
router10.get("/:id", bookingController_default.getBookingById);
router10.post("/", bookingController_default.createBooking);
router10.put("/:id", bookingController_default.updateBooking);
router10.delete("/:id", bookingController_default.deleteBooking);
var bookingRoutes_default = router10;

// src/routes/bookingServiceRoutes.ts
import express11 from "express";

// src/repositories/bookingServiceRepo.ts
var BookingServiceRepository = class {
  async getAllBookingServices() {
    return await prisma.booking_services.findMany();
  }
  async getBookingServiceById(id) {
    return await prisma.booking_services.findUnique({
      where: { id }
    });
  }
  async getBookingServicesByBookingId(bookingId) {
    return await prisma.booking_services.findMany({
      where: { booking_id: bookingId },
      include: {
        services: {
          select: {
            name: true,
            price: true
          }
        }
      }
    });
  }
  async getBookingServicesByServiceId(serviceId) {
    return await prisma.booking_services.findMany({
      where: { service_id: serviceId }
    });
  }
  async createBookingService(data) {
    return await prisma.booking_services.create({
      data
    });
  }
  async updateBookingService(id, data) {
    return await prisma.booking_services.update({
      where: { id },
      data
    });
  }
  async deleteBookingService(id) {
    return await prisma.booking_services.delete({
      where: { id }
    });
  }
};
var bookingServiceRepo_default = new BookingServiceRepository();

// src/services/bookingServiceServices.ts
var BookingServiceService = class {
  async getAllBookingServices() {
    return await bookingServiceRepo_default.getAllBookingServices();
  }
  async getBookingServiceById(id) {
    const validator = new Validator();
    if (!validator.isUUID("Booking Service's ID", id)) {
      throw new ValidationError("400", validator.clearError());
    }
    return await bookingServiceRepo_default.getBookingServiceById(id);
  }
  async getBookingServicesByBookingId(bookingId) {
    const validator = new Validator();
    if (!validator.isUUID("Booking's ID", bookingId)) {
      throw new ValidationError("400", validator.clearError());
    }
    return await bookingServiceRepo_default.getBookingServicesByBookingId(bookingId);
  }
  async createBookingService(data) {
    const validatedData = {
      ...data.booking_id && { booking_id: data.booking_id },
      ...data.service_id && { service_id: data.service_id },
      ...data.quantity && { quantity: data.quantity },
      ...data.unit_price && { unit_price: data.unit_price },
      ...data.total_amount && { total_amount: data.total_amount },
      ...data.added_by && { added_by: data.added_by }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Booking ID", validatedData.booking_id))
      validator.isUUID("Booking ID", validatedData.booking_id);
    if (!validator.isEmpty("Service ID", validatedData.service_id))
      validator.isUUID("Service ID", validatedData.service_id);
    if (!validator.isEmpty("Quantity", validatedData.quantity))
      validator.isPositiveNumber("Quantity", validatedData.quantity);
    if (!validator.isEmpty("Added_by's ID", validatedData.added_by))
      validator.isUUID("Added_by's ID", validatedData.added_by);
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const booking = await bookingRepo_default.getBookingById(validatedData.booking_id);
    if (!booking) {
      validator.pushError("Booking not found");
    }
    const roomService = await roomServiceRepo_default.getServiceById(validatedData.service_id);
    if (!roomService) {
      validator.pushError("Service not found");
    }
    const account = await accountRepo_default.getAccountById(validatedData.added_by);
    if (!account) {
      validator.pushError("Added_by's ID not found");
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    validatedData.unit_price = roomService ? roomService.price : 0;
    validatedData.total_amount = validatedData.unit_price * validatedData.quantity;
    return await bookingServiceRepo_default.createBookingService(validatedData);
  }
  async updateBookingService(id, data) {
    const validator = new Validator();
    const existingBookingService = await bookingServiceRepo_default.getBookingServiceById(id);
    if (!existingBookingService) {
      throw new ValidationError("404", "Booking service not found");
    }
    const validatedData = {
      ...data.quantity && { quantity: data.quantity },
      ...data.unit_price && { unit_price: data.unit_price },
      ...data.total_amount && { total_amount: data.total_amount },
      ...data.added_by && { added_by: data.added_by }
    };
    if (validatedData.quantity) {
      validator.isPositiveNumber("Quantity", validatedData.quantity);
    } else {
      validatedData.quantity = existingBookingService.quantity;
    }
    if (validatedData.unit_price) {
      validator.isDecimal("Unit Price", validatedData.unit_price);
      validator.isPositiveNumber("Unit Price", validatedData.unit_price);
    } else {
      validatedData.unit_price = existingBookingService.unit_price;
    }
    if (!validatedData.added_by)
      validatedData.added_by = existingBookingService.added_by;
    if (validator.isUUID("Added_by's ID", validatedData.added_by)) {
      const account = await accountRepo_default.getAccountById(validatedData.added_by);
      if (!account) {
        validator.pushError("Added_by's ID not found");
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    validatedData.total_amount = validatedData.unit_price * validatedData.quantity;
    return await bookingServiceRepo_default.updateBookingService(id, validatedData);
  }
  async deleteBookingService(id) {
    return await bookingServiceRepo_default.deleteBookingService(id);
  }
};
var bookingServiceServices_default = new BookingServiceService();

// src/controllers/bookingServiceController.ts
var BookingServiceController = class {
  async getAllBookingServices(req, res) {
    return await bookingServiceServices_default.getAllBookingServices().then((bookingServices) => res.status(200).json(bookingServices)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getBookingServicesByBookingId(req, res) {
    const { id } = req.params;
    return await bookingServiceServices_default.getBookingServicesByBookingId(id).then((bookingServices) => res.status(200).json(bookingServices)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async getBookingServiceById(req, res) {
    const { id } = req.params;
    return await bookingServiceServices_default.getBookingServiceById(id).then((bookingService) => {
      if (!bookingService) {
        return res.status(404).json({ error: "Booking Service not found" });
      }
      res.status(200).json(bookingService);
    }).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createBookingService(req, res) {
    const { booking_id, service_id, quantity, unit_price, total_amount, added_by } = req.body;
    const data = { booking_id, service_id, quantity, unit_price, total_amount, added_by };
    return await bookingServiceServices_default.createBookingService(data).then((bookingService) => res.status(201).json(bookingService)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateBookingService(req, res) {
    const { id } = req.params;
    const { quantity, unit_price, total_amount, added_by } = req.body;
    const data = { quantity, unit_price, total_amount, added_by };
    return await bookingServiceServices_default.updateBookingService(id, data).then((bookingService) => res.status(200).json(bookingService)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteBookingService(req, res) {
    const { id } = req.params;
    return await bookingServiceServices_default.deleteBookingService(id).then((bookingService) => res.status(200).json(bookingService)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var bookingServiceController_default = new BookingServiceController();

// src/routes/bookingServiceRoutes.ts
var router11 = express11.Router();
router11.get("/bookings/:id", bookingServiceController_default.getBookingServicesByBookingId);
router11.get("/", bookingServiceController_default.getAllBookingServices);
router11.get("/:id", bookingServiceController_default.getBookingServiceById);
router11.post("/", bookingServiceController_default.createBookingService);
router11.put("/:id", bookingServiceController_default.updateBookingService);
router11.delete("/:id", bookingServiceController_default.deleteBookingService);
var bookingServiceRoutes_default = router11;

// src/routes/cancellationRequestRoutes.ts
import express12 from "express";

// src/repositories/cancellationRequestRepo.ts
var CancellationRequestRepository = class {
  async getAllCancellationRequests() {
    return await prisma.cancellation_requests.findMany({
      include: {
        bookings: true
      }
    });
  }
  async getCancellationRequestById(id) {
    return await prisma.cancellation_requests.findUnique({
      where: { id },
      include: {
        bookings: true
      }
    });
  }
  async getCancellationRequestsByBookingId(bookingId) {
    return await prisma.cancellation_requests.findMany({
      where: { booking_id: bookingId },
      include: {
        bookings: true
      }
    });
  }
  async getCancellationRequestsByStatus(status) {
    return await prisma.cancellation_requests.findMany({
      where: { status },
      include: {
        bookings: true
      }
    });
  }
  async createCancellationRequest(data) {
    return await prisma.cancellation_requests.create({
      data,
      include: {
        bookings: true
      }
    });
  }
  async updateCancellationRequest(id, data) {
    return await prisma.cancellation_requests.update({
      where: { id },
      data,
      include: {
        bookings: true
      }
    });
  }
  async deleteCancellationRequest(id) {
    return await prisma.cancellation_requests.delete({
      where: { id },
      include: {
        bookings: true
      }
    });
  }
};
var cancellationRequestRepo_default = new CancellationRequestRepository();

// src/services/cancellationRequestServices.ts
var CancellationRequestService = class {
  async getAllCancellationRequests() {
    return await cancellationRequestRepo_default.getAllCancellationRequests();
  }
  async getCancellationRequestById(id) {
    return await cancellationRequestRepo_default.getCancellationRequestById(id);
  }
  async createCancellationRequest(data) {
    const validatedData = {
      ...data.booking_id && { booking_id: data.booking_id },
      ...data.requested_by && { requested_by: data.requested_by },
      ...data.reason && { reason: data.reason },
      ...data.status && { status: data.status },
      ...data.refund_amount && { refund_amount: data.refund_amount },
      ...data.notes && { notes: data.notes }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Booking ID", validatedData.booking_id)) {
      if (validator.isUUID("Booking ID", validatedData.booking_id)) {
        const booking = await bookingRepo_default.getBookingById(validatedData.booking_id);
        if (!booking) {
          validator.pushError("Booking not found");
        }
      }
    }
    if (validatedData.requested_by) {
      if (validator.isUUID("Requested By", validatedData.requested_by)) {
        const account = await accountRepo_default.getAccountById(validatedData.requested_by);
        if (!account) {
          validator.pushError("Requested_by ID not found");
        }
      }
    }
    if (validatedData.status)
      validator.validateCancellationStatus(validatedData.status);
    if (validatedData.refund_amount) {
      validator.isDecimal("Refund Amount", validatedData.refund_amount);
      validator.isNonNegativeNumber("Refund Amount", validatedData.refund_amount);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await cancellationRequestRepo_default.createCancellationRequest(validatedData);
  }
  async updateCancellationRequest(id, data) {
    const validator = new Validator();
    if (validator.isUUID("Cancellation Request ID", id)) {
      const existingRequest = await cancellationRequestRepo_default.getCancellationRequestById(id);
      if (!existingRequest) {
        throw new ValidationError("404", "Cancellation request not found");
      }
    }
    const validatedData = {
      ...data.reason && { reason: data.reason },
      ...data.status && { status: data.status },
      ...data.refund_amount && { refund_amount: data.refund_amount },
      ...data.refund_processed_at && { refund_processed_at: data.refund_processed_at },
      ...data.resolved_by && { resolved_by: data.resolved_by },
      ...data.notes && { notes: data.notes }
    };
    if (validatedData.status) {
      validator.validateCancellationStatus(validatedData.status);
    }
    if (validatedData.refund_amount) {
      validator.isDecimal("Refund Amount", validatedData.refund_amount);
      validator.isNonNegativeNumber("Refund Amount", validatedData.refund_amount);
    }
    if (validatedData.resolved_by) {
      if (validator.isUUID("Resolved By", validatedData.resolved_by)) {
        const account = await accountRepo_default.getAccountById(validatedData.resolved_by);
        if (!account) {
          validator.pushError("Resolved_by ID not found");
        }
      }
    }
    if (validatedData.refund_processed_at) {
      validator.validateDate(validatedData.refund_processed_at);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    validatedData.updated_at = /* @__PURE__ */ new Date();
    return await cancellationRequestRepo_default.updateCancellationRequest(id, validatedData);
  }
  async deleteCancellationRequest(id) {
    return await cancellationRequestRepo_default.deleteCancellationRequest(id);
  }
};
var cancellationRequestServices_default = new CancellationRequestService();

// src/controllers/cancellationRequestController.ts
var CancellationRequestController = class {
  async getAllCancellationRequests(req, res) {
    return await cancellationRequestServices_default.getAllCancellationRequests().then((requests) => res.status(200).json(requests)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getCancellationRequestById(req, res) {
    const { id } = req.params;
    return await cancellationRequestServices_default.getCancellationRequestById(id).then((request) => {
      if (!request) {
        return res.status(404).json({ error: "Cancellation request not found" });
      }
      res.status(200).json(request);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async createCancellationRequest(req, res) {
    const { booking_id, requested_by, reason, status, refund_amount, notes } = req.body;
    const data = { booking_id, requested_by, reason, status, refund_amount, notes };
    return await cancellationRequestServices_default.createCancellationRequest(data).then((request) => res.status(201).json(request)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateCancellationRequest(req, res) {
    const { id } = req.params;
    const { reason, status, refund_amount, refund_processed_at, resolved_by, notes } = req.body;
    const data = { reason, status, refund_amount, refund_processed_at, resolved_by, notes };
    return await cancellationRequestServices_default.updateCancellationRequest(id, data).then((request) => res.status(200).json(request)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteCancellationRequest(req, res) {
    const { id } = req.params;
    return await cancellationRequestServices_default.deleteCancellationRequest(id).then((request) => res.status(200).json(request)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var cancellationRequestController_default = new CancellationRequestController();

// src/routes/cancellationRequestRoutes.ts
var router12 = express12.Router();
router12.get("/", cancellationRequestController_default.getAllCancellationRequests);
router12.get("/:id", cancellationRequestController_default.getCancellationRequestById);
router12.post("/", cancellationRequestController_default.createCancellationRequest);
router12.put("/:id", cancellationRequestController_default.updateCancellationRequest);
router12.delete("/:id", cancellationRequestController_default.deleteCancellationRequest);
var cancellationRequestRoutes_default = router12;

// src/routes/holidayDateRoutes.ts
import express13 from "express";

// src/repositories/holidayDateRepo.ts
var HolidayDateRepository = class {
  async getAllHolidayDates() {
    return await prisma.holiday_dates.findMany();
  }
  async getHolidayDateById(id) {
    return await prisma.holiday_dates.findUnique({
      where: { id }
    });
  }
  async getHolidayDatesByBranchId(branchId) {
    return await prisma.holiday_dates.findMany({
      where: { branch_id: branchId }
    });
  }
  async getHolidayDatesByDate(date) {
    return await prisma.holiday_dates.findMany({
      where: { date }
    });
  }
  async createHolidayDate(data) {
    return await prisma.holiday_dates.create({
      data
    });
  }
  async updateHolidayDate(id, data) {
    return await prisma.holiday_dates.update({
      where: { id },
      data
    });
  }
  async deleteHolidayDate(id) {
    return await prisma.holiday_dates.delete({
      where: { id }
    });
  }
};
var holidayDateRepo_default = new HolidayDateRepository();

// src/services/holidayDateServices.ts
var HolidayDateService = class {
  async getAllHolidayDates() {
    return await holidayDateRepo_default.getAllHolidayDates();
  }
  async getHolidayDateById(id) {
    const validator = new Validator();
    if (!validator.isUUID("Holiday Date ID", id)) {
      throw new ValidationError("400", "Invalid holiday date ID format");
    }
    return await holidayDateRepo_default.getHolidayDateById(id);
  }
  async createHolidayDate(data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.date && { date: data.date },
      ...data.name && { name: data.name }
    };
    const validator = new Validator();
    if (validatedData.branch_id) {
      if (validator.isUUID("Branch ID", validatedData.branch_id)) {
        const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
        if (!branchExists) {
          validator.pushError("Branch ID does not exist");
        }
      }
    }
    if (!validator.isEmpty("Date", validatedData.date)) {
      if (validator.validateDate(validatedData.date))
        validatedData.date = new Date(validatedData.date);
    }
    if (validatedData.name) {
      validator.isString("Name", validatedData.name);
      validator.maxLength("Name", validatedData.name, 150);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await holidayDateRepo_default.createHolidayDate(validatedData);
  }
  async updateHolidayDate(id, data) {
    const validator = new Validator();
    if (!validator.isEmpty("Holiday Date ID", id)) {
      if (!validator.isUUID("Holiday Date ID", id)) {
        throw new ValidationError("400", validator.clearError());
      }
    }
    const existingHolidayDate = await holidayDateRepo_default.getHolidayDateById(id);
    if (!existingHolidayDate) {
      throw new ValidationError("404", "Holiday date not found");
    }
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.date && { date: data.date },
      ...data.name && { name: data.name }
    };
    if (validatedData.branch_id) {
      if (validator.isUUID("Branch ID", validatedData.branch_id)) {
        const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
        if (!branchExists) {
          validator.pushError("Branch ID does not exist");
        }
      }
    }
    if (validatedData.date) {
      if (validator.validateDate(validatedData.date))
        validatedData.date = new Date(validatedData.date);
    }
    if (validatedData.name) {
      validator.isString("Name", validatedData.name);
      validator.maxLength("Name", validatedData.name, 150);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await holidayDateRepo_default.updateHolidayDate(id, validatedData);
  }
  async deleteHolidayDate(id) {
    return await holidayDateRepo_default.deleteHolidayDate(id);
  }
};
var holidayDateServices_default = new HolidayDateService();

// src/controllers/holidayDateController.ts
var HolidayDateController = class {
  async getAllHolidayDates(req, res) {
    return await holidayDateServices_default.getAllHolidayDates().then((dates) => res.status(200).json(dates)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getHolidayDateById(req, res) {
    const { id } = req.params;
    return await holidayDateServices_default.getHolidayDateById(id).then((date) => {
      if (!date) {
        return res.status(404).json({ error: "Holiday date not found" });
      }
      res.status(200).json(date);
    }).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createHolidayDate(req, res) {
    const { branch_id, date, name } = req.body;
    const data = { branch_id, date, name };
    return await holidayDateServices_default.createHolidayDate(data).then((holidayDate) => res.status(201).json(holidayDate)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateHolidayDate(req, res) {
    const { id } = req.params;
    const { branch_id, date, name } = req.body;
    const data = { branch_id, date, name };
    return await holidayDateServices_default.updateHolidayDate(id, data).then((holidayDate) => res.status(200).json(holidayDate)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteHolidayDate(req, res) {
    const { id } = req.params;
    return await holidayDateServices_default.deleteHolidayDate(id).then((holidayDate) => res.status(200).json(holidayDate)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var holidayDateController_default = new HolidayDateController();

// src/routes/holidayDateRoutes.ts
var router13 = express13.Router();
router13.get("/", holidayDateController_default.getAllHolidayDates);
router13.get("/:id", holidayDateController_default.getHolidayDateById);
router13.post("/", holidayDateController_default.createHolidayDate);
router13.put("/:id", holidayDateController_default.updateHolidayDate);
router13.delete("/:id", holidayDateController_default.deleteHolidayDate);
var holidayDateRoutes_default = router13;

// src/routes/invoiceRoutes.ts
import express14 from "express";

// src/repositories/invoiceRepo.ts
var InvoiceRepository = class {
  async getAllInvoices() {
    return await prisma.invoices.findMany();
  }
  async getInvoiceById(id) {
    return await prisma.invoices.findUnique({
      where: { id }
    });
  }
  async getInvoiceByCode(code) {
    return await prisma.invoices.findUnique({
      where: { invoice_code: code }
    });
  }
  async getInvoicesByBookingId(bookingId) {
    return await prisma.invoices.findMany({
      where: { booking_id: bookingId }
    });
  }
  async createInvoice(data) {
    return await prisma.invoices.create({
      data
    });
  }
  async getAllCode() {
    const invoices = await prisma.invoices.findMany({
      select: { invoice_code: true }
    });
    return invoices.map((inv) => inv.invoice_code);
  }
  async updateInvoice(id, data) {
    return await prisma.invoices.update({
      where: { id },
      data
    });
  }
  async deleteInvoice(id) {
    return await prisma.invoices.delete({
      where: { id }
    });
  }
};
var invoiceRepo_default = new InvoiceRepository();

// src/services/invoiceServices.ts
var InvoiceService = class {
  async getAllInvoices() {
    return await invoiceRepo_default.getAllInvoices();
  }
  async getInvoiceById(id) {
    const validator = new Validator();
    if (!validator.isEmpty("Invoice ID", id)) {
      validator.isUUID("Invoice ID", id);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await invoiceRepo_default.getInvoiceById(id);
  }
  async createInvoice(data) {
    const validatedData = {
      ...data.booking_id && { booking_id: data.booking_id },
      ...data.issued_by && { issued_by: data.issued_by },
      ...data.notes && { notes: data.notes }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Booking ID", validatedData.booking_id))
      validator.isUUID("Booking ID", validatedData.booking_id);
    if (!validator.isEmpty("Issued By", validatedData.issued_by)) {
      if (validator.isUUID("Issued By", validatedData.issued_by)) {
        const staffAccount = await accountRepo_default.getAccountById(validatedData.issued_by);
        if (!staffAccount) {
          throw new ValidationError("404", "Account not found");
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const booking = await bookingRepo_default.getBookingById(validatedData.booking_id);
    if (!booking) {
      throw new ValidationError("404", "Booking not found");
    }
    const bookingServices = await bookingServiceRepo_default.getBookingServicesByBookingId(validatedData.booking_id);
    if (bookingServices.length > 0) {
      const serviceCharge = bookingServices.reduce((total, item) => total + Number(item.total_amount || 0), 0);
      validatedData.service_charge = serviceCharge;
    } else
      validatedData.service_charge = 0;
    validatedData.room_charge = Number(booking.total_amount);
    validatedData.discount_amount = Number(booking.discount_amount || 0);
    validatedData.total_amount = Number(booking.total_amount) + validatedData.service_charge - validatedData.discount_amount;
    validatedData.deposit_used = Number(booking.deposit_amount);
    validatedData.amount_due = validatedData.total_amount - validatedData.deposit_used;
    if (validatedData.amount_due < 0) {
      validatedData.refund_amount = Math.abs(validatedData.amount_due);
      validatedData.amount_due = 0;
    }
    const codesExists = await invoiceRepo_default.getAllCode();
    validatedData.invoice_code = generateInvoiceCode();
    while (codesExists.includes(validatedData.invoice_code)) {
      validatedData.invoice_code = generateInvoiceCode();
    }
    return await invoiceRepo_default.createInvoice(validatedData);
  }
  async updateInvoice(id, data) {
    const validator = new Validator();
    const existingInvoice = await invoiceRepo_default.getInvoiceById(id);
    if (!existingInvoice) {
      throw new ValidationError("404", "Invoice not found");
    }
    const validatedData = {
      ...data.room_charge && { room_charge: data.room_charge },
      ...data.service_charge && { service_charge: data.service_charge },
      ...data.fine_charge && { fine_charge: data.fine_charge },
      ...data.late_checkout_fee && { late_checkout_fee: data.late_checkout_fee },
      ...data.early_checkout_fee && { early_checkout_fee: data.early_checkout_fee },
      ...data.discount_amount && { discount_amount: data.discount_amount },
      ...data.total_amount && { total_amount: data.total_amount },
      ...data.deposit_used && { deposit_used: data.deposit_used },
      ...data.amount_due && { amount_due: data.amount_due },
      ...data.refund_amount && { refund_amount: data.refund_amount },
      ...data.notes && { notes: data.notes }
    };
    if (validatedData.room_charge) {
      validator.isDecimal("Room Charge", validatedData.room_charge);
    }
    if (validatedData.service_charge) {
      validator.isDecimal("Service Charge", validatedData.service_charge);
    }
    if (validatedData.fine_charge) {
      validator.isDecimal("Fine Charge", validatedData.fine_charge);
    }
    if (validatedData.total_amount) {
      validator.isDecimal("Total Amount", validatedData.total_amount);
      validator.isNonNegativeNumber("Total Amount", validatedData.total_amount);
    }
    if (validatedData.amount_due) {
      validator.isDecimal("Amount Due", validatedData.amount_due);
      validator.isNonNegativeNumber("Amount Due", validatedData.amount_due);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await invoiceRepo_default.updateInvoice(id, validatedData);
  }
  async deleteInvoice(id) {
    return await invoiceRepo_default.deleteInvoice(id);
  }
};
var invoiceServices_default = new InvoiceService();

// src/controllers/invoiceController.ts
var InvoiceController = class {
  async getAllInvoices(req, res) {
    return await invoiceServices_default.getAllInvoices().then((invoices) => res.status(200).json(invoices)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getInvoiceById(req, res) {
    const { id } = req.params;
    return await invoiceServices_default.getInvoiceById(id).then((invoice) => {
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.status(200).json(invoice);
    }).catch((error) => {
      if (typeof parseInt(error.code) === "number") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createInvoice(req, res) {
    const { booking_id, issued_by, notes } = req.body;
    const data = { booking_id, issued_by, notes };
    return await invoiceServices_default.createInvoice(data).then((invoice) => res.status(201).json(invoice)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateInvoice(req, res) {
    const { id } = req.params;
    const { room_charge, service_charge, fine_charge, late_checkout_fee, early_checkout_fee, discount_amount, total_amount, deposit_used, amount_due, refund_amount, notes } = req.body;
    const data = { room_charge, service_charge, fine_charge, late_checkout_fee, early_checkout_fee, discount_amount, total_amount, deposit_used, amount_due, refund_amount, notes };
    return await invoiceServices_default.updateInvoice(id, data).then((invoice) => res.status(200).json(invoice)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteInvoice(req, res) {
    const { id } = req.params;
    return await invoiceServices_default.deleteInvoice(id).then((invoice) => res.status(200).json(invoice)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var invoiceController_default = new InvoiceController();

// src/routes/invoiceRoutes.ts
var router14 = express14.Router();
router14.get("/", invoiceController_default.getAllInvoices);
router14.get("/:id", invoiceController_default.getInvoiceById);
router14.post("/", invoiceController_default.createInvoice);
router14.put("/:id", invoiceController_default.updateInvoice);
router14.delete("/:id", invoiceController_default.deleteInvoice);
var invoiceRoutes_default = router14;

// src/routes/paymentRoutes.ts
import express15 from "express";

// src/repositories/paymentRepo.ts
var PaymentRepository = class {
  async getAllPayments() {
    return await prisma.payments.findMany();
  }
  async getPaymentById(id) {
    return await prisma.payments.findUnique({
      where: { id }
    });
  }
  async getPaymentsByBookingId(bookingId) {
    return await prisma.payments.findMany({
      where: { booking_id: bookingId }
    });
  }
  async getPaymentsByInvoiceId(invoiceId) {
    return await prisma.payments.findMany({
      where: { invoice_id: invoiceId }
    });
  }
  async getPaymentsByStatus(status) {
    return await prisma.payments.findMany({
      where: { status }
    });
  }
  async createPayment(data) {
    return await prisma.payments.create({
      data
    });
  }
  async updatePayment(id, data) {
    return await prisma.payments.update({
      where: { id },
      data
    });
  }
  async deletePayment(id) {
    return await prisma.payments.delete({
      where: { id }
    });
  }
};
var paymentRepo_default = new PaymentRepository();

// src/services/paymentServices.ts
var PaymentService = class {
  async getAllPayments() {
    return await paymentRepo_default.getAllPayments();
  }
  async getPaymentById(id) {
    const validator = new Validator();
    validator.isUUID("Payment ID", id);
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await paymentRepo_default.getPaymentById(id);
  }
  async getPaymentsByBookingId(bookingId) {
    const validator = new Validator();
    if (!validator.isEmpty("Booking ID", bookingId)) {
      if (validator.isUUID("Booking ID", bookingId)) {
        const booking = await bookingRepo_default.getBookingById(bookingId);
        if (!booking) {
          throw new ValidationError("404", "Booking not found");
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await paymentRepo_default.getPaymentsByBookingId(bookingId);
  }
  async getPaymentsByInvoiceId(invoiceId) {
    const validator = new Validator();
    if (!validator.isEmpty("Invoice ID", invoiceId)) {
      if (validator.isUUID("Invoice ID", invoiceId)) {
        const invoice = await invoiceRepo_default.getInvoiceById(invoiceId);
        if (!invoice) {
          throw new ValidationError("404", "Invoice not found");
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await paymentRepo_default.getPaymentsByInvoiceId(invoiceId);
  }
  async createPayment(data) {
    const validatedData = {
      ...data.booking_id && { booking_id: data.booking_id },
      ...data.invoice_id && { invoice_id: data.invoice_id },
      ...data.payment_method && { payment_method: data.payment_method },
      ...data.status && { status: data.status },
      ...data.amount && { amount: data.amount },
      ...data.is_deposit !== void 0 && { is_deposit: data.is_deposit },
      ...data.transaction_ref && { transaction_ref: data.transaction_ref },
      ...data.processed_by && { processed_by: data.processed_by },
      ...data.notes && { notes: data.notes }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Booking ID", validatedData.booking_id))
      validator.isUUID("Booking ID", validatedData.booking_id);
    if (!validator.isEmpty("Payment Method", validatedData.payment_method))
      validator.validatePaymentMethod(validatedData.payment_method);
    if (!validator.isEmpty("Amount", validatedData.amount)) {
      validator.isDecimal("Amount", validatedData.amount);
      validator.isPositiveNumber("Amount", validatedData.amount);
    }
    if (validatedData.invoice_id) {
      validator.isUUID("Invoice ID", validatedData.invoice_id);
    }
    if (validatedData.status) {
      validator.validatePaymentStatus(validatedData.status);
    }
    if (validatedData.is_deposit !== void 0) {
      validator.isBoolean("Is Deposit", validatedData.is_deposit);
    }
    if (validatedData.processed_by) {
      validator.isUUID("Processed By", validatedData.processed_by);
    }
    if (validatedData.transaction_ref) {
      validator.isString("Transaction Reference", validatedData.transaction_ref);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatedData.booking_id) {
      const booking = await bookingRepo_default.getBookingById(validatedData.booking_id);
      if (!booking) {
        throw new ValidationError("404", "Booking not found");
      }
    }
    if (validatedData.invoice_id) {
      const invoice = await invoiceRepo_default.getInvoiceById(validatedData.invoice_id);
      if (!invoice) {
        throw new ValidationError("404", "Invoice not found");
      }
    }
    if (validatedData.processed_by) {
      const account = await accountRepo_default.getAccountById(validatedData.processed_by);
      if (!account) {
        throw new ValidationError("404", "Processed by not found");
      }
    }
    return await paymentRepo_default.createPayment(validatedData);
  }
  async updatePayment(id, data) {
    const validator = new Validator();
    validator.isUUID("Payment ID", id);
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const existingPayment = await paymentRepo_default.getPaymentById(id);
    if (!existingPayment) {
      throw new ValidationError("404", "Payment not found");
    }
    const validatedData = {
      ...data.payment_method && { payment_method: data.payment_method },
      ...data.status && { status: data.status },
      ...data.amount && { amount: data.amount },
      ...data.is_deposit !== void 0 && { is_deposit: data.is_deposit },
      ...data.transaction_ref && { transaction_ref: data.transaction_ref },
      ...data.paid_at && { paid_at: data.paid_at },
      ...data.processed_by && { processed_by: data.processed_by },
      ...data.updated_at && { updated_at: data.updated_at },
      ...data.notes && { notes: data.notes }
    };
    if (validatedData.transaction_ref) {
      validator.isString("Transaction Reference", validatedData.transaction_ref);
    }
    if (validatedData.payment_method) {
      validator.validatePaymentMethod(validatedData.payment_method);
    }
    if (validatedData.status) {
      validator.validatePaymentStatus(validatedData.status);
    }
    if (validatedData.amount) {
      validator.isDecimal("Amount", validatedData.amount);
      validator.isPositiveNumber("Amount", validatedData.amount);
    }
    if (validatedData.is_deposit !== void 0) {
      validator.isBoolean("Is Deposit", validatedData.is_deposit);
    }
    if (validatedData.processed_by) {
      validator.isUUID("Processed By", validatedData.processed_by);
    }
    if (validatedData.paid_at) {
      validator.validateDate(validatedData.paid_at);
    }
    if (validatedData.updated_at) {
      validator.validateDate(validatedData.updated_at);
    }
    if (validatedData.processed_by) {
      validator.isUUID("Processed By", validatedData.processed_by);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatedData.processed_by) {
      const account = await accountRepo_default.getAccountById(validatedData.processed_by);
      if (!account) {
        throw new ValidationError("404", "Processed by not found");
      }
    }
    ;
    return await paymentRepo_default.updatePayment(id, validatedData);
  }
  async deletePayment(id) {
    return await paymentRepo_default.deletePayment(id);
  }
};
var paymentServices_default = new PaymentService();

// src/controllers/paymentController.ts
var PaymentController = class {
  async getAllPayments(req, res) {
    return await paymentServices_default.getAllPayments().then((payments) => res.status(200).json(payments)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getPaymentById(req, res) {
    const { id } = req.params;
    return await paymentServices_default.getPaymentById(id).then((payment) => {
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.status(200).json(payment);
    }).catch((error) => {
      if (typeof parseInt(error.code) === "number") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async getPaymentsByBookingId(req, res) {
    const { id } = req.params;
    return await paymentServices_default.getPaymentsByBookingId(id).then((payments) => res.status(200).json(payments)).catch((error) => {
      if (typeof parseInt(error.code) === "number") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async getPaymentsByInvoiceId(req, res) {
    const { id } = req.params;
    return await paymentServices_default.getPaymentsByInvoiceId(id).then((payments) => res.status(200).json(payments)).catch((error) => {
      if (typeof parseInt(error.code) === "number") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createPayment(req, res) {
    const { booking_id, invoice_id, payment_method, status, amount, is_deposit, transaction_ref, processed_by, notes } = req.body;
    const data = { booking_id, invoice_id, payment_method, status, amount, is_deposit, transaction_ref, processed_by, notes };
    return await paymentServices_default.createPayment(data).then((payment) => res.status(201).json(payment)).catch((error) => {
      if (typeof parseInt(error.code) === "number") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updatePayment(req, res) {
    const { id } = req.params;
    const { payment_method, status, amount, is_deposit, transaction_ref, paid_at, processed_by, notes, updated_at } = req.body;
    const data = { payment_method, status, amount, is_deposit, transaction_ref, paid_at, processed_by, notes, updated_at };
    return await paymentServices_default.updatePayment(id, data).then((payment) => res.status(200).json(payment)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deletePayment(req, res) {
    const { id } = req.params;
    return await paymentServices_default.deletePayment(id).then((payment) => res.status(200).json(payment)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var paymentController_default = new PaymentController();

// src/routes/paymentRoutes.ts
var router15 = express15.Router();
router15.get("/booking/:id", paymentController_default.getPaymentsByBookingId);
router15.get("/invoice/:id", paymentController_default.getPaymentsByInvoiceId);
router15.get("/", paymentController_default.getAllPayments);
router15.get("/:id", paymentController_default.getPaymentById);
router15.post("/", paymentController_default.createPayment);
router15.put("/:id", paymentController_default.updatePayment);
router15.delete("/:id", paymentController_default.deletePayment);
var paymentRoutes_default = router15;

// src/routes/fineItemRoutes.ts
import express16 from "express";

// src/repositories/fineItemRepo.ts
var FineItemRepository = class {
  async getAllFineItems() {
    return await prisma.fine_items.findMany();
  }
  async getFineItemById(id) {
    return await prisma.fine_items.findUnique({
      where: { id }
    });
  }
  async getFineItemsByBranchId(branchId) {
    return await prisma.fine_items.findMany({
      where: { branch_id: branchId }
    });
  }
  async createFineItem(data) {
    return await prisma.fine_items.create({
      data
    });
  }
  async updateFineItem(id, data) {
    return await prisma.fine_items.update({
      where: { id },
      data
    });
  }
  async deleteFineItem(id) {
    return await prisma.fine_items.delete({
      where: { id }
    });
  }
};
var fineItemRepo_default = new FineItemRepository();

// src/services/fineItemServices.ts
var FineItemService = class {
  async getAllFineItems() {
    return await fineItemRepo_default.getAllFineItems();
  }
  async getFineItemById(id) {
    const validator = new Validator();
    if (!validator.isUUID("Fine Item ID", id))
      throw new ValidationError("400", "Fine Item ID must be a valid UUID");
    return await fineItemRepo_default.getFineItemById(id);
  }
  async getFineItemsByBranchId(branchId) {
    const validator = new Validator();
    if (!validator.isUUID("Branch ID", branchId))
      throw new ValidationError("400", "Branch ID must be a valid UUID");
    return await fineItemRepo_default.getFineItemsByBranchId(branchId);
  }
  async createFineItem(data) {
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.name && { name: data.name },
      ...data.description && { description: data.description },
      ...data.price && { price: data.price }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Name", validatedData.name)) {
      validator.isString("Name", validatedData.name);
      validator.maxLength("Name", validatedData.name, 200);
    }
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
    }
    if (!validator.isEmpty("Price", validatedData.price)) {
      validator.isDecimal("Price", validatedData.price);
      validator.isPositiveNumber("Price", validatedData.price);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatedData.branch_id) {
      if (validator.isUUID("Branch ID", validatedData.branch_id)) {
        const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
        if (!branchExists) {
          validator.pushError("Branch ID does not exist");
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await fineItemRepo_default.createFineItem(validatedData);
  }
  async updateFineItem(id, data) {
    const validator = new Validator();
    if (!validator.isEmpty("Fine Item ID", id)) {
      if (validator.isUUID("Fine Item ID", id)) {
        const existingFineItem = await fineItemRepo_default.getFineItemById(id);
        if (!existingFineItem) {
          throw new ValidationError("404", "Fine item not found");
        }
      }
    }
    const validatedData = {
      ...data.branch_id && { branch_id: data.branch_id },
      ...data.name && { name: data.name },
      ...data.description && { description: data.description },
      ...data.price && { price: data.price }
    };
    if (validatedData.name) {
      validator.isString("Name", validatedData.name);
      validator.maxLength("Name", validatedData.name, 200);
    }
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
    }
    if (validatedData.price) {
      validator.isDecimal("Price", validatedData.price);
      validator.isPositiveNumber("Price", validatedData.price);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    if (validatedData.branch_id) {
      if (validator.isUUID("Branch ID", validatedData.branch_id)) {
        const branchExists = await branchRepo_default.getBranchById(validatedData.branch_id);
        if (!branchExists) {
          throw new ValidationError("400", "Branch ID does not exist");
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await fineItemRepo_default.updateFineItem(id, validatedData);
  }
  async deleteFineItem(id) {
    return await fineItemRepo_default.deleteFineItem(id);
  }
};
var fineItemServices_default = new FineItemService();

// src/controllers/fineItemController.ts
var FineItemController = class {
  async getAllFineItems(req, res) {
    return await fineItemServices_default.getAllFineItems().then((items) => res.status(200).json(items)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getFineItemById(req, res) {
    const { id } = req.params;
    return await fineItemServices_default.getFineItemById(id).then((item) => {
      if (!item) {
        return res.status(404).json({ error: "Fine item not found" });
      }
      res.status(200).json(item);
    }).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async getFineItemsByBranchId(req, res) {
    const { id } = req.params;
    return await fineItemServices_default.getFineItemsByBranchId(id).then((items) => res.status(200).json(items)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createFineItem(req, res) {
    const { branch_id, name, description, price } = req.body;
    const data = { branch_id, name, description, price };
    return await fineItemServices_default.createFineItem(data).then((item) => res.status(201).json(item)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateFineItem(req, res) {
    const { id } = req.params;
    const { branch_id, name, description, price } = req.body;
    const data = { branch_id, name, description, price };
    return await fineItemServices_default.updateFineItem(id, data).then((item) => res.status(200).json(item)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteFineItem(req, res) {
    const { id } = req.params;
    return await fineItemServices_default.deleteFineItem(id).then((item) => res.status(200).json(item)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var fineItemController_default = new FineItemController();

// src/routes/fineItemRoutes.ts
var router16 = express16.Router();
router16.get("/branch/:id", fineItemController_default.getFineItemsByBranchId);
router16.get("/", fineItemController_default.getAllFineItems);
router16.get("/:id", fineItemController_default.getFineItemById);
router16.post("/", fineItemController_default.createFineItem);
router16.put("/:id", fineItemController_default.updateFineItem);
router16.delete("/:id", fineItemController_default.deleteFineItem);
var fineItemRoutes_default = router16;

// src/routes/invoiceFineRoutes.ts
import express17 from "express";

// src/repositories/invoiceFineRepo.ts
var InvoiceFineRepository = class {
  async getAllInvoiceFines() {
    return await prisma.invoice_fines.findMany({
      include: {
        fine_items: {
          select: {
            name: true,
            price: true,
            description: true
          }
        }
      }
    });
  }
  async getInvoiceFineById(id) {
    return await prisma.invoice_fines.findUnique({
      where: { id },
      include: {
        fine_items: {
          select: {
            name: true,
            price: true,
            description: true
          }
        }
      }
    });
  }
  async getInvoiceFinesByInvoiceId(invoiceId) {
    return await prisma.invoice_fines.findMany({
      where: { invoice_id: invoiceId },
      include: {
        fine_items: {
          select: {
            name: true,
            price: true,
            description: true
          }
        }
      }
    });
  }
  async getInvoiceFinesByFineItemId(fineItemId) {
    return await prisma.invoice_fines.findMany({
      where: { fine_item_id: fineItemId }
    });
  }
  async createInvoiceFine(data) {
    return await prisma.invoice_fines.create({
      data
    });
  }
  async updateInvoiceFine(id, data) {
    return await prisma.invoice_fines.update({
      where: { id },
      data
    });
  }
  async deleteInvoiceFine(id) {
    return await prisma.invoice_fines.delete({
      where: { id }
    });
  }
};
var invoiceFineRepo_default = new InvoiceFineRepository();

// src/services/invoiceFineServices.ts
var InvoiceFineService = class {
  async getAllInvoiceFines() {
    return await invoiceFineRepo_default.getAllInvoiceFines();
  }
  async getInvoiceFineById(id) {
    const validator = new Validator();
    if (!validator.isEmpty("Invoice Fine ID", id)) {
      validator.isUUID("Invoice Fine ID", id);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await invoiceFineRepo_default.getInvoiceFineById(id);
  }
  async getInvoiceFinesByInvoiceId(invoiceId) {
    const validator = new Validator();
    if (!validator.isEmpty("Invoice ID", invoiceId)) {
      if (validator.isUUID("Invoice ID", invoiceId)) {
        const invoice = await invoiceRepo_default.getInvoiceById(invoiceId);
        if (!invoice) {
          throw new ValidationError("404", "Invoice not found");
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await invoiceFineRepo_default.getInvoiceFinesByInvoiceId(invoiceId);
  }
  async createInvoiceFine(data) {
    const validatedData = {
      ...data.invoice_id && { invoice_id: data.invoice_id },
      ...data.fine_item_id && { fine_item_id: data.fine_item_id },
      ...data.description && { description: data.description },
      ...data.amount && { amount: data.amount },
      ...data.added_by && { added_by: data.added_by }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Invoice ID", validatedData.invoice_id)) {
      if (validator.isUUID("Invoice ID", validatedData.invoice_id)) {
        const invoice = await invoiceRepo_default.getInvoiceById(validatedData.invoice_id);
        if (!invoice) {
          throw new ValidationError("404", "Invoice not found");
        }
      }
    }
    if (validatedData.fine_item_id) {
      if (validator.isUUID("Fine Item ID", validatedData.fine_item_id)) {
        const fineItem = await fineItemRepo_default.getFineItemById(validatedData.fine_item_id);
        if (!fineItem) {
          throw new ValidationError("404", "Fine item not found");
        }
      }
    }
    if (validatedData.added_by) {
      if (validator.isUUID("Added By", validatedData.added_by)) {
        const staffAccount = await accountRepo_default.getAccountById(validatedData.added_by);
        if (!staffAccount) {
          throw new ValidationError("404", "Added by not found");
        }
      }
    }
    validator.isString("Description", validatedData.description);
    validator.maxLength("Description", validatedData.description, 300);
    validator.isDecimal("Amount", validatedData.amount);
    validator.isPositiveNumber("Amount", validatedData.amount);
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    return await invoiceFineRepo_default.createInvoiceFine(validatedData);
  }
  async updateInvoiceFine(id, data) {
    const validator = new Validator();
    if (!validator.isEmpty("Invoice Fine ID", id)) {
      validator.isUUID("Invoice Fine ID", id);
    }
    const validatedData = {
      ...data.fine_item_id && { fine_item_id: data.fine_item_id },
      ...data.description && { description: data.description },
      ...data.amount && { amount: data.amount },
      ...data.added_by && { added_by: data.added_by }
    };
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
      validator.maxLength("Description", validatedData.description, 300);
    }
    if (validatedData.amount) {
      validator.isDecimal("Amount", validatedData.amount);
      validator.isPositiveNumber("Amount", validatedData.amount);
    }
    if (validatedData.fine_item_id) {
      validator.isUUID("Fine Item ID", validatedData.fine_item_id);
    }
    if (validatedData.added_by) {
      validator.isUUID("Added By", validatedData.added_by);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const existingInvoiceFine = await invoiceFineRepo_default.getInvoiceFineById(id);
    if (!existingInvoiceFine) {
      throw new ValidationError("404", "Invoice fine not found");
    }
    if (validatedData.fine_item_id) {
      const fineItem = await fineItemRepo_default.getFineItemById(validatedData.fine_item_id);
      if (!fineItem) {
        throw new ValidationError("404", "Fine item not found");
      }
    }
    if (validatedData.added_by) {
      const staffAccount = await accountRepo_default.getAccountById(validatedData.added_by);
      if (!staffAccount) {
        throw new ValidationError("404", "Added by not found");
      }
    }
    return await invoiceFineRepo_default.updateInvoiceFine(id, validatedData);
  }
  async deleteInvoiceFine(id) {
    return await invoiceFineRepo_default.deleteInvoiceFine(id);
  }
};
var invoiceFineServices_default = new InvoiceFineService();

// src/controllers/invoiceFineController.ts
var InvoiceFineController = class {
  async getAllInvoiceFines(req, res) {
    return await invoiceFineServices_default.getAllInvoiceFines().then((fines) => res.status(200).json(fines)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getInvoiceFinesByInvoiceId(req, res) {
    const { id } = req.params;
    return await invoiceFineServices_default.getInvoiceFinesByInvoiceId(id).then((fines) => res.status(200).json(fines)).catch((error) => {
      if (typeof parseInt(error.code) === "number") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async getInvoiceFineById(req, res) {
    const { id } = req.params;
    return await invoiceFineServices_default.getInvoiceFineById(id).then((fine) => {
      if (!fine) {
        return res.status(404).json({ error: "Invoice fine not found" });
      }
      res.status(200).json(fine);
    }).catch((error) => {
      if (typeof parseInt(error.code) === "number") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createInvoiceFine(req, res) {
    const { invoice_id, fine_item_id, description, amount, added_by } = req.body;
    const data = { invoice_id, fine_item_id, description, amount, added_by };
    return await invoiceFineServices_default.createInvoiceFine(data).then((fine) => res.status(201).json(fine)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async updateInvoiceFine(req, res) {
    const { id } = req.params;
    const { fine_item_id, description, amount, added_by } = req.body;
    const data = { fine_item_id, description, amount, added_by };
    return await invoiceFineServices_default.updateInvoiceFine(id, data).then((fine) => res.status(200).json(fine)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error_code: error.code, error: error.message });
    });
  }
  async deleteInvoiceFine(req, res) {
    const { id } = req.params;
    return await invoiceFineServices_default.deleteInvoiceFine(id).then((fine) => res.status(200).json(fine)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var invoiceFineController_default = new InvoiceFineController();

// src/routes/invoiceFineRoutes.ts
var router17 = express17.Router();
router17.get("/invoice/:id", invoiceFineController_default.getInvoiceFinesByInvoiceId);
router17.get("/", invoiceFineController_default.getAllInvoiceFines);
router17.get("/:id", invoiceFineController_default.getInvoiceFineById);
router17.post("/", invoiceFineController_default.createInvoiceFine);
router17.put("/:id", invoiceFineController_default.updateInvoiceFine);
router17.delete("/:id", invoiceFineController_default.deleteInvoiceFine);
var invoiceFineRoutes_default = router17;

// src/routes/historyTransactionRoutes.ts
import express18 from "express";

// src/repositories/historyTransactionRepo.ts
var HistoryTransactionRepository = class {
  async getAllTransactions() {
    return await prisma.history_transaction.findMany({
      orderBy: { created_at: "desc" }
    });
  }
  async getTransactionById(id) {
    return await prisma.history_transaction.findUnique({
      where: { id }
    });
  }
  async getTransactionsByAccountId(accountId) {
    return await prisma.history_transaction.findMany({
      where: { account_id: accountId },
      orderBy: { created_at: "desc" }
    });
  }
  async getTransactionsByTargetType(targetType) {
    return await prisma.history_transaction.findMany({
      where: { target_type: targetType },
      orderBy: { created_at: "desc" }
    });
  }
  async createTransaction(data) {
    return await prisma.history_transaction.create({
      data
    });
  }
  async deleteTransaction(id) {
    return await prisma.history_transaction.delete({
      where: { id }
    });
  }
};
var historyTransactionRepo_default = new HistoryTransactionRepository();

// src/services/historyTransactionServices.ts
var HistoryTransactionService = class {
  async getAllTransactions() {
    const result = await historyTransactionRepo_default.getAllTransactions();
    const response = result.map((transaction) => ({
      ...transaction,
      id: transaction.id.toString()
    }));
    return response;
  }
  async getTransactionById(id) {
    const result = await historyTransactionRepo_default.getTransactionById(id);
    if (!result) {
      throw new ValidationError("404", "Transaction not found");
    }
    return {
      ...result,
      id: result.id.toString()
    };
  }
  async getTransactionsByAccountId(accountId) {
    const validator = new Validator();
    if (!validator.isEmpty("Account ID", accountId)) {
      if (validator.isUUID("Account ID", accountId)) {
        const account = await staffRepo_default.getStaffByAccountId(accountId);
        if (!account) {
          throw new ValidationError("404", "Account ID does not exist");
        }
      }
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const result = await historyTransactionRepo_default.getTransactionsByAccountId(accountId);
    const response = result.map((transaction) => ({
      ...transaction,
      id: transaction.id.toString()
    }));
    return response;
  }
  async createTransaction(data) {
    const validatedData = {
      ...data.account_id && { account_id: data.account_id },
      ...data.action && { action: data.action },
      ...data.target_type && { target_type: data.target_type },
      ...data.target_id && { target_id: data.target_id },
      ...data.description && { description: data.description },
      ...data.metadata && { metadata: data.metadata }
    };
    const validator = new Validator();
    if (!validator.isEmpty("Account ID", validatedData.account_id)) {
      if (validator.isUUID("Account ID", validatedData.account_id)) {
        const account = await staffRepo_default.getStaffByAccountId(validatedData.account_id);
        if (!account) {
          throw new ValidationError("404", "Account ID does not exist");
        }
      }
    }
    if (!validator.isEmpty("Action", validatedData.action)) {
      validator.isString("Action", validatedData.action);
      validator.maxLength("Action", validatedData.action, 100);
    }
    if (validatedData.target_type) {
      validator.isString("Target Type", validatedData.target_type);
      validator.maxLength("Target Type", validatedData.target_type, 100);
    }
    if (validatedData.target_id) {
      validator.isUUID("Target ID", validatedData.target_id);
    }
    if (validatedData.description) {
      validator.isString("Description", validatedData.description);
    }
    if (validator.error.length > 0) {
      throw new ValidationError("400", validator.clearError());
    }
    const result = await historyTransactionRepo_default.createTransaction(validatedData);
    const response = {
      ...result,
      id: result.id.toString()
    };
    return response;
  }
  async deleteTransaction(id) {
    return await historyTransactionRepo_default.deleteTransaction(id);
  }
};
var historyTransactionServices_default = new HistoryTransactionService();

// src/controllers/historyTransactionController.ts
var HistoryTransactionController = class {
  async getAllTransactions(req, res) {
    return await historyTransactionServices_default.getAllTransactions().then((transactions) => res.status(200).json(transactions)).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getTransactionById(req, res) {
    const { id } = req.params;
    return await historyTransactionServices_default.getTransactionById(id).then((transaction) => {
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.status(200).json(transaction);
    }).catch((error) => res.status(500).json({ error: error.message }));
  }
  async getTransactionsByAccountId(req, res) {
    const { id } = req.params;
    return await historyTransactionServices_default.getTransactionsByAccountId(id).then((transactions) => res.status(200).json(transactions)).catch((error) => {
      if (typeof parseInt(error.code) === "number") {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async createTransaction(req, res) {
    const { account_id, action, target_type, target_id, description, metadata } = req.body;
    const data = { account_id, action, target_type, target_id, description, metadata };
    return await historyTransactionServices_default.createTransaction(data).then((transaction) => res.status(201).json(transaction)).catch((error) => {
      if (error.code !== 500) {
        return res.status(parseInt(error.code)).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
  async deleteTransaction(req, res) {
    const { id } = req.params;
    return await historyTransactionServices_default.deleteTransaction(id).then((transaction) => res.status(200).json(transaction)).catch((error) => {
      if (error.code === "P2025") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    });
  }
};
var historyTransactionController_default = new HistoryTransactionController();

// src/routes/historyTransactionRoutes.ts
var router18 = express18.Router();
router18.get("/account/:id", historyTransactionController_default.getTransactionsByAccountId);
router18.get("/", historyTransactionController_default.getAllTransactions);
router18.get("/:id", historyTransactionController_default.getTransactionById);
router18.post("/", historyTransactionController_default.createTransaction);
router18.delete("/:id", historyTransactionController_default.deleteTransaction);
var historyTransactionRoutes_default = router18;

// src/routes/index.ts
var routes_default = {
  branchRoutes: branchRoutes_default,
  roomTypeRoutes: roomTypeRoutes_default,
  roomRoutes: roomRoutes_default,
  roomPriceRoutes: roomPriceRoutes_default,
  roomServiceRoutes: roomServiceRoutes_default,
  discountRoutes: discountRoutes_default,
  accountRoutes: accountRoutes_default,
  customerRoutes: customerRoutes_default,
  staffRoutes: staffRoutes_default,
  bookingRoutes: bookingRoutes_default,
  bookingServiceRoutes: bookingServiceRoutes_default,
  cancellationRequestRoutes: cancellationRequestRoutes_default,
  holidayDateRoutes: holidayDateRoutes_default,
  invoiceRoutes: invoiceRoutes_default,
  paymentRoutes: paymentRoutes_default,
  fineItemRoutes: fineItemRoutes_default,
  invoiceFineRoutes: invoiceFineRoutes_default,
  historyTransactionRoutes: historyTransactionRoutes_default
};

// src/app.ts
var app = express19();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express19.json());
app.use("/branches", routes_default.branchRoutes);
app.use("/room-types", routes_default.roomTypeRoutes);
app.use("/rooms", routes_default.roomRoutes);
app.use("/room-prices", routes_default.roomPriceRoutes);
app.use("/services", routes_default.roomServiceRoutes);
app.use("/discounts", routes_default.discountRoutes);
app.use("/accounts", routes_default.accountRoutes);
app.use("/customers", routes_default.customerRoutes);
app.use("/staff", routes_default.staffRoutes);
app.use("/bookings", routes_default.bookingRoutes);
app.use("/booking-services", routes_default.bookingServiceRoutes);
app.use("/cancellation-requests", routes_default.cancellationRequestRoutes);
app.use("/holiday-dates", routes_default.holidayDateRoutes);
app.use("/invoices", routes_default.invoiceRoutes);
app.use("/payments", routes_default.paymentRoutes);
app.use("/fine-items", routes_default.fineItemRoutes);
app.use("/invoice-fines", routes_default.invoiceFineRoutes);
app.use("/history-transactions", routes_default.historyTransactionRoutes);
var app_default = app;

// src/server.ts
import dotenv2 from "dotenv";
var envFile2 = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv2.config({ path: envFile2 });
var PORT = process.env.PORT || 3e3;
app_default.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
