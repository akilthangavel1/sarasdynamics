CREATE TABLE `seo_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_post_id` text NOT NULL,
	`meta_title` text NOT NULL,
	`meta_description` text NOT NULL,
	`og_title` text,
	`og_description` text,
	`og_image_url` text,
	`canonical_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seo_metadata_blog_post_id_unique_idx` ON `seo_metadata` (`blog_post_id`);--> statement-breakpoint
CREATE INDEX `seo_metadata_blog_post_id_idx` ON `seo_metadata` (`blog_post_id`);
