-- CreateTable
CREATE TABLE "password_reset_token" (
    "account_id" UUID NOT NULL,
    "token_hash" VARCHAR(500) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("account_id")
);

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
