import { z } from "zod";
import { publicProcedure, router } from "./init";
import { db } from "@/db";
import { listings as listingsTable, hosts } from "@/db/schema";
import { and, eq, inArray, like, or } from "drizzle-orm";
import {
  calculateAveragePricesByZip,
  calculateVolumes,
  enhanceListings,
  filterListings,
  processListings,
} from "@/lib/listings-processor";
import type { Filters } from "@/types/filters";
import type { Listing } from "@/types/listings";
import { getMapData } from "./procedures/map";

const getListingsData = async (): Promise<Listing[]> => {
  const rawListings = await db
    .select({
      // Listings fields
      id: listingsTable.id,
      listing_url: listingsTable.listing_url,
      scrape_id: listingsTable.scrape_id,
      last_scraped: listingsTable.last_scraped,
      source: listingsTable.source,
      name: listingsTable.name,
      description: listingsTable.description,
      neighborhood_overview: listingsTable.neighborhood_overview,
      picture_url: listingsTable.picture_url,
      neighbourhood: listingsTable.neighbourhood,
      neighbourhood_cleansed: listingsTable.neighbourhood_cleansed,
      neighbourhood_group_cleansed: listingsTable.neighbourhood_group_cleansed,
      latitude: listingsTable.latitude,
      longitude: listingsTable.longitude,
      property_type: listingsTable.property_type,
      room_type: listingsTable.room_type,
      accommodates: listingsTable.accommodates,
      bathrooms: listingsTable.bathrooms,
      bathrooms_text: listingsTable.bathrooms_text,
      bedrooms: listingsTable.bedrooms,
      beds: listingsTable.beds,
      amenities: listingsTable.amenities,
      price: listingsTable.price,
      minimum_nights: listingsTable.minimum_nights,
      maximum_nights: listingsTable.maximum_nights,
      minimum_minimum_nights: listingsTable.minimum_minimum_nights,
      maximum_minimum_nights: listingsTable.maximum_minimum_nights,
      minimum_maximum_nights: listingsTable.minimum_maximum_nights,
      maximum_maximum_nights: listingsTable.maximum_maximum_nights,
      minimum_nights_avg_ntm: listingsTable.minimum_nights_avg_ntm,
      maximum_nights_avg_ntm: listingsTable.maximum_nights_avg_ntm,
      calendar_updated: listingsTable.calendar_updated,
      has_availability: listingsTable.has_availability,
      availability_30: listingsTable.availability_30,
      availability_60: listingsTable.availability_60,
      availability_90: listingsTable.availability_90,
      availability_365: listingsTable.availability_365,
      calendar_last_scraped: listingsTable.calendar_last_scraped,
      number_of_reviews: listingsTable.number_of_reviews,
      number_of_reviews_ltm: listingsTable.number_of_reviews_ltm,
      number_of_reviews_l30d: listingsTable.number_of_reviews_l30d,
      availability_eoy: listingsTable.availability_eoy,
      number_of_reviews_ly: listingsTable.number_of_reviews_ly,
      estimated_occupancy_l365d: listingsTable.estimated_occupancy_l365d,
      estimated_revenue_l365d: listingsTable.estimated_revenue_l365d,
      first_review: listingsTable.first_review,
      last_review: listingsTable.last_review,
      review_scores_rating: listingsTable.review_scores_rating,
      review_scores_accuracy: listingsTable.review_scores_accuracy,
      review_scores_cleanliness: listingsTable.review_scores_cleanliness,
      review_scores_checkin: listingsTable.review_scores_checkin,
      review_scores_communication: listingsTable.review_scores_communication,
      review_scores_location: listingsTable.review_scores_location,
      review_scores_value: listingsTable.review_scores_value,
      license: listingsTable.license,
      instant_bookable: listingsTable.instant_bookable,
      calculated_host_listings_count: listingsTable.calculated_host_listings_count,
      calculated_host_listings_count_entire_homes: listingsTable.calculated_host_listings_count_entire_homes,
      calculated_host_listings_count_private_rooms: listingsTable.calculated_host_listings_count_private_rooms,
      calculated_host_listings_count_shared_rooms: listingsTable.calculated_host_listings_count_shared_rooms,
      reviews_per_month: listingsTable.reviews_per_month,
      // Host fields
      host_id: hosts.id,
      host_url: hosts.url,
      host_name: hosts.name,
      host_since: hosts.since,
      host_location: hosts.location,
      host_about: hosts.about,
      host_response_time: hosts.response_time,
      host_response_rate: hosts.response_rate,
      host_acceptance_rate: hosts.acceptance_rate,
      host_is_superhost: hosts.is_superhost,
      host_thumbnail_url: hosts.thumbnail_url,
      host_picture_url: hosts.picture_url,
      host_neighbourhood: hosts.neighbourhood,
      host_listings_count: hosts.listings_count,
      host_total_listings_count: hosts.total_listings_count,
      host_verifications: hosts.verifications,
      host_has_profile_pic: hosts.has_profile_pic,
      host_identity_verified: hosts.identity_verified,
    })
    .from(listingsTable)
    .leftJoin(hosts, eq(listingsTable.host_id, hosts.id));

  // Convert to Listing type (all strings)
  const listings: Listing[] = rawListings.map((row) => ({
    id: String(row.id),
    listing_url: row.listing_url || '',
    scrape_id: String(row.scrape_id || ''),
    last_scraped: row.last_scraped?.toString() || '',
    source: row.source || '',
    name: row.name || '',
    description: row.description || '',
    neighborhood_overview: row.neighborhood_overview || '',
    picture_url: row.picture_url || '',
    host_id: String(row.host_id || ''),
    host_url: row.host_url || '',
    host_name: row.host_name || '',
    host_since: row.host_since?.toString() || '',
    host_location: row.host_location || '',
    host_about: row.host_about || '',
    host_response_time: row.host_response_time || '',
    host_response_rate: row.host_response_rate || '',
    host_acceptance_rate: row.host_acceptance_rate || '',
    host_is_superhost: String(row.host_is_superhost || false),
    host_thumbnail_url: row.host_thumbnail_url || '',
    host_picture_url: row.host_picture_url || '',
    host_neighbourhood: row.host_neighbourhood || '',
    host_listings_count: String(row.host_listings_count || ''),
    host_total_listings_count: String(row.host_total_listings_count || ''),
    host_verifications: row.host_verifications || '',
    host_has_profile_pic: String(row.host_has_profile_pic || false),
    host_identity_verified: String(row.host_identity_verified || false),
    neighbourhood: row.neighbourhood || '',
    neighbourhood_cleansed: row.neighbourhood_cleansed || '',
    neighbourhood_group_cleansed: row.neighbourhood_group_cleansed || '',
    latitude: String(row.latitude || ''),
    longitude: String(row.longitude || ''),
    property_type: row.property_type || '',
    room_type: row.room_type || '',
    accommodates: String(row.accommodates || ''),
    bathrooms: String(row.bathrooms || ''),
    bathrooms_text: row.bathrooms_text || '',
    bedrooms: String(row.bedrooms || ''),
    beds: String(row.beds || ''),
    amenities: row.amenities || '',
    price: row.price || '',
    minimum_nights: String(row.minimum_nights || ''),
    maximum_nights: String(row.maximum_nights || ''),
    minimum_minimum_nights: String(row.minimum_minimum_nights || ''),
    maximum_minimum_nights: String(row.maximum_minimum_nights || ''),
    minimum_maximum_nights: String(row.minimum_maximum_nights || ''),
    maximum_maximum_nights: String(row.maximum_maximum_nights || ''),
    minimum_nights_avg_ntm: String(row.minimum_nights_avg_ntm || ''),
    maximum_nights_avg_ntm: String(row.maximum_nights_avg_ntm || ''),
    calendar_updated: row.calendar_updated || '',
    has_availability: String(row.has_availability || false),
    availability_30: String(row.availability_30 || ''),
    availability_60: String(row.availability_60 || ''),
    availability_90: String(row.availability_90 || ''),
    availability_365: String(row.availability_365 || ''),
    calendar_last_scraped: row.calendar_last_scraped?.toString() || '',
    number_of_reviews: String(row.number_of_reviews || ''),
    number_of_reviews_ltm: String(row.number_of_reviews_ltm || ''),
    number_of_reviews_l30d: String(row.number_of_reviews_l30d || ''),
    availability_eoy: String(row.availability_eoy || ''),
    number_of_reviews_ly: String(row.number_of_reviews_ly || ''),
    estimated_occupancy_l365d: String(row.estimated_occupancy_l365d || ''),
    estimated_revenue_l365d: String(row.estimated_revenue_l365d || ''),
    first_review: row.first_review?.toString() || '',
    last_review: row.last_review?.toString() || '',
    review_scores_rating: String(row.review_scores_rating || ''),
    review_scores_accuracy: String(row.review_scores_accuracy || ''),
    review_scores_cleanliness: String(row.review_scores_cleanliness || ''),
    review_scores_checkin: String(row.review_scores_checkin || ''),
    review_scores_communication: String(row.review_scores_communication || ''),
    review_scores_location: String(row.review_scores_location || ''),
    review_scores_value: String(row.review_scores_value || ''),
    license: row.license || '',
    instant_bookable: String(row.instant_bookable || false),
    calculated_host_listings_count: String(row.calculated_host_listings_count || ''),
    calculated_host_listings_count_entire_homes: String(row.calculated_host_listings_count_entire_homes || ''),
    calculated_host_listings_count_private_rooms: String(row.calculated_host_listings_count_private_rooms || ''),
    calculated_host_listings_count_shared_rooms: String(row.calculated_host_listings_count_shared_rooms || ''),
    reviews_per_month: String(row.reviews_per_month || ''),
    potential_revenue: 0, // Will be calculated in enhanceListings
    risk_score: 0, // Will be calculated in enhanceListings
  }));

  const processedListings = processListings(listings);
  const enhancedListings = enhanceListings(processedListings);

  return enhancedListings;
};

export const listingsRouter = router({
  getListings: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(50),
        sortBy: z.string().default("name"),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
        search: z.string().optional(),
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
      }),
    )
    .query(async ({ input }) => {
      // Build where conditions for DB filtering
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

      // Note: Numeric filters like price, accommodates, etc. are handled in memory after fetching
      // because they require parsing and the DB stores some as text

      if (input.filters?.hostIsSuperhost !== undefined && input.filters?.hostIsSuperhost !== null) {
        whereConditions.push(eq(hosts.is_superhost, input.filters.hostIsSuperhost));
      }

      if (input.filters?.instantBookable !== undefined && input.filters?.instantBookable !== null) {
        whereConditions.push(eq(listingsTable.instant_bookable, input.filters.instantBookable));
      }

      if (input.search) {
        whereConditions.push(or(
          like(listingsTable.name, `%${input.search}%`),
          like(listingsTable.description, `%${input.search}%`)
        ));
      }

      // Get all filtered data (simple filters only)
      const rawListings = await db
        .select({
          // Same select as in getListingsData
          id: listingsTable.id,
          listing_url: listingsTable.listing_url,
          scrape_id: listingsTable.scrape_id,
          last_scraped: listingsTable.last_scraped,
          source: listingsTable.source,
          name: listingsTable.name,
          description: listingsTable.description,
          neighborhood_overview: listingsTable.neighborhood_overview,
          picture_url: listingsTable.picture_url,
          neighbourhood: listingsTable.neighbourhood,
          neighbourhood_cleansed: listingsTable.neighbourhood_cleansed,
          neighbourhood_group_cleansed: listingsTable.neighbourhood_group_cleansed,
          latitude: listingsTable.latitude,
          longitude: listingsTable.longitude,
          property_type: listingsTable.property_type,
          room_type: listingsTable.room_type,
          accommodates: listingsTable.accommodates,
          bathrooms: listingsTable.bathrooms,
          bathrooms_text: listingsTable.bathrooms_text,
          bedrooms: listingsTable.bedrooms,
          beds: listingsTable.beds,
          amenities: listingsTable.amenities,
          price: listingsTable.price,
          minimum_nights: listingsTable.minimum_nights,
          maximum_nights: listingsTable.maximum_nights,
          minimum_minimum_nights: listingsTable.minimum_minimum_nights,
          maximum_minimum_nights: listingsTable.maximum_minimum_nights,
          minimum_maximum_nights: listingsTable.minimum_maximum_nights,
          maximum_maximum_nights: listingsTable.maximum_maximum_nights,
          minimum_nights_avg_ntm: listingsTable.minimum_nights_avg_ntm,
          maximum_nights_avg_ntm: listingsTable.maximum_nights_avg_ntm,
          calendar_updated: listingsTable.calendar_updated,
          has_availability: listingsTable.has_availability,
          availability_30: listingsTable.availability_30,
          availability_60: listingsTable.availability_60,
          availability_90: listingsTable.availability_90,
          availability_365: listingsTable.availability_365,
          calendar_last_scraped: listingsTable.calendar_last_scraped,
          number_of_reviews: listingsTable.number_of_reviews,
          number_of_reviews_ltm: listingsTable.number_of_reviews_ltm,
          number_of_reviews_l30d: listingsTable.number_of_reviews_l30d,
          availability_eoy: listingsTable.availability_eoy,
          number_of_reviews_ly: listingsTable.number_of_reviews_ly,
          estimated_occupancy_l365d: listingsTable.estimated_occupancy_l365d,
          estimated_revenue_l365d: listingsTable.estimated_revenue_l365d,
          first_review: listingsTable.first_review,
          last_review: listingsTable.last_review,
          review_scores_rating: listingsTable.review_scores_rating,
          review_scores_accuracy: listingsTable.review_scores_accuracy,
          review_scores_cleanliness: listingsTable.review_scores_cleanliness,
          review_scores_checkin: listingsTable.review_scores_checkin,
          review_scores_communication: listingsTable.review_scores_communication,
          review_scores_location: listingsTable.review_scores_location,
          review_scores_value: listingsTable.review_scores_value,
          license: listingsTable.license,
          instant_bookable: listingsTable.instant_bookable,
          calculated_host_listings_count: listingsTable.calculated_host_listings_count,
          calculated_host_listings_count_entire_homes: listingsTable.calculated_host_listings_count_entire_homes,
          calculated_host_listings_count_private_rooms: listingsTable.calculated_host_listings_count_private_rooms,
          calculated_host_listings_count_shared_rooms: listingsTable.calculated_host_listings_count_shared_rooms,
          reviews_per_month: listingsTable.reviews_per_month,
          host_id: hosts.id,
          host_url: hosts.url,
          host_name: hosts.name,
          host_since: hosts.since,
          host_location: hosts.location,
          host_about: hosts.about,
          host_response_time: hosts.response_time,
          host_response_rate: hosts.response_rate,
          host_acceptance_rate: hosts.acceptance_rate,
          host_is_superhost: hosts.is_superhost,
          host_thumbnail_url: hosts.thumbnail_url,
          host_picture_url: hosts.picture_url,
          host_neighbourhood: hosts.neighbourhood,
          host_listings_count: hosts.listings_count,
          host_total_listings_count: hosts.total_listings_count,
          host_verifications: hosts.verifications,
          host_has_profile_pic: hosts.has_profile_pic,
          host_identity_verified: hosts.identity_verified,
        })
        .from(listingsTable)
        .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
        .where(and(...whereConditions));

      // Convert to Listing type
      const listings: Listing[] = rawListings.map((row) => ({
        id: String(row.id),
        listing_url: row.listing_url || '',
        scrape_id: String(row.scrape_id || ''),
        last_scraped: row.last_scraped?.toString() || '',
        source: row.source || '',
        name: row.name || '',
        description: row.description || '',
        neighborhood_overview: row.neighborhood_overview || '',
        picture_url: row.picture_url || '',
        host_id: String(row.host_id || ''),
        host_url: row.host_url || '',
        host_name: row.host_name || '',
        host_since: row.host_since?.toString() || '',
        host_location: row.host_location || '',
        host_about: row.host_about || '',
        host_response_time: row.host_response_time || '',
        host_response_rate: row.host_response_rate || '',
        host_acceptance_rate: row.host_acceptance_rate || '',
        host_is_superhost: String(row.host_is_superhost || false),
        host_thumbnail_url: row.host_thumbnail_url || '',
        host_picture_url: row.host_picture_url || '',
        host_neighbourhood: row.host_neighbourhood || '',
        host_listings_count: String(row.host_listings_count || ''),
        host_total_listings_count: String(row.host_total_listings_count || ''),
        host_verifications: row.host_verifications || '',
        host_has_profile_pic: String(row.host_has_profile_pic || false),
        host_identity_verified: String(row.host_identity_verified || false),
        neighbourhood: row.neighbourhood || '',
        neighbourhood_cleansed: row.neighbourhood_cleansed || '',
        neighbourhood_group_cleansed: row.neighbourhood_group_cleansed || '',
        latitude: String(row.latitude || ''),
        longitude: String(row.longitude || ''),
        property_type: row.property_type || '',
        room_type: row.room_type || '',
        accommodates: String(row.accommodates || ''),
        bathrooms: String(row.bathrooms || ''),
        bathrooms_text: row.bathrooms_text || '',
        bedrooms: String(row.bedrooms || ''),
        beds: String(row.beds || ''),
        amenities: row.amenities || '',
        price: row.price || '',
        minimum_nights: String(row.minimum_nights || ''),
        maximum_nights: String(row.maximum_nights || ''),
        minimum_minimum_nights: String(row.minimum_minimum_nights || ''),
        maximum_minimum_nights: String(row.maximum_minimum_nights || ''),
        minimum_maximum_nights: String(row.minimum_maximum_nights || ''),
        maximum_maximum_nights: String(row.maximum_maximum_nights || ''),
        minimum_nights_avg_ntm: String(row.minimum_nights_avg_ntm || ''),
        maximum_nights_avg_ntm: String(row.maximum_nights_avg_ntm || ''),
        calendar_updated: row.calendar_updated || '',
        has_availability: String(row.has_availability || false),
        availability_30: String(row.availability_30 || ''),
        availability_60: String(row.availability_60 || ''),
        availability_90: String(row.availability_90 || ''),
        availability_365: String(row.availability_365 || ''),
        calendar_last_scraped: row.calendar_last_scraped?.toString() || '',
        number_of_reviews: String(row.number_of_reviews || ''),
        number_of_reviews_ltm: String(row.number_of_reviews_ltm || ''),
        number_of_reviews_l30d: String(row.number_of_reviews_l30d || ''),
        availability_eoy: String(row.availability_eoy || ''),
        number_of_reviews_ly: String(row.number_of_reviews_ly || ''),
        estimated_occupancy_l365d: String(row.estimated_occupancy_l365d || ''),
        estimated_revenue_l365d: String(row.estimated_revenue_l365d || ''),
        first_review: row.first_review?.toString() || '',
        last_review: row.last_review?.toString() || '',
        review_scores_rating: String(row.review_scores_rating || ''),
        review_scores_accuracy: String(row.review_scores_accuracy || ''),
        review_scores_cleanliness: String(row.review_scores_cleanliness || ''),
        review_scores_checkin: String(row.review_scores_checkin || ''),
        review_scores_communication: String(row.review_scores_communication || ''),
        review_scores_location: String(row.review_scores_location || ''),
        review_scores_value: String(row.review_scores_value || ''),
        license: row.license || '',
        instant_bookable: String(row.instant_bookable || false),
        calculated_host_listings_count: String(row.calculated_host_listings_count || ''),
        calculated_host_listings_count_entire_homes: String(row.calculated_host_listings_count_entire_homes || ''),
        calculated_host_listings_count_private_rooms: String(row.calculated_host_listings_count_private_rooms || ''),
        calculated_host_listings_count_shared_rooms: String(row.calculated_host_listings_count_shared_rooms || ''),
        reviews_per_month: String(row.reviews_per_month || ''),
        potential_revenue: 0,
        risk_score: 0,
      }));

      // Apply processing and enhancement
      const processedListings = processListings(listings);
      const enhancedListings = enhanceListings(processedListings);

      // Apply additional filters (numeric ones)
      const filters: Filters = {
        zipCodes: input.filters?.zipCodes || [],
        roomTypes: input.filters?.roomTypes || [],
        propertyTypes: input.filters?.propertyTypes || [],
        minPrice: input.filters?.minPrice ?? 0,
        maxPrice: input.filters?.maxPrice ?? Infinity,
        minAccommodates: input.filters?.minAccommodates ?? 0,
        maxAccommodates: input.filters?.maxAccommodates ?? Infinity,
        minBedrooms: input.filters?.minBedrooms ?? 0,
        maxBedrooms: input.filters?.maxBedrooms ?? Infinity,
        minReviewScore: input.filters?.minReviewScore ?? 0,
        maxReviewScore: input.filters?.maxReviewScore ?? Infinity,
        hostIsSuperhost: input.filters?.hostIsSuperhost ?? false,
        instantBookable: input.filters?.instantBookable ?? false,
      };

      const filteredListings = filterListings(
        enhancedListings,
        filters,
        input.search || "",
      );

      // Sort
      const sortedListings = [...filteredListings].sort((a, b) => {
        const aValue = a[input.sortBy as keyof typeof a];
        const bValue = b[input.sortBy as keyof typeof b];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Define numeric fields that should be sorted as numbers
        const numericFields = ['price', 'potential_revenue', 'risk_score'];

        if (numericFields.includes(input.sortBy)) {
          let aNum: number;
          let bNum: number;

          if (input.sortBy === 'price') {
            // Parse price string (e.g., "$100.00" -> 100.00)
            const aPriceStr = String(aValue).replace(/[^0-9.-]/g, '');
            const bPriceStr = String(bValue).replace(/[^0-9.-]/g, '');
            aNum = parseFloat(aPriceStr) || 0;
            bNum = parseFloat(bPriceStr) || 0;
          } else {
            // potential_revenue and risk_score are already numbers
            aNum = Number(aValue) || 0;
            bNum = Number(bValue) || 0;
          }

          return input.sortOrder === "asc" ? aNum - bNum : bNum - aNum;
        } else {
          // Default string sorting for other fields
          const aStr = String(aValue);
          const bStr = String(bValue);

          return input.sortOrder === "asc"
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        }
      });

      // Paginate
      const total = sortedListings.length;
      const startIndex = (input.page - 1) * input.pageSize;
      const endIndex = startIndex + input.pageSize;
      const paginatedData = sortedListings.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  getFilterOptions: publicProcedure
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
      }),
    )
    .query(async ({ input }) => {
      // For now, use the existing logic but with DB data
      // TODO: Optimize with DB aggregates and migration for better performance
      const listings = await getListingsData();

      // Simple filter options calculation
      const zipCodes = [
        ...new Set(
          listings.map((l) => l.neighbourhood_cleansed).filter(Boolean),
        ),
      ].sort();

      const roomTypes = [
        ...new Set(listings.map((l) => l.room_type).filter(Boolean)),
      ].sort();

      const propertyTypes = Object.entries(
        listings
          .map((l) => l.property_type)
          .filter(Boolean)
          .reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
      )
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);

      // Price range
      const prices = listings
        .map((l) => parseFloat(l.price.replace(/[$,]/g, "")))
        .filter((p) => !isNaN(p) && p > 0);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));

      // Accommodates range
      const accommodates = listings
        .map((l) => parseInt(l.accommodates))
        .filter((a) => !isNaN(a) && a > 0);
      const minAccommodates = Math.min(...accommodates);
      const maxAccommodates = Math.max(...accommodates);

      // Bedrooms range
      const bedrooms = listings
        .map((l) => parseInt(l.bedrooms))
        .filter((b) => !isNaN(b) && b >= 0);
      const minBedrooms = Math.min(...bedrooms);
      const maxBedrooms = Math.max(...bedrooms);

      // Review scores range
      const reviewScores = listings
        .map((l) => parseFloat(l.review_scores_rating))
        .filter((r) => !isNaN(r) && r > 0);
      const minReviewScore = Math.floor(Math.min(...reviewScores) * 10) / 10;
      const maxReviewScore = Math.ceil(Math.max(...reviewScores) * 10) / 10;

      // Average prices by zip
      const zipAveragePrices = calculateAveragePricesByZip(listings);

      return {
        zipCodes,
        roomTypes,
        propertyTypes,
        minPrice,
        maxPrice,
        minAccommodates,
        maxAccommodates,
        minBedrooms,
        maxBedrooms,
        minReviewScore,
        maxReviewScore,
        zipAveragePrices,
        priceVolumes: (() => {
          if (prices.length === 0) return new Array(50).fill(0);
          const logMin = Math.log10(minPrice);
          const logRange = Math.log10(maxPrice) - logMin;
          const volumes = new Array(50).fill(0);
          prices.forEach((price) => {
            if (price >= minPrice && price <= maxPrice) {
              const logValue = Math.log10(price);
              const sliderPos = ((logValue - logMin) / logRange) * 100;
              const bin = Math.floor(sliderPos / 2); // 100 / 50 = 2
              const clampedBin = Math.min(bin, 49);
              volumes[clampedBin]++;
            }
          });
          return volumes;
        })(),
        accommodatesVolumes: calculateVolumes(accommodates, minAccommodates, maxAccommodates),
        bedroomsVolumes: calculateVolumes(bedrooms, minBedrooms, maxBedrooms),
        reviewScoreVolumes: calculateVolumes(reviewScores, minReviewScore, maxReviewScore),
      };
    }),

  getMapData,
});
