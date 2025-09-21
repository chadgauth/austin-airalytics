"use client";

import ListingDetail from "@/components/ListingDetail";
import { trpc } from "@/lib/trpc/client";

export default function DynamicListingClient({ id }: { id: string }) {
  const { data, isLoading, error } = trpc.listings.getListing.useQuery({ id });

  if (isLoading) return <div>Loading...</div>;

  if (error || !data) return <div>Listing not found</div>;

  return <ListingDetail listing={data} />;
}
