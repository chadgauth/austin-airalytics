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
import type { Filters, Listing } from "@/types/listings";

const sortListings = (listings: Listing[], sortBy: string, sortOrder: string): Listing[] => {
  return [...listings].sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle numeric strings (like price)
    const aNum =
      typeof aValue === "string"
        ? sortBy === "price"
          ? parseFloat(aValue.replace(/[^0-9.-]/g, ""))
          : parseFloat(aValue)
        : typeof aValue === "number"
          ? aValue
          : NaN;
    const bNum =
      typeof bValue === "string"
        ? sortBy === "price"
          ? parseFloat(bValue.replace(/[^0-9.-]/g, ""))
          : parseFloat(bValue)
        : typeof bValue === "number"
          ? bValue
          : NaN;

    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    }

    // Fallback to string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortOrder === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
};

const processAndPaginate = (
  listings: Listing[],
  filters: Filters,
  search: string,
  sortBy: string,
  sortOrder: string,
  page: number,
  pageSize: number
) => {
  const filteredListings = filterListings(listings, filters, search);
  const sortedListings = sortListings(filteredListings, sortBy, sortOrder);
  const total = sortedListings.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedListings.slice(startIndex, endIndex);
  return {
    data: paginatedData,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

// Cache enhanced listings to avoid repeated expensive operations like CSV parsing and data enhancement.
// Sorting and pagination are lightweight and done per request on cached data.
let cachedListings: Listing[] | null = null;
let cacheTimestamp = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const search = searchParams.get("search") || "";

    // Parse filter parameters
    const filters = parseFilters(searchParams);

    // Read CSV from public directory
    const csvPath = path.join(process.cwd(), "src", "data", "listings.csv");
    const stats = fs.statSync(csvPath);
    const fileModified = stats.mtime.getTime();

    // Check cache
    if (cachedListings && isCacheValid(cacheTimestamp, fileModified)) {
      const result = processAndPaginate(cachedListings, filters, search, sortBy, sortOrder, page, pageSize);
      return NextResponse.json(result);
    }

    const csvText = fs.readFileSync(csvPath, "utf-8");
    const listings = parseCSVToListings(csvText);
    const processedListings = processListings(listings);
    const enhancedListings = enhanceListings(processedListings);

    cachedListings = enhancedListings;
    cacheTimestamp = Date.now();

    const result = processAndPaginate(enhancedListings, filters, search, sortBy, sortOrder, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error loading listings:", error);
    return NextResponse.json(
      { error: "Failed to load listings" },
      { status: 500 },
    );
  }
}
