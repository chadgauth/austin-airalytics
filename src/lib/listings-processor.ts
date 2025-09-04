import { BASE_10 } from "./constants";
import type { Filters } from "@/types/filters";
import type { Listing } from "@/types/listings";

/**
 * Helper function to filter by string array values
 */
function filterByStringArray(
  listings: Listing[],
  field: keyof Listing,
  values: string[],
): Listing[] {
  if (values.length === 0) return listings;
  return listings.filter((listing) =>
    values.includes(listing[field] as string),
  );
}

/**
 * Helper function to filter by numeric range
 */
function filterByNumericRange(
  listings: Listing[],
  field: keyof Listing,
  min: number | null,
  max: number | null,
  parser: (value: string) => number,
): Listing[] {
  let filtered = listings;
  if (min !== null) {
    filtered = filtered.filter(
      (listing) => parser(listing[field] as string) >= min,
    );
  }
  if (max !== null) {
    filtered = filtered.filter(
      (listing) => parser(listing[field] as string) <= max,
    );
  }
  return filtered;
}

/**
 * Filters listings based on provided filters and optional search term.
 */
export function filterListings(
  listings: Listing[],
  filters: Filters,
  searchTerm?: string,
): Listing[] {
  let filtered = listings;

  if (searchTerm?.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter((listing) =>
      listing.name.toLowerCase().includes(term),
    );
  }

  filtered = filterByStringArray(
    filtered,
    "neighbourhood_cleansed",
    filters.zipCodes,
  );
  filtered = filterByStringArray(filtered, "room_type", filters.roomTypes);
  filtered = filterByNumericRange(
    filtered,
    "price",
    filters.minPrice,
    filters.maxPrice,
    (value) => parseFloat(value.replace(/[^0-9.-]/g, "")),
  );
  filtered = filterByStringArray(
    filtered,
    "property_type",
    filters.propertyTypes,
  );
  filtered = filterByNumericRange(
    filtered,
    "accommodates",
    filters.minAccommodates,
    filters.maxAccommodates,
    (value) => parseInt(value, BASE_10),
  );
  filtered = filterByNumericRange(
    filtered,
    "bedrooms",
    filters.minBedrooms,
    filters.maxBedrooms,
    (value) => parseInt(value, BASE_10),
  );
  filtered = filterByNumericRange(
    filtered,
    "review_scores_rating",
    filters.minReviewScore,
    filters.maxReviewScore,
    (value) => parseFloat(value),
  );
  if (filters.hostIsSuperhost) {
    filtered = filtered.filter((listing) => listing.host_is_superhost === "t");
  }
  if (filters.instantBookable) {
    filtered = filtered.filter((listing) => listing.instant_bookable === "t");
  }

  return filtered;
}
/**
 * Calculates the Interquartile Range (IQR) bounds for outlier detection.
 * Outlier detection using IQR method:
 * - Sort the values
 * - Find Q1 (25th percentile) and Q3 (75th percentile)
 * - IQR = Q3 - Q1
 * - Lower bound = Q1 - multiplier * IQR
 * - Upper bound = Q3 + multiplier * IQR
 * - Values outside these bounds are considered outliers
 * Uses a multiplier of 2.0 for more lenient detection, allowing some extreme but valid values.
 * @param values Array of numbers (should be filtered for valid values)
 * @returns Object with lower and upper bounds
 */
export function calculateIQRBounds(values: number[]): {
  lower: number;
  upper: number;
} {
  if (values.length === 0) return { lower: -Infinity, upper: Infinity };

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lower = q1 - 2.0 * iqr;
  const upper = q3 + 2.0 * iqr;

  return { lower, upper };
}

/**
 * Checks if a value is an outlier based on IQR bounds.
 * @param value The value to check
 * @param bounds The IQR bounds
 * @returns True if outlier
 */
export function isOutlier(
  value: number,
  bounds: { lower: number; upper: number },
): boolean {
  return value < bounds.lower || value > bounds.upper;
}

/**
 * Processes listings by filtering invalid entries and outliers.
 * Outliers are detected per neighbourhood_group using IQR method.
 */
export function processListings(listings: Listing[]): Listing[] {
  // Filter out invalid listings (price <= 0)
  const filtered = listings.filter((listing) => {
    const price = parseFloat(listing.price.replace("$", "")) || 0;
    const availability = parseFloat(listing.availability_365) || 0;
    return price > 0 && availability > 0;
  });

  // Group by neighbourhood_group for location-specific outlier detection
  const grouped = filtered.reduce(
    (acc, listing) => {
      const group = listing.neighbourhood_group_cleansed || "Unknown";
      if (!acc[group]) acc[group] = [];
      acc[group].push(listing);
      return acc;
    },
    {} as Record<string, Listing[]>,
  );

  // Filter outliers per group
  const processedListings: Listing[] = [];
  for (const [groupName, groupListings] of Object.entries(grouped)) {
    if (groupListings.length < 4 || groupName === "Unknown") {
      // Not enough data for IQR or unknown group, include all
      processedListings.push(...groupListings);
      continue;
    }

    // Extract numeric values for this group
    const prices = groupListings
      .map((l) => parseFloat(l.price))
      .filter((v) => !Number.isNaN(v));
    const minNights = groupListings
      .map((l) => parseInt(l.minimum_nights, BASE_10))
      .filter((v) => !Number.isNaN(v));
    const reviewsPerMonth = groupListings
      .map((l) => parseFloat(l.reviews_per_month))
      .filter((v) => !Number.isNaN(v) && v > 0);
    const numReviews = groupListings
      .map((l) => parseInt(l.number_of_reviews, BASE_10))
      .filter((v) => !Number.isNaN(v));
    const availability = groupListings
      .map((l) => parseInt(l.availability_365, BASE_10))
      .filter((v) => !Number.isNaN(v));

    // Calculate IQR bounds for this group
    const priceBounds = calculateIQRBounds(prices);
    const minNightsBounds = calculateIQRBounds(minNights);
    const reviewsPerMonthBounds = calculateIQRBounds(reviewsPerMonth);
    const numReviewsBounds = calculateIQRBounds(numReviews);
    const availabilityBounds = calculateIQRBounds(availability);

    // Filter outliers in this group
    const filteredGroup = groupListings.filter((listing) => {
      const price = parseFloat(listing.price.replace("$", ""));
      const minNight = parseInt(listing.minimum_nights, 10);
      const rpm = parseFloat(listing.reviews_per_month);
      const nr = parseInt(listing.number_of_reviews, 10);
      const avail = parseInt(listing.availability_365, 10);

      return !(
        isOutlier(price, priceBounds) ||
        isOutlier(minNight, minNightsBounds) ||
        (rpm > 0 && isOutlier(rpm, reviewsPerMonthBounds)) ||
        isOutlier(nr, numReviewsBounds) ||
        isOutlier(avail, availabilityBounds)
      );
    });

    processedListings.push(...filteredGroup);
  }

  return processedListings;
}

/**
 * Calculates risk score for a listing.
 * Score ranges from 0-50, where lower is better.
 * Factors: room type, occupancy, host exposure, reviews, minimum nights, reviews per month.
 */
export function calculateRiskScore(listing: Listing): number {
  // Room type factor (0-2, scaled to 0-10)
  let room_type_factor = 0;
  switch (listing.room_type.toLowerCase()) {
    case "entire home/apt":
      room_type_factor = 0;
      break;
    case "private room":
      room_type_factor = 5;
      break;
    case "shared room":
      room_type_factor = 10;
      break;
    case "hotel room":
      room_type_factor = 5;
      break;
    default:
      room_type_factor = 5;
  }

  // Occupancy factor (0-10, higher when less available)
  const availability = Number.parseInt(listing.availability_365, 10) || 0;
  const occupancy_factor = ((365 - availability) / 365) * 10;

  // Host exposure factor (0-10, scaled from 0-5)
  const host_listings =
    parseInt(listing.calculated_host_listings_count, 10) || 0;
  const host_exposure_factor = Math.min(host_listings / 10, 5) * 2;

  // Reviews factor (0-10, lower with more reviews)
  const reviews = parseInt(listing.number_of_reviews, 10) || 0;
  const reviews_factor = Math.max(0, 10 - reviews / 10);

  // Minimum nights factor (0-10, higher with longer minimum stays)
  const min_nights = parseInt(listing.minimum_nights, 10) || 1;
  const min_nights_factor = Math.min(min_nights / 30, 1) * 10;

  // Reviews per month factor (0-10, lower with more frequent reviews)
  const rpm = parseFloat(listing.reviews_per_month) || 0;
  const rpm_factor = rpm > 0 ? Math.max(0, 10 - rpm * 2) : 10;

  // Weighted sum (total 0-50)
  return (
    room_type_factor +
    occupancy_factor +
    host_exposure_factor +
    reviews_factor +
    min_nights_factor +
    rpm_factor
  );
}

/**
 * Calculates average prices per neighbourhood (zip code).
 */
export function calculateAveragePricesByZip(
  listings: Listing[],
): Record<string, number> {
  const zipPrices: Record<string, number[]> = {};

  listings.forEach((listing) => {
    const zip = listing.neighbourhood_cleansed;
    const price = parseFloat(listing.price.replace("$", ""));
    if (zip && !Number.isNaN(price) && price > 0) {
      if (!zipPrices[zip]) {
        zipPrices[zip] = [];
      }
      zipPrices[zip].push(price);
    }
  });

  const averages: Record<string, number> = {};
  for (const [zip, prices] of Object.entries(zipPrices)) {
    const sum = prices.reduce((acc, price) => acc + price, 0);
    averages[zip] = Math.round(sum / prices.length);
  }

  return averages;
}

/**
 * Enhances listings with calculated fields.
 */
export function enhanceListings(listings: Listing[]): Listing[] {
  return listings.map((listing) => {
    const price = parseFloat(listing.price.replace("$", "")) || 0;
    const availability = parseInt(listing.availability_365, 10) || 0;

    return {
      ...listing,
      potential_revenue: price * availability,
      risk_score: calculateRiskScore(listing),
    };
  });
}
/**
 * Calculates volume distribution (histogram) for numeric values.
 * @param values Array of numeric values
 * @param min Minimum value for the range
 * @param max Maximum value for the range
 * @param bins Number of bins (default 50)
 * @returns Array of counts per bin
 */
export function calculateVolumes(
  values: number[],
  min: number,
  max: number,
  bins: number = 50,
): number[] {
  if (values.length === 0 || min >= max) {
    return new Array(bins).fill(0);
  }

  const range = max - min;
  const binSize = range / bins;
  const volumes = new Array(bins).fill(0);

  values.forEach((value) => {
    if (value >= min && value <= max) {
      const bin = Math.floor((value - min) / binSize);
      const clampedBin = Math.min(bin, bins - 1);
      volumes[clampedBin]++;
    }
  });

  return volumes;
}

/**
 * Parses search parameters into Filters object.
 */
export function parseFilters(searchParams: URLSearchParams): Filters {
  const zipParam = searchParams.get("zip");
  const zipCodes = zipParam ? zipParam.split(",") : [];

  const roomTypeParam = searchParams.get("roomType");
  const roomTypes = roomTypeParam ? roomTypeParam.split(",") : [];

  const propertyTypeParam = searchParams.get("propertyType");
  const propertyTypes = propertyTypeParam ? propertyTypeParam.split(",") : [];

  const minPriceParam = searchParams.get("minPrice");
  const minPrice = minPriceParam ? parseFloat(minPriceParam) : null;

  const maxPriceParam = searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : null;

  const minAccommodatesParam = searchParams.get("minAccommodates");
  const minAccommodates = minAccommodatesParam
    ? parseInt(minAccommodatesParam, 10)
    : null;

  const maxAccommodatesParam = searchParams.get("maxAccommodates");
  const maxAccommodates = maxAccommodatesParam
    ? parseInt(maxAccommodatesParam, 10)
    : null;

  const minBedroomsParam = searchParams.get("minBedrooms");
  const minBedrooms = minBedroomsParam ? parseInt(minBedroomsParam, 10) : null;

  const maxBedroomsParam = searchParams.get("maxBedrooms");
  const maxBedrooms = maxBedroomsParam ? parseInt(maxBedroomsParam, 10) : null;

  const minReviewScoreParam = searchParams.get("minReviewScore");
  const minReviewScore = minReviewScoreParam
    ? parseFloat(minReviewScoreParam)
    : null;

  const maxReviewScoreParam = searchParams.get("maxReviewScore");
  const maxReviewScore = maxReviewScoreParam
    ? parseFloat(maxReviewScoreParam)
    : null;

  const hostIsSuperhost = searchParams.get("hostIsSuperhost") === "true";
  const instantBookable = searchParams.get("instantBookable") === "true";

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
    hostIsSuperhost,
    instantBookable,
  };
}
