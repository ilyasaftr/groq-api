CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"organization_id" text NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "api_keys_email_unique" UNIQUE("email"),
	CONSTRAINT "api_keys_organization_id_unique" UNIQUE("organization_id"),
	CONSTRAINT "api_keys_token_unique" UNIQUE("token")
);
