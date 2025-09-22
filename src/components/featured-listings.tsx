import { type FeaturedListing, ListingCard } from "./listing-card";

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
            <div key={listing.id}>
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
