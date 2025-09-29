import {
  ArrowRight,
  BarChart3,
  Database,
  Globe,
  Image,
  Layers,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import PricePredictor from "@/components/price-predictor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title:
    "Rental Insight Pro - Austin Airbnb Analytics Case Study | Next.js 15 & tRPC",
  description:
    "Explore Austin's Airbnb market with advanced analytics. Built with Next.js 15, tRPC, Supabase, and static optimization. Case study showcasing modern web development techniques for rental property insights.",
  keywords: [
    "Austin Airbnb analytics",
    "rental property insights",
    "Next.js 15 case study",
    "tRPC dashboard",
    "Supabase PostgreSQL",
    "static site generation",
    "image optimization",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
  ],
  authors: [{ name: "Rental Insight Pro Team" }],
  openGraph: {
    title: "Rental Insight Pro - Austin Airbnb Analytics Case Study",
    description:
      "Advanced Airbnb analytics platform built with cutting-edge web technologies. Explore Austin's rental market with real-time data and insights.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rental Insight Pro - Austin Airbnb Analytics",
    description:
      "Case study of a modern analytics platform for Austin's Airbnb market using Next.js 15, tRPC, and Supabase.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      {/* Price Predictor */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Predict Your Airbnb Nightly Rate
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use our AI-powered predictor to estimate optimal pricing for your Austin property.
              Get data-driven insights based on 7,000+ listings and advanced market analytics.
            </p>
          </div>
          <PricePredictor />
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Technical Excellence
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built with cutting-edge technologies and best practices for
              performance, scalability, and developer experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-primary" />
                    Next.js 15 & Static Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Leveraging App Router with static generation for optimal
                    performance. Routes compiled at build time for instant loading
                    and superior SEO.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Database className="h-6 w-6 text-accent" />
                    tRPC & Advanced Filtering
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Type-safe API layer with tRPC enabling complex dashboard
                    queries. Real-time filtering across price, location, ratings,
                    and amenities.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Layers className="h-6 w-6 text-primary" />
                    Supabase & PostgreSQL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Serverless PostgreSQL database with real-time subscriptions.
                    Drizzle ORM for type-safe database operations and migrations.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Image className="h-6 w-6 text-accent" />
                    Static Image Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Automatic optimization of remote Airbnb images. WebP
                    conversion, responsive sizing, and lazy loading for optimal
                    performance.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="h-6 w-6 text-primary" />
                    Vercel Deployment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Global CDN distribution with edge functions. Automatic
                    scaling, preview deployments, and analytics integration.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-accent" />
                    Interactive Maps & Charts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Leaflet-powered interactive maps with clustering. Real-time
                    data visualization with custom charts and filtering
                    capabilities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
      </section>

      {/* Detailed Technical Explanations */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Deep Dive: Technical Implementation
            </h2>

            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Static Site Generation & Performance
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Our featured listings page demonstrates Next.js 15's static
                  generation capabilities. All data is fetched at build time
                  using server components, resulting in pre-rendered HTML that
                  loads instantly. This approach eliminates database queries on
                  the client-side for static content while maintaining dynamic
                  capabilities where needed.
                </p>
                <div className="bg-background rounded-lg p-6 border">
                  <pre className="text-sm overflow-x-auto">
                    <code className="font-mono">
                      {`export const dynamic = "force-static";

export default async function FeaturedPage() {
  const listings = await getTopRatedListings(6);
  // Data fetched at build time, cached as static HTML
}`}
                    </code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-accent">
                  tRPC for Type-Safe APIs
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  tRPC provides end-to-end type safety between frontend and
                  backend. Our dashboard uses complex filtering logic that
                  benefits from automatic type inference. The filtering system
                  supports multiple criteria including price ranges, locations,
                  property types, and host characteristics.
                </p>
                <div className="bg-background rounded-lg p-6 border">
                  <pre className="text-sm overflow-x-auto">
                    <code className="font-mono">
                      {`// Type-safe API with automatic inference
const { data } = trpc.listings.getFiltered.useQuery({
  filters: {
    minPrice: 100,
    maxPrice: 500,
    propertyTypes: ['Apartment', 'House']
  }
});`}
                    </code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Image Optimization Pipeline
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Remote Airbnb images are automatically optimized using Next.js
                  Image component. Images are converted to WebP format, resized
                  responsively, and served via CDN. This reduces bandwidth by up
                  to 70% while maintaining visual quality.
                </p>
                <div className="bg-background rounded-lg p-6 border">
                  <pre className="text-sm overflow-x-auto">
                    <code className="font-mono">
                      {`<Image
  src="https://a0.muscache.com/remote-image.jpg"
  alt="Listing"
  width={388}
  height={388}
  className="rounded-lg"
/>`}
                    </code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-accent">
                  Database Architecture
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Supabase provides a PostgreSQL database with real-time
                  capabilities. Drizzle ORM ensures type-safe queries and
                  migrations. The schema includes comprehensive listing data
                  with relationships for hosts, reviews, and location
                  information.
                </p>
                <div className="bg-background rounded-lg p-6 border">
                  <pre className="text-sm overflow-x-auto">
                    <code className="font-mono">
                      {`export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  // ... comprehensive schema
});`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-accent-500 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Austin's Airbnb Market?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Dive into comprehensive analytics, interactive maps, and detailed
            property insights powered by modern web technologies.
          </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-lg px-8 py-6"
            >
              <Link href="/listings">
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
      </section>
    </div>
  );
}
