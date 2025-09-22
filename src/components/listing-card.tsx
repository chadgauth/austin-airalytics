"use client";

import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/server-utils";

export interface FeaturedListing {
  id: string;
  name: string;
  picture_url: string;
  price: string;
  neighbourhood_cleansed: string;
  review_scores_rating: string;
  number_of_reviews: string;
  room_type: string;
  host_name: string;
  host_is_superhost: string;
}

export function ListingCard({ listing }: { listing: FeaturedListing }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        router.push(`/listings/${listing.id}`);
      });
    } else {
      router.push(`/listings/${listing.id}`);
    }
  };

  const largerImageUrl = listing.picture_url.replace("_388x388", "_824x463");

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={listing.picture_url}
            alt={listing.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            style={{ viewTransitionName: `listing-image-${listing.id}` }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {isHovered && (
            <Image
              src={largerImageUrl}
              alt=""
              width={824}
              height={463}
              style={{ display: "none" }}
            />
          )}
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-white/90 text-black shadow-sm"
            >
              {formatCurrency(listing.price)}/night
            </Badge>
          </div>
          {listing.host_is_superhost === "true" && (
            <div className="absolute top-2 left-2">
              <Badge
                variant="default"
                className="bg-white/90 text-black shadow-sm"
              >
                Superhost
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {listing.review_scores_rating}
            </span>
            <span className="text-sm text-muted-foreground">
              ({listing.number_of_reviews} reviews)
            </span>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 mb-1" style={{ viewTransitionName: `listing-title-${listing.id}` }}>
            {listing.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            {listing.neighbourhood_cleansed}
          </div>
          <Badge variant="outline" className="text-xs">
            {listing.room_type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}