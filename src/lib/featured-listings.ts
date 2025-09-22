import { and, asc, desc, eq, gt, isNotNull, ne } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import { hosts, listings as listingsTable } from "@/db/schema";

function getLocalImagePath(
  id: string,
  originalUrl: string,
  size: "card" | "detail" = "card",
): string {
  const imagesDir = path.join(process.cwd(), "public", "images", "listings");
  const suffix = size === "card" ? "_388x388" : "_824x463";
  const filename = `${id}${suffix}.webp`;
  const filepath = path.join(imagesDir, filename);

  if (fs.existsSync(filepath)) {
    return `/images/listings/${filename}`;
  }
  return originalUrl;
}

// Static data fetching functions for build time
export async function getTopRatedListings(limit = 6) {
  try {
    const rawListings = await db
      .select({
        id: listingsTable.id,
        name: listingsTable.name,
        picture_url: listingsTable.picture_url,
        price: listingsTable.price,
        neighbourhood_cleansed: listingsTable.neighbourhood_cleansed,
        review_scores_rating: listingsTable.review_scores_rating,
        number_of_reviews: listingsTable.number_of_reviews,
        room_type: listingsTable.room_type,
        host_name: hosts.name,
        host_is_superhost: hosts.is_superhost,
      })
      .from(listingsTable)
      .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
      .where(
        and(
          isNotNull(listingsTable.review_scores_rating),
          gt(listingsTable.number_of_reviews, 5),
          isNotNull(listingsTable.price),
          ne(listingsTable.price, ""),
          ne(listingsTable.price, "N/A"),
        ),
      )
      .orderBy(desc(listingsTable.review_scores_rating))
      .limit(limit);

    return rawListings.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      picture_url: getLocalImagePath(
        String(row.id),
        row.picture_url || "",
        "card",
      ),
      price: row.price || "",
      neighbourhood_cleansed: row.neighbourhood_cleansed || "",
      review_scores_rating: String(row.review_scores_rating || ""),
      number_of_reviews: String(row.number_of_reviews || ""),
      room_type: row.room_type || "",
      host_name: row.host_name || "",
      host_is_superhost: String(row.host_is_superhost || false),
    }));
  } catch (error) {
    console.error("Failed to fetch top rated listings:", error);
    return [];
  }
}

export async function getMostReviewedListings(limit = 6) {
  try {
    const rawListings = await db
      .select({
        id: listingsTable.id,
        name: listingsTable.name,
        picture_url: listingsTable.picture_url,
        price: listingsTable.price,
        neighbourhood_cleansed: listingsTable.neighbourhood_cleansed,
        review_scores_rating: listingsTable.review_scores_rating,
        number_of_reviews: listingsTable.number_of_reviews,
        room_type: listingsTable.room_type,
        host_name: hosts.name,
        host_is_superhost: hosts.is_superhost,
      })
      .from(listingsTable)
      .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
      .where(
        and(
          ne(listingsTable.id, 48867583),
          isNotNull(listingsTable.price),
          ne(listingsTable.price, ""),
          ne(listingsTable.price, "N/A"),
        ),
      )
      .orderBy(desc(listingsTable.number_of_reviews))
      .limit(limit);

    return rawListings.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      picture_url: getLocalImagePath(
        String(row.id),
        row.picture_url || "",
        "card",
      ),
      price: row.price || "",
      neighbourhood_cleansed: row.neighbourhood_cleansed || "",
      review_scores_rating: String(row.review_scores_rating || ""),
      number_of_reviews: String(row.number_of_reviews || ""),
      room_type: row.room_type || "",
      host_name: row.host_name || "",
      host_is_superhost: String(row.host_is_superhost || false),
    }));
  } catch (error) {
    console.error("Failed to fetch most reviewed listings:", error);
    return [];
  }
}

export async function getSuperhostListings(limit = 6) {
  try {
    const rawListings = await db
      .select({
        id: listingsTable.id,
        name: listingsTable.name,
        picture_url: listingsTable.picture_url,
        price: listingsTable.price,
        neighbourhood_cleansed: listingsTable.neighbourhood_cleansed,
        review_scores_rating: listingsTable.review_scores_rating,
        number_of_reviews: listingsTable.number_of_reviews,
        room_type: listingsTable.room_type,
        host_name: hosts.name,
        host_is_superhost: hosts.is_superhost,
      })
      .from(listingsTable)
      .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
      .where(
        and(
          eq(hosts.is_superhost, true),
          isNotNull(listingsTable.price),
          ne(listingsTable.price, ""),
          ne(listingsTable.price, "N/A"),
        ),
      )
      .orderBy(desc(listingsTable.review_scores_rating))
      .limit(limit);

    return rawListings.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      picture_url: getLocalImagePath(
        String(row.id),
        row.picture_url || "",
        "card",
      ),
      price: row.price || "",
      neighbourhood_cleansed: row.neighbourhood_cleansed || "",
      review_scores_rating: String(row.review_scores_rating || ""),
      number_of_reviews: String(row.number_of_reviews || ""),
      room_type: row.room_type || "",
      host_name: row.host_name || "",
      host_is_superhost: String(row.host_is_superhost || false),
    }));
  } catch (error) {
    console.error("Failed to fetch superhost listings:", error);
    return [];
  }
}

export async function getCheapestListings(limit = 6) {
  try {
    const rawListings = await db
      .select({
        id: listingsTable.id,
        name: listingsTable.name,
        picture_url: listingsTable.picture_url,
        price: listingsTable.price,
        neighbourhood_cleansed: listingsTable.neighbourhood_cleansed,
        review_scores_rating: listingsTable.review_scores_rating,
        number_of_reviews: listingsTable.number_of_reviews,
        room_type: listingsTable.room_type,
        host_name: hosts.name,
        host_is_superhost: hosts.is_superhost,
      })
      .from(listingsTable)
      .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
      .where(
        and(
          isNotNull(listingsTable.price),
          ne(listingsTable.price, ""),
          ne(listingsTable.price, "N/A"),
          gt(listingsTable.price, "0"),
        ),
      )
      .orderBy(asc(listingsTable.price))
      .limit(limit);

    return rawListings.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      picture_url: getLocalImagePath(
        String(row.id),
        row.picture_url || "",
        "card",
      ),
      price: row.price || "",
      neighbourhood_cleansed: row.neighbourhood_cleansed || "",
      review_scores_rating: String(row.review_scores_rating || ""),
      number_of_reviews: String(row.number_of_reviews || ""),
      room_type: row.room_type || "",
      host_name: row.host_name || "",
      host_is_superhost: String(row.host_is_superhost || false),
    }));
  } catch (error) {
    console.error("Failed to fetch cheapest listings:", error);
    return [];
  }
}

// Function to get all unique listing IDs from featured listings for static generation
export async function getFeaturedListingIds() {
  try {
    const [topRated, mostReviewed, superhost, cheapest] = await Promise.all([
      getTopRatedListings(6),
      getMostReviewedListings(6),
      getSuperhostListings(6),
      getCheapestListings(6),
    ]);

    const allListings = [
      ...topRated,
      ...mostReviewed,
      ...superhost,
      ...cheapest,
    ];
    const uniqueIds = [...new Set(allListings.map((listing) => listing.id))];

    return uniqueIds;
  } catch (error) {
    console.error("Failed to fetch featured listing IDs:", error);
    return [];
  }
}