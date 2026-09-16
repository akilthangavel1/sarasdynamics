CREATE TABLE `blog_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_categories_slug_unique_idx` ON `blog_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_categories_slug_idx` ON `blog_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_categories_is_active_idx` ON `blog_categories` (`is_active`);--> statement-breakpoint
CREATE TABLE `blog_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_tags_slug_unique_idx` ON `blog_tags` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_tags_slug_idx` ON `blog_tags` (`slug`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`featured_image_key` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique_idx` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_posts_category_id_idx` ON `blog_posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `blog_posts_author_id_idx` ON `blog_posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `blog_posts_status_idx` ON `blog_posts` (`status`);--> statement-breakpoint
CREATE INDEX `blog_posts_slug_idx` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_posts_published_at_idx` ON `blog_posts` (`published_at`);--> statement-breakpoint
CREATE TABLE `blog_post_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `blog_tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_post_tags_post_tag_unique_idx` ON `blog_post_tags` (`blog_post_id`,`tag_id`);--> statement-breakpoint
CREATE INDEX `blog_post_tags_post_id_idx` ON `blog_post_tags` (`blog_post_id`);--> statement-breakpoint
CREATE INDEX `blog_post_tags_tag_id_idx` ON `blog_post_tags` (`tag_id`);
