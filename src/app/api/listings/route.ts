import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { parseCSVToListings } from "@/lib/csv-parser";
import { enhanceListings, processListings } from "@/lib/listings-processor";
import type { Listing } from "@/types/listings";

// High-value cache: Caches the processed and enhanced listings to avoid expensive CSV parsing,
// data processing, and enhancement calculations on every request. This is more efficient than
// caching per page/sort combination since the heavy lifting (parsing, filtering outliers,
// calculating derived fields) is done once and reused. Sorting and pagination are lightweight
// operations performed on the cached data per request.
let cachedListings: Listing[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = process.env.NODE_ENV === 'development' ? 30 * 1000 : 5 * 60 * 1000; // 30 seconds dev, 5 minutes prod


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search') || '';

    // Helper function to filter listings by search term
    const filterListings = (listings: Listing[], searchTerm: string): Listing[] => {
      if (!searchTerm.trim()) return listings;
      const term = searchTerm.toLowerCase();
      return listings.filter(listing =>
        listing.name.toLowerCase().includes(term)
      );
    };

    // Helper function to sort listings
    const sortListings = (listings: Listing[]): Listing[] => {
      return [...listings].sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Handle numeric strings (like price)
        const aNum = typeof aValue === 'string' ? parseFloat(aValue) : (typeof aValue === 'number' ? aValue : NaN);
        const bNum = typeof bValue === 'string' ? parseFloat(bValue) : (typeof bValue === 'number' ? bValue : NaN);

        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Fallback to string comparison
        const aStr = String(aValue);
        const bStr = String(bValue);
        return sortOrder === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    };

    // Read CSV from public directory
    const csvPath = path.join(process.cwd(), "src", "data", "listings.csv");
    const stats = fs.statSync(csvPath);
    const fileModified = stats.mtime.getTime();

    // Check cache
    if (
      cachedListings &&
      Date.now() - cacheTimestamp < CACHE_DURATION &&
      fileModified <= cacheTimestamp
    ) {
      // Sort cached enhanced listings per request
      const sortedListings = sortListings(cachedListings);

      // Filter by search term
      const filteredListings = filterListings(sortedListings, search);

      const total = filteredListings.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredListings.slice(startIndex, endIndex);

      return NextResponse.json({
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      });
    }

    const csvText = fs.readFileSync(csvPath, "utf-8");

    // Parse CSV
    const listings = parseCSVToListings(csvText);

    // Process listings (filter invalid and outliers)
    const processedListings = processListings(listings);

    // Calculate additional fields
    const enhancedListings = enhanceListings(processedListings);

    // Cache the enhanced listings (before sorting, as sorting is per-request)
    cachedListings = enhancedListings;
    cacheTimestamp = Date.now();

    // Sort the data
    const sortedListings = sortListings(enhancedListings);

    // Filter by search term
    const filteredListings = filterListings(sortedListings, search);

    const total = filteredListings.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredListings.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error("Error loading listings:", error);
    return NextResponse.json(
      { error: "Failed to load listings" },
      { status: 500 },
    );
  }
}
