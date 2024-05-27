ALTER TABLE "password_reset_token" ALTER COLUMN "token_hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_token" ALTER COLUMN "user_id" SET NOT NULL;