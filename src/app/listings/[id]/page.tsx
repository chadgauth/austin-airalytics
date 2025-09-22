import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import DynamicListingClient from "./dynamic-listing-client";
import { getFeaturedListingIds } from "@/components/featured-listings";
import ListingDetail from "@/components/listing-detail";
import { db } from "@/db";
import { hosts, listings as listingsTable } from "@/db/schema";
import { fetchListings, listingSelect } from "@/lib/listings-db";

export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = await getFeaturedListingIds();
  return ids.map((id) => ({
    id: id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;

  const featuredIds = await getFeaturedListingIds();
  if (!featuredIds.includes(id)) {
    return <DynamicListingClient id={id} />;
  }

  // Fetch listing data directly
  const rawListing = await db
    .select(listingSelect)
    .from(listingsTable)
    .leftJoin(hosts, eq(listingsTable.host_id, hosts.id))
    .where(eq(listingsTable.id, parseInt(id, 10)))
    .limit(1);

  const listings = await fetchListings(rawListing);

  if (listings.length === 0) {
    notFound();
  }

  const finalListing = listings[0];

  return <ListingDetail listing={finalListing} />;
}
