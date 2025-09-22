import { Bath, Bed, Home, MapPin, Star, Users, Wifi } from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BASE_10 } from "@/lib/constants";
import type { Listing } from "@/types/listings";
import { decodeHtmlEntities, formatCurrency } from "@/utils/server-utils";

interface ListingDetailProps {
  listing: Listing;
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const amenities = listing.amenities ? JSON.parse(listing.amenities) : [];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={decodeHtmlEntities(listing.name)}
        subtitle={`Hosted by ${decodeHtmlEntities(listing.host_name)}`}
        backHref="/listings"
        backLabel="Back to Listings"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {listing.picture_url && (
                <Image
                  src={listing.picture_url}
                  alt={listing.name}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-white/90 text-black">
                  {formatCurrency(listing.price)}/night
                </Badge>
              </div>
            </div>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {listing.accommodates} guests
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{listing.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{listing.beds} beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{listing.bathrooms} baths</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{listing.room_type}</Badge>
                  <Badge variant="outline">{listing.property_type}</Badge>
                  {listing.instant_bookable === "true" && (
                    <Badge variant="default">Instant Book</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {listing.neighbourhood_cleansed}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {listing.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About this place</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {decodeHtmlEntities(listing.description).replace(
                      /<br\s*\/?>/gi,
                      "\n",
                    )}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Neighborhood */}
            {listing.neighborhood_overview && (
              <Card>
                <CardHeader>
                  <CardTitle>The neighborhood</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {decodeHtmlEntities(listing.neighborhood_overview)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What this place offers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenities.slice(0, 12).map((amenity: string) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Wifi className="h-4 w-4 text-muted-foreground" />
                        {amenity}
                      </div>
                    ))}
                    {amenities.length > 12 && (
                      <div className="text-sm text-muted-foreground">
                        +{amenities.length - 12} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Info */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Hosted by {decodeHtmlEntities(listing.host_name)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                    {listing.host_picture_url && (
                      <Image
                        src={listing.host_picture_url}
                        alt={listing.host_name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {decodeHtmlEntities(listing.host_name)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Host since {new Date(listing.host_since).getFullYear()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Response rate:</span>
                    <span>{listing.host_response_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response time:</span>
                    <span>{listing.host_response_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total listings:</span>
                    <span>{listing.calculated_host_listings_count}</span>
                  </div>
                </div>

                {listing.host_is_superhost === "true" && (
                  <Badge variant="default">Superhost</Badge>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            {parseInt(listing.number_of_reviews, BASE_10) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    {listing.review_scores_rating} · {listing.number_of_reviews}{" "}
                    reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Cleanliness</div>
                      <div>{listing.review_scores_cleanliness}</div>
                    </div>
                    <div>
                      <div className="font-medium">Accuracy</div>
                      <div>{listing.review_scores_accuracy}</div>
                    </div>
                    <div>
                      <div className="font-medium">Communication</div>
                      <div>{listing.review_scores_communication}</div>
                    </div>
                    <div>
                      <div className="font-medium">Location</div>
                      <div>{listing.review_scores_location}</div>
                    </div>
                    <div>
                      <div className="font-medium">Check-in</div>
                      <div>{listing.review_scores_checkin}</div>
                    </div>
                    <div>
                      <div className="font-medium">Value</div>
                      <div>{listing.review_scores_value}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Typical Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Over 30 days:</span>
                    <span>{listing.availability_30} nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Over 60 days:</span>
                    <span>{listing.availability_60} nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Over 90 days:</span>
                    <span>{listing.availability_90} nights</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Score */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Score:</span>
                  <Badge
                    variant={
                      listing.risk_score < 25
                        ? "default"
                        : listing.risk_score < 50
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {listing.risk_score.toFixed(2)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Lower scores indicate lower risk. Based on room type,
                  occupancy, host experience, and reviews.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
