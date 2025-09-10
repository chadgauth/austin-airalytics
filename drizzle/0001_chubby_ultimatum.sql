CREATE TABLE "hosts" (
	"id" bigint,
	"url" text,
	"name" text,
	"since" date,
	"location" text,
	"about" text,
	"response_time" text,
	"response_rate" text,
	"acceptance_rate" text,
	"is_superhost" boolean,
	"thumbnail_url" text,
	"picture_url" text,
	"neighbourhood" text,
	"listings_count" bigint,
	"total_listings_count" bigint,
	"verifications" text,
	"has_profile_pic" boolean,
	"identity_verified" boolean
);
--> statement-breakpoint
INSERT INTO "hosts" (
	"id",
	"url",
	"name",
	"since",
	"location",
	"about",
	"response_time",
	"response_rate",
	"acceptance_rate",
	"is_superhost",
	"thumbnail_url",
	"picture_url",
	"neighbourhood",
	"listings_count",
	"total_listings_count",
	"verifications",
	"has_profile_pic",
	"identity_verified"
)
SELECT DISTINCT
	"host_id",
	"host_url",
	"host_name",
	"host_since"::date,
	"host_location",
	"host_about",
	"host_response_time",
	"host_response_rate",
	"host_acceptance_rate",
	"host_is_superhost"::boolean,
	"host_thumbnail_url",
	"host_picture_url",
	"host_neighbourhood",
	"host_listings_count"::bigint,
	"host_total_listings_count"::bigint,
	"host_verifications",
	"host_has_profile_pic"::boolean,
	"host_identity_verified"::boolean
FROM "listings"
WHERE "host_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_url";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_name";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_since";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_location";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_about";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_response_time";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_response_rate";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_acceptance_rate";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_is_superhost";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_thumbnail_url";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_picture_url";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_neighbourhood";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_listings_count";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_total_listings_count";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_verifications";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_has_profile_pic";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "host_identity_verified";