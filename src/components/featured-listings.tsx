import { and, asc, desc, eq, gt, isNotNull, ne } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { type FeaturedListing, ListingCard } from "./listing-card";
import { db } from "@/db";
import { hosts, listings as listingsTable } from "@/db/schema";

function getLocalImagePath(id: string, originalUrl: string, size: 'card' | 'detail' = 'card'): string {
  const imagesDir = path.join(process.cwd(), "public", "images", "listings");
  const suffix = size === 'card' ? '_388x388' : '_824x463';
  const filename = `${id}${suffix}.webp`;
  const filepath = path.join(imagesDir, filename);

  if (fs.existsSync(filepath)) {
    return `/images/listings/${filename}`;
  }
  return originalUrl;
}

interface FeaturedListingsProps {
  title: string;
  listings: FeaturedListing[];
}

export function FeaturedListings({ title, listings }: FeaturedListingsProps) {
  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">
            Discover exceptional stays curated from our collection
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
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
        ),
      )
      .orderBy(desc(listingsTable.review_scores_rating))
      .limit(limit);

    return rawListings.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      picture_url: getLocalImagePath(String(row.id), row.picture_url || "", 'card'),
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
      .where(ne(listingsTable.id, 48867583))
      .orderBy(desc(listingsTable.number_of_reviews))
      .limit(limit);

    return rawListings.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      picture_url: getLocalImagePath(String(row.id), row.picture_url || "", 'card'),
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
      .where(eq(hosts.is_superhost, true))
      .orderBy(desc(listingsTable.review_scores_rating))
      .limit(limit);

    return rawListings.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      picture_url: getLocalImagePath(String(row.id), row.picture_url || "", 'card'),
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
      .where(and(isNotNull(listingsTable.price), gt(listingsTable.price, "0")))
      .orderBy(asc(listingsTable.price))
      .limit(limit);

    return rawListings.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      picture_url: getLocalImagePath(String(row.id), row.picture_url || "", 'card'),
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
