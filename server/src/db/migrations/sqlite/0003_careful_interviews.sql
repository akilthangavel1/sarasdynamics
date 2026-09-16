CREATE TABLE `interviews` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`interview_type` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`duration_minutes` integer NOT NULL,
	`meeting_link` text,
	`location` text,
	`interviewer_id` text NOT NULL,
	`status` text DEFAULT 'SCHEDULED' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`interviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `interviews_application_id_idx` ON `interviews` (`application_id`);--> statement-breakpoint
CREATE INDEX `interviews_interviewer_id_idx` ON `interviews` (`interviewer_id`);--> statement-breakpoint
CREATE INDEX `interviews_status_idx` ON `interviews` (`status`);--> statement-breakpoint
CREATE INDEX `interviews_scheduled_at_idx` ON `interviews` (`scheduled_at`);--> statement-breakpoint
CREATE TABLE `interview_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`interview_id` text NOT NULL,
	`interviewer_id` text NOT NULL,
	`rating` integer NOT NULL,
	`strengths` text,
	`weaknesses` text,
	`feedback` text,
	`recommendation` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`interviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interview_feedback_interview_interviewer_unique_idx` ON `interview_feedback` (`interview_id`,`interviewer_id`);--> statement-breakpoint
CREATE INDEX `interview_feedback_interview_id_idx` ON `interview_feedback` (`interview_id`);--> statement-breakpoint
CREATE INDEX `interview_feedback_interviewer_id_idx` ON `interview_feedback` (`interviewer_id`);
