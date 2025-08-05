DROP INDEX "IDX_brand_configuration_type";--> statement-breakpoint
DROP INDEX "IDX_brand_configuration_enabled";--> statement-breakpoint
DROP INDEX "IDX_copy_frameworks_type";--> statement-breakpoint
DROP INDEX "IDX_copy_frameworks_enabled";--> statement-breakpoint
DROP INDEX "IDX_persona_pillars_persona_id";--> statement-breakpoint
DROP INDEX "IDX_product_claims_product_id";--> statement-breakpoint
DROP INDEX "IDX_product_claims_type";--> statement-breakpoint
DROP INDEX "IDX_system_configuration_key";--> statement-breakpoint
ALTER TABLE "email_frameworks" ADD COLUMN "custom_length" varchar;