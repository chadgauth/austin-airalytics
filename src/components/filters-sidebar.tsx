"use client";

import { motion } from "framer-motion";
import { Building, Home, User, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RangeSliderFilter } from "@/components/range-slider-filter";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/lib/utils";

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

interface FilterOptions {
  zipCodes: string[];
  roomTypes: string[];
  propertyTypes: string[];
  minPrice: number;
  maxPrice: number;
  minAccommodates: number;
  maxAccommodates: number;
  minBedrooms: number;
  maxBedrooms: number;
  minReviewScore: number;
  maxReviewScore: number;
  zipAveragePrices: Record<string, number>;
  priceVolumes: number[];
  accommodatesVolumes: number[];
  bedroomsVolumes: number[];
  reviewScoreVolumes: number[];
}

interface FiltersSidebarProps {
  filters: Filters;
  filterOptions: FilterOptions | null;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

export function FiltersSidebar({
  filters,
  filterOptions,
  onFiltersChange,
  onClearFilters,
}: FiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [sortedZipCodes, setSortedZipCodes] = useState<string[]>([]);
  const [highlightedZips, setHighlightedZips] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevFiltersRef = useRef<string>("");

  const debouncedFilters = useDebounce(localFilters, 300);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    onFiltersChange(debouncedFilters);
  }, [debouncedFilters, onFiltersChange]);

  // Initialize sorted zip codes when filterOptions change
  useEffect(() => {
    if (filterOptions) {
      setSortedZipCodes(filterOptions.zipCodes);
    }
  }, [filterOptions]);

  useEffect(() => {
    if (!filterOptions) return;
    const selected = localFilters.zip;
    if (selected.length === 0) {
      setSortedZipCodes(filterOptions.zipCodes);
      setHighlightedZips([]);
    } else {
      const selectedPrices = selected
        .map((zip) => filterOptions.zipAveragePrices[zip])
        .filter((p) => p !== undefined);
      const avgPrice =
        selectedPrices.length > 0
          ? selectedPrices.reduce((a, b) => a + b, 0) / selectedPrices.length
          : 0;
      const sorted = [...filterOptions.zipCodes].sort((a, b) => {
        const aSelected = selected.includes(a);
        const bSelected = selected.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        if (aSelected && bSelected) return 0;
        const aPrice = filterOptions.zipAveragePrices[a] || 0;
        const bPrice = filterOptions.zipAveragePrices[b] || 0;
        return Math.abs(aPrice - avgPrice) - Math.abs(bPrice - avgPrice);
      });
      setSortedZipCodes(sorted);
      setHighlightedZips(selected);
      setTimeout(() => setHighlightedZips([]), 300);
    }
    // Scroll to top after sorting
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  }, [localFilters.zip, filterOptions]);

  const handleMultiSelectChange = (
    key: "zip" | "roomType" | "propertyType",
    value: string,
    checked: boolean,
  ) => {
    const current = localFilters[key];
    const newValue = checked
      ? [...current, value]
      : current.filter((item) => item !== value);
    const newFilters = { ...localFilters, [key]: newValue };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };


  const getRoomTypeIcon = (roomType: string) => {
    switch (roomType) {
      case "Entire home/apt":
        return <Home className="w-4 h-4" />;
      case "Private room":
        return <User className="w-4 h-4" />;
      case "Shared room":
        return <Users className="w-4 h-4" />;
      case "Hotel room":
        return <Building className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  if (!filterOptions) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* Price Range Loading */}
        <div>
          <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-muted/30 rounded animate-pulse"></div>
            <div className="flex-1 h-10 bg-muted/30 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Room Type Loading */}
        <div>
          <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Accommodates Loading */}
        <div>
          <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          <div className="h-10 bg-muted/30 rounded animate-pulse"></div>
        </div>

        {/* Bedrooms Loading */}
        <div>
          <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          <div className="h-10 bg-muted/30 rounded animate-pulse"></div>
        </div>

        {/* Property Type Loading */}
        <div>
          <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted/30 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Zip Code Loading */}
        <div>
          <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          <div className="h-4 bg-muted/30 rounded animate-pulse mb-2"></div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-muted/30 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Review Score Loading */}
        <div>
          <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          <div className="h-10 bg-muted/30 rounded animate-pulse"></div>
        </div>

        {/* Host Filters Loading */}
        <div>
          <div className="h-5 bg-muted/50 rounded animate-pulse mb-3"></div>
          <div className="space-y-3">
            <div className="h-8 bg-muted/30 rounded animate-pulse"></div>
            <div className="h-8 bg-muted/30 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="space-y-6">
        {/* Price Range Filter - Most Important */}
        {filterOptions && (
          <RangeSliderFilter
            label="Price Range"
            minValue={localFilters.minPrice}
            maxValue={localFilters.maxPrice}
            onChange={(min, max) => {
              const newFilters = {
                ...localFilters,
                minPrice: min,
                maxPrice: max,
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }}
            onMinChange={(value) => {
              const num = parseFloat(value);
              if (!Number.isNaN(num)) {
                const newFilters = { ...localFilters, minPrice: Math.round(num) };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }
            }}
            onMaxChange={(value) => {
              const num = parseFloat(value);
              if (!Number.isNaN(num)) {
                const newFilters = { ...localFilters, maxPrice: Math.round(num) };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }
            }}
            min={filterOptions.minPrice}
            max={filterOptions.maxPrice}
            step={1}
            formatValue={(value) => `$${Math.round(value)}`}
            volumes={filterOptions.priceVolumes}
          />
        )}

        {/* Room Type Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">Room Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {filterOptions.roomTypes.map((type) => (
              <div key={type} className="relative p-3 bg-muted/30 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`room-${type}`}
                  className="absolute top-2 left-2"
                  checked={localFilters.roomType.includes(type)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange(
                      "roomType",
                      type,
                      checked as boolean,
                    )
                  }
                />
                <div className="flex flex-col items-center space-y-1 pt-1.5">
                  {getRoomTypeIcon(type)}
                  <Label htmlFor={`room-${type}`} className="text-xs text-center font-medium">
                    {type}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accommodates Filter */}
        <RangeSliderFilter
          label="Accommodates"
          minValue={localFilters.minAccommodates}
          maxValue={localFilters.maxAccommodates}
          onChange={(min, max) => {
            const newFilters = {
              ...localFilters,
              minAccommodates: min,
              maxAccommodates: max,
            };
            setLocalFilters(newFilters);
            onFiltersChange(newFilters);
          }}
          onMinChange={(value) => {
            const num = parseFloat(value);
            if (!Number.isNaN(num)) {
              const newFilters = { ...localFilters, minAccommodates: num };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }
          }}
          onMaxChange={(value) => {
            const num = parseFloat(value);
            if (!Number.isNaN(num)) {
              const newFilters = { ...localFilters, maxAccommodates: num };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }
          }}
          min={filterOptions.minAccommodates}
          max={filterOptions.maxAccommodates}
          step={1}
          volumes={filterOptions.accommodatesVolumes}
        />

        {/* Bedrooms Filter */}
        <RangeSliderFilter
          label="Bedrooms"
          minValue={localFilters.minBedrooms}
          maxValue={localFilters.maxBedrooms}
          onChange={(min, max) => {
            const newFilters = {
              ...localFilters,
              minBedrooms: min,
              maxBedrooms: max,
            };
            setLocalFilters(newFilters);
            onFiltersChange(newFilters);
          }}
          onMinChange={(value) => {
            const num = parseFloat(value);
            if (!Number.isNaN(num)) {
              const newFilters = { ...localFilters, minBedrooms: num };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }
          }}
          onMaxChange={(value) => {
            const num = parseFloat(value);
            if (!Number.isNaN(num)) {
              const newFilters = { ...localFilters, maxBedrooms: num };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }
          }}
          min={filterOptions.minBedrooms}
          max={filterOptions.maxBedrooms}
          step={1}
          volumes={filterOptions.bedroomsVolumes}
        />

        {/* Property Type Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">Property Type</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterOptions.propertyTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/30">
                <Checkbox
                  id={`property-${type}`}
                  checked={localFilters.propertyType.includes(type)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange(
                      "propertyType",
                      type,
                      checked as boolean,
                    )
                  }
                />
                <Label htmlFor={`property-${type}`} className="text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Zip Code Filter */}
        <div>
          <Label className="text-base font-medium mb-2 block">Location (Zip Code)</Label>
          <motion.p
            key={localFilters.zip.length === 0 ? "alpha" : "selected"}
            layout
            className="text-xs text-muted-foreground mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {localFilters.zip.length === 0
              ? "Sorted alphabetically"
              : "Selected zips first, then by price proximity"}
          </motion.p>
          <div ref={scrollRef} className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {sortedZipCodes.map((zip) => (
              <motion.div
                key={zip}
                layout
                transition={{ duration: 0.15 }}
                className={`flex items-center space-x-2 p-2 rounded ${highlightedZips.includes(zip) ? "bg-green-50" : "bg-muted/20"}`}
                animate={{
                  backgroundColor: highlightedZips.includes(zip)
                    ? "#f0fdf4"
                    : "transparent",
                }}
              >
                <Checkbox
                  id={`zip-${zip}`}
                  checked={localFilters.zip.includes(zip)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange("zip", zip, checked as boolean)
                  }
                />
                <Label htmlFor={`zip-${zip}`} className="text-sm flex-1">
                  {zip}
                </Label>
                <span className="text-xs text-muted-foreground">
                  ${filterOptions.zipAveragePrices[zip] || 0}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Review Score Filter */}
        <RangeSliderFilter
          label="Review Score"
          minValue={localFilters.minReviewScore}
          maxValue={localFilters.maxReviewScore}
          onChange={(min, max) => {
            const newFilters = {
              ...localFilters,
              minReviewScore: min,
              maxReviewScore: max,
            };
            setLocalFilters(newFilters);
            onFiltersChange(newFilters);
          }}
          onMinChange={(value) => {
            const num = parseFloat(value);
            if (!Number.isNaN(num)) {
              const newFilters = { ...localFilters, minReviewScore: num };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }
          }}
          onMaxChange={(value) => {
            const num = parseFloat(value);
            if (!Number.isNaN(num)) {
              const newFilters = { ...localFilters, maxReviewScore: num };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }
          }}
          min={filterOptions.minReviewScore}
          max={filterOptions.maxReviewScore}
          step={0.1}
          formatValue={(v) => v.toFixed(1)}
          volumes={filterOptions.reviewScoreVolumes}
        />

        {/* Host Filters */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Host Preferences</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded hover:bg-muted/30">
              <Checkbox
                id="hostSuperhost"
                checked={localFilters.hostIsSuperhost}
                onCheckedChange={(checked) => {
                  const newFilters = {
                    ...localFilters,
                    hostIsSuperhost: checked as boolean,
                  };
                  setLocalFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
              <Label htmlFor="hostSuperhost" className="text-sm">
                Superhost only
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded hover:bg-muted/30">
              <Checkbox
                id="instantBookable"
                checked={localFilters.instantBookable}
                onCheckedChange={(checked) => {
                  const newFilters = {
                    ...localFilters,
                    instantBookable: checked as boolean,
                  };
                  setLocalFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
              <Label htmlFor="instantBookable" className="text-sm">
                Instant bookable
              </Label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
