import {
  and,
  eq,
  inArray,
  like,
  or,
} from "drizzle-orm";
import { z } from "zod";
import { BASE_10 } from "../constants";
import { publicProcedure, router } from "./init";
import { getMapData } from "./procedures/map";
import { db } from "@/db";
import { hosts, listings as listingsTable } from "@/db/schema";
import { fetchListings, listingSelect } from "@/lib/listings-db";
import {
  calculateAveragePricesByZip,
  calculateVolumes,
  filterListings,
} from "@/lib/listings-processor";
import type { Filters } from "@/types/filters";
import type { Listing } from "@/types/listings";

const getListingsData = async (): Promise<Listing[]> => {
  const rawListings = await db
    .select(listingSelect)
    .from(listingsTable)
    .leftJoin(hosts, eq(listingsTable.host_id, hosts.id));

  return fetchListings(rawListings);
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
        whereConditions.push(
          inArray(listingsTable.neighbourhood_cleansed, input.filters.zipCodes),
        );
      }

      if (input.filters?.roomTypes?.length) {
        whereConditions.push(
          inArray(listingsTable.room_type, input.filters.roomTypes),
        );
      }

      if (input.filters?.propertyTypes?.length) {
        whereConditions.push(
          inArray(listingsTable.property_type, input.filters.propertyTypes),
        );
      }

      // Note: Numeric filters like price, accommodates, etc. are handled in memory after fetching
      // because they require parsing and the DB stores some as text

      if (
        input.filters?.hostIsSuperhost !== undefined &&
        input.filters?.hostIsSuperhost !== null
      ) {
        whereConditions.push(
          eq(hosts.is_superhost, input.filters.hostIsSuperhost),
        );
      }

      if (
        input.filters?.instantBookable !== undefined &&
        input.filters?.instantBookable !== null
      ) {
        whereConditions.push(
          eq(listingsTable.instant_bookable, input.filters.instantBookable),
        );
      }

      if (input.search) {
        whereConditions.push(
          or(
            like(listingsTable.name, `%${input.search}%`),
            like(listingsTable.description, `%${input.search}%`),
          ),
        );
      }

      // Get all filtered data (simple filters only)
      const rawListings = await db
        .select(listingSelect)
        .from(listingsTable)
        .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
        .where(and(...whereConditions));

      const enhancedListings = await fetchListings(rawListings);

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
        const numericFields = ["price", "potential_revenue", "risk_score"];

        if (numericFields.includes(input.sortBy)) {
          let aNum: number;
          let bNum: number;

          if (input.sortBy === "price") {
            // Parse price string (e.g., "$100.00" -> 100.00)
            const aPriceStr = String(aValue).replace(/[^0-9.-]/g, "");
            const bPriceStr = String(bValue).replace(/[^0-9.-]/g, "");
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
          .reduce(
            (acc, type) => {
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
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
        accommodatesVolumes: calculateVolumes(
          accommodates,
          minAccommodates,
          maxAccommodates,
        ),
        bedroomsVolumes: calculateVolumes(bedrooms, minBedrooms, maxBedrooms),
        reviewScoreVolumes: calculateVolumes(
          reviewScores,
          minReviewScore,
          maxReviewScore,
        ),
      };
    }),

  getMapData,

  getListing: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const rawListing = await db
        .select(listingSelect)
        .from(listingsTable)
        .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
        .where(eq(listingsTable.id, parseInt(input.id, BASE_10)))
        .limit(1);

      if (rawListing.length === 0) {
        throw new Error("Listing not found");
      }

      const listings = await fetchListings(rawListing);

      return listings[0];
    }),
});
