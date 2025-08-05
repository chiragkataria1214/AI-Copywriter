ALTER TABLE "email_frameworks" DROP CONSTRAINT "email_frameworks_name_key";--> statement-breakpoint
ALTER TABLE "product_claims" DROP CONSTRAINT "product_claims_claim_type_check";--> statement-breakpoint
ALTER TABLE "brand_configuration" DROP CONSTRAINT "brand_configuration_config_type_check";--> statement-breakpoint
ALTER TABLE "copy_frameworks" DROP CONSTRAINT "copy_frameworks_framework_type_check";--> statement-breakpoint
ALTER TABLE "product_claims" DROP CONSTRAINT "product_claims_product_id_fkey";
--> statement-breakpoint
ALTER TABLE "persona_pillars" DROP CONSTRAINT "persona_pillars_persona_id_fkey";
--> statement-breakpoint
ALTER TABLE "email_image_analysis" DROP CONSTRAINT "email_image_analysis_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "email_image_analysis" DROP CONSTRAINT "email_image_analysis_selected_framework_fkey";
--> statement-breakpoint
DROP INDEX "IDX_session_expire";--> statement-breakpoint
ALTER TABLE "email_frameworks" ADD COLUMN "output_requirements" text;--> statement-breakpoint
ALTER TABLE "email_frameworks" ADD COLUMN "expected_length" varchar;--> statement-breakpoint
ALTER TABLE "product_claims" ADD CONSTRAINT "product_claims_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_pillars" ADD CONSTRAINT "persona_pillars_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_image_analysis" ADD CONSTRAINT "email_image_analysis_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_image_analysis" ADD CONSTRAINT "email_image_analysis_selected_framework_email_frameworks_name_fk" FOREIGN KEY ("selected_framework") REFERENCES "public"."email_frameworks"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_briefs" ADD CONSTRAINT "product_briefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_product_claims_product_id" ON "product_claims" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "IDX_product_claims_type" ON "product_claims" USING btree ("claim_type");--> statement-breakpoint
CREATE INDEX "IDX_persona_pillars_persona_id" ON "persona_pillars" USING btree ("persona_id");--> statement-breakpoint
CREATE INDEX "IDX_brand_configuration_type" ON "brand_configuration" USING btree ("config_type");--> statement-breakpoint
CREATE INDEX "IDX_brand_configuration_enabled" ON "brand_configuration" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "IDX_copy_frameworks_type" ON "copy_frameworks" USING btree ("framework_type");--> statement-breakpoint
CREATE INDEX "IDX_copy_frameworks_enabled" ON "copy_frameworks" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "IDX_system_configuration_key" ON "system_configuration" USING btree ("config_key");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "personas" ADD CONSTRAINT "personas_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "system_configuration" ADD CONSTRAINT "system_configuration_config_key_unique" UNIQUE("config_key");--> statement-breakpoint
ALTER TABLE "email_frameworks" ADD CONSTRAINT "email_frameworks_name_unique" UNIQUE("name");