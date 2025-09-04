import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { publicProcedure, router } from "./init";
import { parseCSVToListings } from "@/lib/csv-parser";
import {
  calculateAveragePricesByZip,
  calculateVolumes,
  enhanceListings,
  filterListings,
  processListings,
} from "@/lib/listings-processor";
import type { Filters } from "@/types/filters";
import type { Listing } from "@/types/listings";

// Simple cache
let cachedListings: Listing[] | null = null;
let cacheTimestamp = 0;

const getListingsData = (): Listing[] => {
  const csvPath = path.join(process.cwd(), "src", "data", "listings.csv");
  const stats = fs.statSync(csvPath);
  const fileModified = stats.mtime.getTime();

  // Simple cache check
  if (cachedListings && cacheTimestamp === fileModified) {
    return cachedListings;
  }

  const csvText = fs.readFileSync(csvPath, "utf-8");
  const listings = parseCSVToListings(csvText);
  const processedListings = processListings(listings);
  const enhancedListings = enhanceListings(processedListings);

  cachedListings = enhancedListings;
  cacheTimestamp = fileModified;

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
    .query(({ input }) => {
      const listings = getListingsData();

      // Convert input filters to the format expected by filterListings
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

      // Filter and sort
      const filteredListings = filterListings(
        listings,
        filters,
        input.search || "",
      );

      const sortedListings = [...filteredListings].sort((a, b) => {
        const aValue = a[input.sortBy as keyof typeof a];
        const bValue = b[input.sortBy as keyof typeof b];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const aStr = String(aValue);
        const bStr = String(bValue);

        return input.sortOrder === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
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
    .query(({ input }) => {
      const listings = getListingsData();

      // Simple filter options calculation
      const zipCodes = [
        ...new Set(
          listings.map((l) => l.neighbourhood_cleansed).filter(Boolean),
        ),
      ].sort();

      const roomTypes = [
        ...new Set(listings.map((l) => l.room_type).filter(Boolean)),
      ].sort();

      const propertyTypes = [
        ...new Set(listings.map((l) => l.property_type).filter(Boolean)),
      ].sort();

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

  getMapData: publicProcedure
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
    .query(({ input }) => {
      const listings = getListingsData();

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

      const filteredListings = filterListings(listings, filters);

      return filteredListings.map((listing) => ({
        latitude: listing.latitude,
        longitude: listing.longitude,
        name: listing.name,
        neighbourhood_cleansed: listing.neighbourhood_cleansed,
        price: listing.price,
        room_type: listing.room_type,
      }));
    }),
});
