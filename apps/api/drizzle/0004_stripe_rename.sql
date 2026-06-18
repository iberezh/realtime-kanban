ALTER TABLE "accounts" RENAME COLUMN "lemon_customer_id" TO "stripe_customer_id";
--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "lemon_subscription_id" TO "stripe_subscription_id";
