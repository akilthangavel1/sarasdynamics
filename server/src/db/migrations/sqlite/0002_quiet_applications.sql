CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`application_number` text NOT NULL,
	`job_id` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`current_location` text,
	`cover_letter` text,
	`status` text DEFAULT 'NEW' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_application_number_unique_idx` ON `applications` (`application_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `applications_job_id_email_unique_idx` ON `applications` (`job_id`,`email`);--> statement-breakpoint
CREATE INDEX `applications_job_id_idx` ON `applications` (`job_id`);--> statement-breakpoint
CREATE INDEX `applications_email_idx` ON `applications` (`email`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `applications_created_at_idx` ON `applications` (`created_at`);--> statement-breakpoint
CREATE TABLE `application_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`document_type` text DEFAULT 'RESUME' NOT NULL,
	`file_name` text NOT NULL,
	`file_key` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `application_documents_application_id_idx` ON `application_documents` (`application_id`);
