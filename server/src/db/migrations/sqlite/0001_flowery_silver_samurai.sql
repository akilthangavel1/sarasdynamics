CREATE TABLE `job_categories` (
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
CREATE UNIQUE INDEX `job_categories_name_unique_idx` ON `job_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `job_categories_slug_unique_idx` ON `job_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `job_categories_is_active_idx` ON `job_categories` (`is_active`);--> statement-breakpoint
CREATE INDEX `job_categories_display_order_idx` ON `job_categories` (`display_order`);--> statement-breakpoint
CREATE TABLE `job_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`skill_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_skills_job_skill_unique_idx` ON `job_skills` (`job_id`,`skill_id`);--> statement-breakpoint
CREATE INDEX `job_skills_job_id_idx` ON `job_skills` (`job_id`);--> statement-breakpoint
CREATE INDEX `job_skills_skill_id_idx` ON `job_skills` (`skill_id`);--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`requirements` text,
	`location` text,
	`workplace_type` text,
	`employment_type` text,
	`application_deadline` integer,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`published_at` integer,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `job_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_slug_unique_idx` ON `jobs` (`slug`);--> statement-breakpoint
CREATE INDEX `jobs_category_id_idx` ON `jobs` (`category_id`);--> statement-breakpoint
CREATE INDEX `jobs_status_idx` ON `jobs` (`status`);--> statement-breakpoint
CREATE INDEX `jobs_application_deadline_idx` ON `jobs` (`application_deadline`);--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skills_name_unique_idx` ON `skills` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `skills_slug_unique_idx` ON `skills` (`slug`);--> statement-breakpoint
CREATE INDEX `skills_is_active_idx` ON `skills` (`is_active`);