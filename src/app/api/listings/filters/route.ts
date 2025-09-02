import { type NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isCacheValid } from "@/lib/cache-utils";
import { BASE_10 } from "@/lib/constants";
import { parseCSVToListings } from "@/lib/csv-parser";
import {
  calculateAveragePricesByZip,
  enhanceListings,
  processListings,
} from "@/lib/listings-processor";

// Cache for filter options with params
const cache = new Map<
  string,
  {
    data: {
      zipCodes: string[];
      roomTypes: string[];
      propertyTypes: string[];
      minPrice: number;
      maxPrice: number;
      minAccommodates: number;
      maxAccommodates: number;
      minBedrooms: number;
      maxBedrooms: number;
      minReviewScore: number;
      maxReviewScore: number;
      zipAveragePrices: Record<string, number>;
      accommodatesVolumes: number[];
      bedroomsVolumes: number[];
      reviewScoreVolumes: number[];
    };
    timestamp: number;
  }
>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipFilters = searchParams.getAll("zip");
    const roomTypeFilters = searchParams.getAll("roomType");
    const minPriceFilter = searchParams.get("minPrice");
    const maxPriceFilter = searchParams.get("maxPrice");

    // Create cache key from params
    const cacheKey = JSON.stringify({
      zip: zipFilters.sort(),
      roomType: roomTypeFilters.sort(),
      minPrice: minPriceFilter,
      maxPrice: maxPriceFilter,
    });

    const csvPath = path.join(process.cwd(), "src", "data", "listings.csv");
    const stats = fs.statSync(csvPath);
    const fileModified = stats.mtime.getTime();

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp, fileModified)) {
      return NextResponse.json(cached.data);
    }

    const csvText = fs.readFileSync(csvPath, "utf-8");
    const listings = parseCSVToListings(csvText);
    const processedListings = processListings(listings);
    const enhancedListings = enhanceListings(processedListings);

    // Extract unique values (always from all listings)
    const zipCodes = [
      ...new Set(
        enhancedListings.map((l) => l.neighbourhood_cleansed).filter(Boolean),
      ),
    ].sort();
    const roomTypes = [
      ...new Set(enhancedListings.map((l) => l.room_type).filter(Boolean)),
    ].sort();
    const propertyTypes = [
      ...new Set(enhancedListings.map((l) => l.property_type).filter(Boolean)),
    ].sort();

    // Calculate price range (always from all listings)
    const prices = enhancedListings
      .map((l) => parseFloat(l.price))
      .filter((p) => !Number.isNaN(p) && p > 0);
    const minPrice = Math.floor(Math.min(...prices));
    const maxPrice = Math.ceil(Math.max(...prices));

    // Calculate accommodates range
    const accommodates = enhancedListings
      .map((l) => parseInt(l.accommodates, BASE_10))
      .filter((a) => !Number.isNaN(a) && a > 0);
    const minAccommodates = Math.min(...accommodates);
    const maxAccommodates = Math.max(...accommodates);

    // Calculate accommodates volumes
    const accommodatesCounts = new Array(
      maxAccommodates - minAccommodates + 1,
    ).fill(0);
    for (const listing of enhancedListings) {
      const val = parseInt(listing.accommodates, BASE_10);
      if (
        !Number.isNaN(val) &&
        val >= minAccommodates &&
        val <= maxAccommodates
      ) {
        accommodatesCounts[val - minAccommodates]++;
      }
    }

    // Calculate bedrooms range
    const bedrooms = enhancedListings
      .map((l) => parseInt(l.bedrooms, BASE_10))
      .filter((b) => !Number.isNaN(b) && b >= 0);
    const minBedrooms = Math.min(...bedrooms);
    const maxBedrooms = Math.max(...bedrooms);

    // Calculate bedrooms volumes
    const bedroomsCounts = new Array(maxBedrooms - minBedrooms + 1).fill(0);
    for (const listing of enhancedListings) {
      const val = parseInt(listing.bedrooms, BASE_10);
      if (!Number.isNaN(val) && val >= minBedrooms && val <= maxBedrooms) {
        bedroomsCounts[val - minBedrooms]++;
      }
    }

    // Calculate review scores range
    const reviewScores = enhancedListings
      .map((l) => parseFloat(l.review_scores_rating))
      .filter((r) => !Number.isNaN(r) && r > 0);
    const minReviewScore = Math.floor(Math.min(...reviewScores) * 10) / 10;
    const maxReviewScore = Math.ceil(Math.max(...reviewScores) * 10) / 10;

    // Calculate review score volumes (bins of 0.1)
    const reviewScoreBins =
      Math.ceil((maxReviewScore - minReviewScore) / 0.1) + 1;
    const reviewScoreCounts = new Array(reviewScoreBins).fill(0);
    for (const listing of enhancedListings) {
      const val = parseFloat(listing.review_scores_rating);
      if (
        !Number.isNaN(val) &&
        val >= minReviewScore &&
        val <= maxReviewScore
      ) {
        const index = Math.floor((val - minReviewScore) / 0.1);
        if (index < reviewScoreCounts.length) {
          reviewScoreCounts[index]++;
        }
      }
    }

    // Filter listings for averages (exclude zip filter, include others)
    let filteredListings = enhancedListings;

    if (roomTypeFilters.length > 0) {
      filteredListings = filteredListings.filter((l) =>
        roomTypeFilters.includes(l.room_type),
      );
    }

    if (minPriceFilter) {
      const min = parseFloat(minPriceFilter);
      filteredListings = filteredListings.filter(
        (l) => parseFloat(l.price) >= min,
      );
    }

    if (maxPriceFilter) {
      const max = parseFloat(maxPriceFilter);
      filteredListings = filteredListings.filter(
        (l) => parseFloat(l.price) <= max,
      );
    }

    // Calculate average prices by zip code from filtered listings (all zips, but filtered by room type etc.)
    const zipAveragePrices = calculateAveragePricesByZip(filteredListings);

    const filterOptions = {
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
      accommodatesVolumes: accommodatesCounts,
      bedroomsVolumes: bedroomsCounts,
      reviewScoreVolumes: reviewScoreCounts,
    };

    // Cache the options
    cache.set(cacheKey, {
      data: filterOptions,
      timestamp: Date.now(),
    });

    return NextResponse.json(filterOptions);
  } catch (error) {
    console.error("Error loading filter options:", error);
    return NextResponse.json(
      { error: "Failed to load filter options" },
      { status: 500 },
    );
  }
}
