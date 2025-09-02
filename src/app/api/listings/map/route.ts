import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isCacheValid } from "@/lib/cache-utils";
import { parseCSVToListings } from "@/lib/csv-parser";
import {
  enhanceListings,
  filterListings,
  parseFilters,
  processListings,
} from "@/lib/listings-processor";
import type { Listing } from "@/types/listings";

// High-value cache: Same as main route
let cachedListings: Listing[] | null = null;
let cacheTimestamp = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filter parameters
    const filters = parseFilters(searchParams);

    // Read CSV from public directory
    const csvPath = path.join(process.cwd(), "src", "data", "listings.csv");
    const stats = fs.statSync(csvPath);
    const fileModified = stats.mtime.getTime();

    // Check cache
    if (cachedListings && isCacheValid(cacheTimestamp, fileModified)) {
      // Filter cached enhanced listings
      const filteredListings = filterListings(cachedListings, filters);

      // Map to minimal fields for map
      const mapData = filteredListings.map((listing) => ({
        latitude: listing.latitude,
        longitude: listing.longitude,
        name: listing.name,
        neighbourhood_cleansed: listing.neighbourhood_cleansed,
        price: listing.price,
        room_type: listing.room_type,
      }));

      return NextResponse.json(mapData);
    }

    const csvText = fs.readFileSync(csvPath, "utf-8");

    // Parse CSV
    const listings = parseCSVToListings(csvText);

    // Process listings (filter invalid and outliers)
    const processedListings = processListings(listings);

    // Calculate additional fields
    const enhancedListings = enhanceListings(processedListings);

    // Cache the enhanced listings
    cachedListings = enhancedListings;
    cacheTimestamp = Date.now();

    // Filter the data
    const filteredListings = filterListings(enhancedListings, filters);

    // Map to minimal fields for map
    const mapData = filteredListings.map((listing) => ({
      latitude: listing.latitude,
      longitude: listing.longitude,
      name: listing.name,
      neighbourhood_cleansed: listing.neighbourhood_cleansed,
      price: listing.price,
      room_type: listing.room_type,
    }));

    return NextResponse.json(mapData);
  } catch (error) {
    console.error("Error loading map listings:", error);
    return NextResponse.json(
      { error: "Failed to load map listings" },
      { status: 500 },
    );
  }
}
