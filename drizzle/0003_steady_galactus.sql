CREATE TABLE "calendar" (
	"id" integer PRIMARY KEY NOT NULL,
	"listing_id" bigint,
	"date" date,
	"available" boolean,
	"price" text,
	"adjusted_price" text,
	"minimum_nights" integer,
	"maximum_nights" integer
);
--> statement-breakpoint
ALTER TABLE "calendar" ADD CONSTRAINT "calendar_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;