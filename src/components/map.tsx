"use client";

import { Icon } from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet.markercluster";
import type { Listing } from "@/types/listings";

// Fix for default markers in react-leaflet
// biome-ignore lint/suspicious/noExplicitAny: leaflet type not needed
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Filters {
  zip: string[];
  roomType: string[];
  propertyType: string[];
  minPrice: number;
  maxPrice: number;
  minAccommodates: number;
  maxAccommodates: number;
  minBedrooms: number;
  maxBedrooms: number;
  minReviewScore: number;
  maxReviewScore: number;
  hostIsSuperhost: boolean;
  instantBookable: boolean;
}

interface ListingsMapProps {
  className?: string;
  filters?: Filters;
}

// Component to handle markers with clustering
function MarkersWithClustering({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || listings.length === 0) return;

    // Use global L object for MarkerClusterGroup
    const L = (window as any).L;
    if (!L || !L.markerClusterGroup) return;

    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      iconCreateFunction: (cluster: any) => {
        const childCount = cluster.getChildCount();
        let c = " marker-cluster-";
        if (childCount < 10) {
          c += "small";
        } else if (childCount < 100) {
          c += "medium";
        } else {
          c += "large";
        }
        return L.divIcon({
          html: "<div><span>" + childCount + "</span></div>",
          className: "marker-cluster" + c,
          iconSize: L.point(40, 40),
        });
      },
    });

    // Add markers to cluster group
    for (const listing of listings) {
      if (listing.latitude && listing.longitude) {
        const lat = parseFloat(listing.latitude);
        const lng = parseFloat(listing.longitude);

        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          const marker = L.marker([lat, lng]);
          marker.bindPopup(`
            <div class="p-3 max-w-xs">
              <h3 class="font-bold text-base text-gray-900 mb-1 truncate">${listing.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${listing.neighbourhood_cleansed}</p>
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-green-600">${listing.price}/night</span>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${listing.room_type}</span>
              </div>
            </div>
          `);
          markers.addLayer(marker);
        }
      }
    }

    map.addLayer(markers);

    // Cleanup
    return () => {
      map.removeLayer(markers);
    };
  }, [map, listings]);

  return null;
}

export default function ListingsMap({ className, filters }: ListingsMapProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const params = new URLSearchParams();

        if (filters?.zip && filters.zip.length > 0) {
          params.append("zip", filters.zip.join(","));
        }
        if (filters?.roomType && filters.roomType.length > 0) {
          params.append("roomType", filters.roomType.join(","));
        }
        if (filters?.propertyType && filters.propertyType.length > 0) {
          params.append("propertyType", filters.propertyType.join(","));
        }
        if (filters?.minPrice && filters.minPrice > 0) {
          params.append("minPrice", filters.minPrice.toString());
        }
        if (filters?.maxPrice && filters.maxPrice < 1000) {
          params.append("maxPrice", filters.maxPrice.toString());
        }
        if (filters?.minAccommodates && filters.minAccommodates > 1) {
          params.append("minAccommodates", filters.minAccommodates.toString());
        }
        if (filters?.maxAccommodates && filters.maxAccommodates < 16) {
          params.append("maxAccommodates", filters.maxAccommodates.toString());
        }
        if (filters?.minBedrooms && filters.minBedrooms > 0) {
          params.append("minBedrooms", filters.minBedrooms.toString());
        }
        if (filters?.maxBedrooms && filters.maxBedrooms < 10) {
          params.append("maxBedrooms", filters.maxBedrooms.toString());
        }
        if (filters?.minReviewScore && filters.minReviewScore > 0) {
          params.append("minReviewScore", filters.minReviewScore.toString());
        }
        if (filters?.maxReviewScore && filters.maxReviewScore < 5) {
          params.append("maxReviewScore", filters.maxReviewScore.toString());
        }
        if (filters?.hostIsSuperhost) {
          params.append("hostIsSuperhost", "true");
        }
        if (filters?.instantBookable) {
          params.append("instantBookable", "true");
        }

        const response = await fetch(`/api/listings/map?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }
        const data = await response.json();
        setListings(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load listings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-muted rounded-lg ${className}`}
      >
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-muted rounded-lg ${className}`}
      >
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  // Calculate center and bounds
  const validListings = listings.filter(
    (listing) =>
      listing.latitude &&
      listing.longitude &&
      !Number.isNaN(parseFloat(listing.latitude)) &&
      !Number.isNaN(parseFloat(listing.longitude)),
  );

  if (validListings.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-muted rounded-lg ${className}`}
      >
        <div className="text-muted-foreground">
          No valid location data available
        </div>
      </div>
    );
  }

  const center: [number, number] = [
    validListings.reduce(
      (sum, listing) => sum + parseFloat(listing.latitude),
      0,
    ) / validListings.length,
    validListings.reduce(
      (sum, listing) => sum + parseFloat(listing.longitude),
      0,
    ) / validListings.length,
  ];

  return (
    <div className={`h-80 sm:h-96 lg:h-[500px] w-full rounded-lg overflow-hidden border shadow-sm ${className || ''}`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        touchZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MarkersWithClustering listings={validListings} />
      </MapContainer>
    </div>
  );
}
