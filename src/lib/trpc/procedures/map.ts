import z from "zod";
import { publicProcedure } from "../init";
import { and, eq, inArray } from "drizzle-orm/sql";
import { listings as listingsTable, hosts } from "@/db/schema";
import { db } from "@/db";

export const getMapData = publicProcedure
  .input(
    z.object({
      filters: z
        .object({
          zipCodes: z.array(z.string()).default([]),
          roomTypes: z.array(z.string()).default([]),
          propertyTypes: z.array(z.string()).default([]),
          minPrice: z.number().nullish(),
          maxPrice: z.number().nullish(),
          minAccommodates: z.number().nullish(),
          maxAccommodates: z.number().nullish(),
          minBedrooms: z.number().nullish(),
          maxBedrooms: z.number().nullish(),
          minReviewScore: z.number().nullish(),
          maxReviewScore: z.number().nullish(),
          hostIsSuperhost: z.boolean().nullish(),
          instantBookable: z.boolean().nullish(),
        })
        .optional(),
    })
  )
  .query(async ({ input }) => {
    // Build where conditions for DB filtering (same as getListings)
    const whereConditions = [];

    if (input.filters?.zipCodes?.length) {
      whereConditions.push(inArray(listingsTable.neighbourhood_cleansed, input.filters.zipCodes));
    }

    if (input.filters?.roomTypes?.length) {
      whereConditions.push(inArray(listingsTable.room_type, input.filters.roomTypes));
    }

    if (input.filters?.propertyTypes?.length) {
      whereConditions.push(inArray(listingsTable.property_type, input.filters.propertyTypes));
    }

    if (input.filters?.hostIsSuperhost !== undefined && input.filters?.hostIsSuperhost !== null) {
      whereConditions.push(eq(hosts.is_superhost, input.filters.hostIsSuperhost));
    }

    if (input.filters?.instantBookable !== undefined && input.filters?.instantBookable !== null) {
      whereConditions.push(eq(listingsTable.instant_bookable, input.filters.instantBookable));
    }

    // Select only needed fields for map
    const rawListings = await db
      .select({
        latitude: listingsTable.latitude,
        longitude: listingsTable.longitude,
        name: listingsTable.name,
        neighbourhood_cleansed: listingsTable.neighbourhood_cleansed,
        price: listingsTable.price,
        room_type: listingsTable.room_type,
        accommodates: listingsTable.accommodates,
        bedrooms: listingsTable.bedrooms,
        review_scores_rating: listingsTable.review_scores_rating,
      })
      .from(listingsTable)
      .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
      .where(and(...whereConditions));

    // Convert to numbers for filtering
    const listings = rawListings.map((row) => ({
      latitude: parseFloat(String(row.latitude || '')),
      longitude: parseFloat(String(row.longitude || '')),
      name: row.name || '',
      neighbourhood_cleansed: row.neighbourhood_cleansed || '',
      price: row.price || '',
      room_type: row.room_type || '',
      accommodates: row.accommodates || 0,
      bedrooms: row.bedrooms || 0,
      review_scores_rating: row.review_scores_rating ? parseFloat(String(row.review_scores_rating)) : 0,
    }));

    // Apply numeric filters in memory
    const filteredListings = listings.filter((listing) => {
      const price = parseFloat(listing.price.replace(/[$,]/g, ""));
      if (input.filters?.minPrice && price < input.filters.minPrice) return false;
      if (input.filters?.maxPrice && price > input.filters.maxPrice) return false;
      if (input.filters?.minAccommodates && listing.accommodates < input.filters.minAccommodates) return false;
      if (input.filters?.maxAccommodates && listing.accommodates > input.filters.maxAccommodates) return false;
      if (input.filters?.minBedrooms && listing.bedrooms < input.filters.minBedrooms) return false;
      if (input.filters?.maxBedrooms && listing.bedrooms > input.filters.maxBedrooms) return false;
      if (input.filters?.minReviewScore && listing.review_scores_rating < input.filters.minReviewScore) return false;
      if (input.filters?.maxReviewScore && listing.review_scores_rating > input.filters.maxReviewScore) return false;
      return true;
    });

    return filteredListings.map((listing) => ({
      latitude: listing.latitude,
      longitude: listing.longitude,
      name: listing.name,
      neighbourhood_cleansed: listing.neighbourhood_cleansed,
      price: listing.price,
      room_type: listing.room_type,
    }));
  });