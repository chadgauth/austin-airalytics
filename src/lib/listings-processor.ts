import { calculateIQRBounds, isOutlier } from "./utils";
import type { Listing } from "@/types/listings";

/**
 * Processes listings by filtering invalid entries and outliers.
 * Outliers are detected per neighbourhood_group using IQR method.
 */
export function processListings(listings: Listing[]): Listing[] {
  // Filter out invalid listings (price <= 0)
  const filtered = listings.filter((listing) => {
    const price = parseFloat(listing.price) || 0;
    const availability = parseFloat(listing.availability_365) || 0;
    return price > 0 && availability > 0;
  });

  // Group by neighbourhood_group for location-specific outlier detection
  const grouped = filtered.reduce(
    (acc, listing) => {
      const group = listing.neighbourhood_group || "Unknown";
      if (!acc[group]) acc[group] = [];
      acc[group].push(listing);
      return acc;
    },
    {} as Record<string, Listing[]>,
  );

  // Filter outliers per group
  const processedListings: Listing[] = [];
  for (const groupListings of Object.values(grouped)) {
    if (groupListings.length < 4) {
      // Not enough data for IQR, include all
      processedListings.push(...groupListings);
      continue;
    }

    const BASE_10 = 10;

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
      const price = parseFloat(listing.price);
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
 */
export function calculateRiskScore(listing: Listing): number {
  const base = 0;

  // Room type factor
  let room_type_factor = 0;
  switch (listing.room_type.toLowerCase()) {
    case "entire home/apt":
      room_type_factor = 0;
      break;
    case "private room":
      room_type_factor = 1;
      break;
    case "shared room":
      room_type_factor = 2;
      break;
    case "hotel room":
      room_type_factor = 1;
      break;
    default:
      room_type_factor = 1;
  }

  // Occupancy factor (higher when less available)
  const availability = Number.parseInt(listing.availability_365, 10) || 0;
  const occupancy_factor = ((365 - availability) / 365) * 10;

  // Host exposure factor
  const host_listings =
    parseInt(listing.calculated_host_listings_count, 10) || 0;
  const host_exposure_factor = Math.min(host_listings / 10, 5);

  // Reviews factor (lower with more reviews)
  const reviews = parseInt(listing.number_of_reviews, 10) || 0;
  const reviews_factor = Math.max(0, 10 - reviews / 10);

  return (
    base +
    room_type_factor +
    occupancy_factor +
    host_exposure_factor +
    reviews_factor
  );
}

/**
 * Enhances listings with calculated fields.
 */
export function enhanceListings(listings: Listing[]): Listing[] {
  return listings.map((listing) => {
    const price = parseFloat(listing.price) || 0;
    const availability = parseInt(listing.availability_365, 10) || 0;

    return {
      ...listing,
      potential_revenue: price * availability,
      risk_score: calculateRiskScore(listing),
    };
  });
}
