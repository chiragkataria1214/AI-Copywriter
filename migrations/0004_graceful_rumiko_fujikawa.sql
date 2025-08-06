CREATE TABLE "landing_page_frameworks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text NOT NULL,
	"content_sequence" jsonb,
	"reason_structure" jsonb,
	"optimization_rules" jsonb,
	"real_examples" jsonb,
	"system_prompt" text NOT NULL,
	"output_requirements" text,
	"images" jsonb,
	"is_active" varchar DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "landing_page_frameworks_name_unique" UNIQUE("name")
);
