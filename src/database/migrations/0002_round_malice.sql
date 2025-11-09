ALTER TABLE "reports_timelines" ALTER COLUMN "action" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."action";--> statement-breakpoint
CREATE TYPE "public"."action" AS ENUM('created', 'updated_status', 'assigned_to_user', 'note_updated', 'marked_resolved', 'marked_rejected');--> statement-breakpoint
ALTER TABLE "reports_timelines" ALTER COLUMN "action" SET DATA TYPE "public"."action" USING "action"::"public"."action";--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "note" text;