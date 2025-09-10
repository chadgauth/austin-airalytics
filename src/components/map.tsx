"use client";
import { Icon } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet.markercluster";
import { trpc } from "@/lib/trpc/client";
import type { Filters } from "@/types/filters";

interface MapListing {
  latitude: number;
  longitude: number;
  name: string;
  neighbourhood_cleansed: string;
  price: string;
  room_type: string;
  picture_url: string;
}

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

interface ListingsMapProps {
  className?: string;
  filters?: Filters;
  isMobile?: boolean;
  mobileView?: "map" | "list";
}

// Component to handle markers with clustering
function MarkersWithClustering({ listings, isLoading }: { listings: MapListing[]; isLoading: boolean }) {
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
        const lat = listing.latitude;
        const lng = listing.longitude;

        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          const marker = L.marker([lat, lng]);
          marker.bindPopup(`
            <div class="p-0 max-w-xs bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div class="relative">
                <img
                  src="${listing.picture_url}"
                  alt="${listing.name}"
                  class="w-full h-40 object-cover"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div class="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <span class="text-sm font-bold text-gray-900">${listing.price}/night</span>
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-1 text-sm leading-tight line-clamp-2">${listing.name}</h3>
                <p class="text-xs text-gray-600 mb-3">${listing.neighbourhood_cleansed}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-200">${listing.room_type}</span>
                  <span class="text-xs text-blue-600 font-medium hover:text-blue-800 cursor-pointer">View details →</span>
                </div>
              </div>
            </div>
          `, { closeButton: false, className: 'custom-popup' });

          // Dim marker when loading
          if (isLoading) {
            marker.setOpacity(0.3);
          }

          markers.addLayer(marker);
        }
      }
    }

    map.addLayer(markers);

    // Cleanup
    return () => {
      map.removeLayer(markers);
    };
  }, [map, listings, isLoading]);

  return null;
}

// Component to track map position changes
function MapEventHandler({
  onCenterChange,
  onZoomChange,
}: {
  onCenterChange: (center: [number, number]) => void;
  onZoomChange: (zoom: number) => void;
}) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      onCenterChange([center.lat, center.lng]);
    },
    zoomend: (e) => {
      const map = e.target;
      onZoomChange(map.getZoom());
    },
  });
  return null;
}


export default function ListingsMap({
  className,
  filters,
  isMobile,
  mobileView,
}: ListingsMapProps) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [userCenter, setUserCenter] = useState<[number, number] | null>(null);
  const [userZoom, setUserZoom] = useState<number>(12);

  const { data: mapData, isLoading, error: trpcError } = trpc.listings.getMapData.useQuery(
    filters ? {
      filters: {
        zipCodes: filters.zipCodes,
        roomTypes: filters.roomTypes,
        propertyTypes: filters.propertyTypes,
        minPrice: filters.minPrice ?? undefined,
        maxPrice: filters.maxPrice ?? undefined,
        minAccommodates: filters.minAccommodates ?? undefined,
        maxAccommodates: filters.maxAccommodates ?? undefined,
        minBedrooms: filters.minBedrooms ?? undefined,
        maxBedrooms: filters.maxBedrooms ?? undefined,
        minReviewScore: filters.minReviewScore ?? undefined,
        maxReviewScore: filters.maxReviewScore ?? undefined,
        hostIsSuperhost: filters.hostIsSuperhost,
        instantBookable: filters.instantBookable,
      },
    } : { filters: undefined },
    {
      enabled: !isMobile || mobileView === "map",
    }
  );

  useEffect(() => {
    if (!isLoading && mapData) {
      setHasLoaded(true);
    }
  }, [isLoading, mapData]);

  // Calculate center and bounds
  const validListings = (mapData || []).filter(
    (listing: MapListing) =>
      listing.latitude &&
      listing.longitude &&
      !Number.isNaN(listing.latitude) &&
      !Number.isNaN(listing.longitude),
  );

  // Calculate center from listings (only for initial load)
  const calculatedCenter = useMemo(() => {
    if (validListings.length === 0) return [30.2672, -97.7431] as [number, number]; // Austin, TX default

    const lat = validListings.reduce(
      (sum: number, listing: MapListing) => sum + listing.latitude,
      0,
    ) / validListings.length;

    const lng = validListings.reduce(
      (sum: number, listing: MapListing) => sum + listing.longitude,
      0,
    ) / validListings.length;

    return [lat, lng] as [number, number];
  }, [validListings]);

  // Update stored center on initial load only
  useEffect(() => {
    if (!mapCenter && validListings.length > 0 && !isLoading) {
      setMapCenter(calculatedCenter);
    }
  }, [mapCenter, validListings.length, isLoading, calculatedCenter]);

  // Use user center if available, otherwise stored center, otherwise default
  const displayCenter = userCenter || mapCenter || [30.2672, -97.7431] as [number, number];
  const displayZoom = userZoom;

  // Handle error state
  if (trpcError && !isLoading) {
    console.error("Map data loading error:", trpcError);
    return (
      <div
        className={`flex items-center justify-center h-96 bg-muted rounded-lg ${className}`}
      >
        <div className="text-muted-foreground">
          Failed to load map data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!isLoading && validListings.length === 0 && hasLoaded) {
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

  return (
    <div
      className={`relative h-80 sm:h-96 lg:h-[500px] w-full rounded-lg overflow-hidden border shadow-sm ${className || ""}`}
    >
      <MapContainer
        center={displayCenter}
        zoom={displayZoom}
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

        <MapEventHandler
          onCenterChange={setUserCenter}
          onZoomChange={setUserZoom}
        />

        <MarkersWithClustering listings={validListings} isLoading={isLoading} />
      </MapContainer>
    </div>
  );
}
