"use client";

import ListingDetail from "@/components/listing-detail";
import { trpc } from "@/utils/trpc";

export default function DynamicListingClient({ id }: { id: string }) {
  const { data, isLoading, error } = trpc.listings.getListing.useQuery({ id });

  if (isLoading) return <div>Loading...</div>;

  if (error || !data) return <div>Listing not found</div>;

  return <ListingDetail listing={data} />;
}
