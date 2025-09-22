import {
  FeaturedListings,
  getCheapestListings,
  getMostReviewedListings,
  getSuperhostListings,
  getTopRatedListings,
} from "@/components/featured-listings";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-static";

export default async function FeaturedPage() {
  // Fetch data at build time
  const [topRated, mostReviewed, superhosts, cheapest] = await Promise.all([
    getTopRatedListings(6),
    getMostReviewedListings(6),
    getSuperhostListings(6),
    getCheapestListings(6),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Featured Listings"
        subtitle="Statically generated showcase of our top listings"
        backHref="/listings"
        backLabel="Back to Dashboard"
      />

      <div className="container mx-auto px-4 py-8 space-y-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Austin's Best</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of exceptional Airbnb listings in
            Austin, Texas. These pages are statically generated at build time
            for optimal performance.
          </p>
        </div>

        <FeaturedListings title="🏆 Top Rated Listings" listings={topRated} />

        <FeaturedListings title="💬 Most Reviewed" listings={mostReviewed} />

        <FeaturedListings
          title="⭐ Superhost Favorites"
          listings={superhosts}
        />

        <FeaturedListings
          title="💰 Budget-Friendly Options"
          listings={cheapest}
        />

        <div className="text-center py-12">
          <div className="bg-muted/50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Next.js Static Generation
            </h3>
            <p className="text-muted-foreground mb-6">
              This page demonstrates Next.js static site generation (SSG)
              capabilities. All listing data is fetched from the database at
              build time and cached as static HTML.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-background rounded p-4">
                <div className="font-semibold mb-2">⚡ Fast Loading</div>
                <div>Pre-rendered HTML served instantly</div>
              </div>
              <div className="bg-background rounded p-4">
                <div className="font-semibold mb-2">🔍 SEO Optimized</div>
                <div>Full content available to search engines</div>
              </div>
              <div className="bg-background rounded p-4">
                <div className="font-semibold mb-2">📊 Database Queries</div>
                <div>Efficient queries executed at build time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
