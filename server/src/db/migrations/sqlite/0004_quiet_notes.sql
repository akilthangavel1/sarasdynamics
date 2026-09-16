CREATE TABLE `application_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`user_id` text NOT NULL,
	`note` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `application_notes_application_id_idx` ON `application_notes` (`application_id`);--> statement-breakpoint
CREATE INDEX `application_notes_user_id_idx` ON `application_notes` (`user_id`);--> statement-breakpoint
CREATE INDEX `application_notes_created_at_idx` ON `application_notes` (`created_at`);
