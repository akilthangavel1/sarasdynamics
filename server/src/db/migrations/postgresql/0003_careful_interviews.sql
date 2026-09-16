CREATE TYPE "public"."interview_status" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');--> statement-breakpoint
CREATE TYPE "public"."interview_recommendation" AS ENUM('HIRE', 'NO_HIRE', 'FURTHER_INTERVIEW');--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"interview_type" varchar(100) NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"meeting_link" text,
	"location" text,
	"interviewer_id" uuid NOT NULL,
	"status" "interview_status" DEFAULT 'SCHEDULED' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" uuid NOT NULL,
	"interviewer_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"strengths" text,
	"weaknesses" text,
	"feedback" text,
	"recommendation" "interview_recommendation" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewer_id_users_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_interviewer_id_users_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interviews_application_id_idx" ON "interviews" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "interviews_interviewer_id_idx" ON "interviews" USING btree ("interviewer_id");--> statement-breakpoint
CREATE INDEX "interviews_status_idx" ON "interviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "interviews_scheduled_at_idx" ON "interviews" USING btree ("scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "interview_feedback_interview_interviewer_unique_idx" ON "interview_feedback" USING btree ("interview_id","interviewer_id");--> statement-breakpoint
CREATE INDEX "interview_feedback_interview_id_idx" ON "interview_feedback" USING btree ("interview_id");--> statement-breakpoint
CREATE INDEX "interview_feedback_interviewer_id_idx" ON "interview_feedback" USING btree ("interviewer_id");
