CREATE TABLE "user_daily_quest" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"login_streak" integer DEFAULT 1 NOT NULL,
	"login_claimed" boolean DEFAULT false NOT NULL,
	"claimed_quest_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"all_claimed" boolean DEFAULT false NOT NULL,
	"ads_watched_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_daily_quest" ADD CONSTRAINT "user_daily_quest_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_daily_quest_user_date_idx" ON "user_daily_quest" USING btree ("user_id","date");