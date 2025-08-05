-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_copy" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"input_text" text,
	"landing_page_url" varchar,
	"target_persona" varchar,
	"brand_dr_balance" integer,
	"headlines" jsonb,
	"primary_text" text,
	"config_snapshot" jsonb,
	"rating" varchar,
	"feedback" text,
	"generation_time_ms" integer,
	"tokens_used" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" varchar DEFAULT 'team_member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"is_active" varchar DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_claims" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"claim_text" text NOT NULL,
	"claim_type" varchar NOT NULL,
	"is_enabled" varchar DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_claims_claim_type_check" CHECK ((claim_type)::text = ANY ((ARRAY['approved'::character varying, 'prohibited'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"is_active" varchar DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "persona_pillars" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" varchar NOT NULL,
	"pillar_text" text NOT NULL,
	"is_enabled" varchar DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brand_configuration" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_type" varchar NOT NULL,
	"config_value" text NOT NULL,
	"is_enabled" varchar DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "brand_configuration_config_type_check" CHECK ((config_type)::text = ANY ((ARRAY['core_positioning'::character varying, 'brand_voice'::character varying, 'key_terminology'::character varying, 'approved_language'::character varying, 'avoided_language'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "copy_frameworks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"framework_type" varchar NOT NULL,
	"name" varchar,
	"description" text,
	"template" text,
	"examples" jsonb,
	"rule_text" text,
	"is_enabled" varchar DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "copy_frameworks_framework_type_check" CHECK ((framework_type)::text = ANY ((ARRAY['headline_framework'::character varying, 'primary_text_rule'::character varying, 'brand_first_guideline'::character varying, 'direct_response_guideline'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "system_configuration" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_key" varchar NOT NULL,
	"config_value" text NOT NULL,
	"config_description" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_image_analysis" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"image_path" varchar NOT NULL,
	"selected_framework" varchar NOT NULL,
	"ai_analysis" text NOT NULL,
	"extracted_elements" jsonb,
	"confidence" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_frameworks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text NOT NULL,
	"structure" text NOT NULL,
	"key_elements" text,
	"system_prompt" text NOT NULL,
	"is_active" varchar DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"framework_content" text,
	CONSTRAINT "email_frameworks_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_briefs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"notes" text NOT NULL,
	"google_drive_links" jsonb,
	"generated_brief" text NOT NULL,
	"config_snapshot" jsonb,
	"generation_time_ms" integer,
	"tokens_used" integer,
	"rating" varchar,
	"feedback" text,
	"was_edited" varchar DEFAULT 'false',
	"final_version" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "generated_copy" ADD CONSTRAINT "generated_copy_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_claims" ADD CONSTRAINT "product_claims_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_pillars" ADD CONSTRAINT "persona_pillars_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_image_analysis" ADD CONSTRAINT "email_image_analysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_image_analysis" ADD CONSTRAINT "email_image_analysis_selected_framework_fkey" FOREIGN KEY ("selected_framework") REFERENCES "public"."email_frameworks"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire" timestamp_ops);
*/