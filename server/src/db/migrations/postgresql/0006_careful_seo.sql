CREATE TABLE "seo_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" uuid NOT NULL,
	"meta_title" varchar(255) NOT NULL,
	"meta_description" text NOT NULL,
	"og_title" varchar(255),
	"og_description" text,
	"og_image_url" text,
	"canonical_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "seo_metadata_blog_post_id_unique_idx" ON "seo_metadata" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "seo_metadata_blog_post_id_idx" ON "seo_metadata" USING btree ("blog_post_id");
