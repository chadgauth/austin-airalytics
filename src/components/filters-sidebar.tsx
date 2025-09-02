"use client";

import { motion } from "framer-motion";
import { Building, Home, User, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RangeSliderFilter } from "@/components/range-slider-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  accommodatesVolumes: number[];
  bedroomsVolumes: number[];
  reviewScoreVolumes: number[];
}

interface FiltersSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

export function FiltersSidebar({
  filters,
  onFiltersChange,
  onClearFilters,
}: FiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchOptions = useCallback(async (filters?: Partial<Filters>) => {
    try {
      const params = new URLSearchParams();
      if (filters?.roomType && filters.roomType.length > 0) {
        for (const rt of filters.roomType) {
          params.append("roomType", rt);
        }
      }
      if (filters?.minPrice && filters.minPrice > 0) {
        params.append("minPrice", filters.minPrice.toString());
      }
      if (filters?.maxPrice && filters.maxPrice < 1000) {
        params.append("maxPrice", filters.maxPrice.toString());
      }
      const response = await fetch(
        `/api/listings/filters?${params.toString()}`,
      );
      if (response.ok) {
        const data: FilterOptions = await response.json();
        setOptions(data);
        setSortedZipCodes(data.zipCodes);
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Refetch options when roomType, minPrice, or maxPrice change to update averages
  useEffect(() => {
    if (options) {
      // Only refetch if options are already loaded
      const currentFiltersStr = JSON.stringify({
        roomType: debouncedFilters.roomType,
        minPrice: debouncedFilters.minPrice,
        maxPrice: debouncedFilters.maxPrice,
      });
      if (currentFiltersStr !== prevFiltersRef.current) {
        prevFiltersRef.current = currentFiltersStr;
        fetchOptions(debouncedFilters);
      }
    }
  }, [debouncedFilters, fetchOptions, options]);

  useEffect(() => {
    if (!options) return;
    const selected = localFilters.zip;
    if (selected.length === 0) {
      setSortedZipCodes(options.zipCodes);
      setHighlightedZips([]);
    } else {
      const selectedPrices = selected
        .map((zip) => options.zipAveragePrices[zip])
        .filter((p) => p !== undefined);
      const avgPrice =
        selectedPrices.length > 0
          ? selectedPrices.reduce((a, b) => a + b, 0) / selectedPrices.length
          : 0;
      const sorted = [...options.zipCodes].sort((a, b) => {
        const aSelected = selected.includes(a);
        const bSelected = selected.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        if (aSelected && bSelected) return 0;
        const aPrice = options.zipAveragePrices[a] || 0;
        const bPrice = options.zipAveragePrices[b] || 0;
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
  }, [localFilters.zip, options]);

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

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const numValue = parseFloat(value) || 0;
    const newFilters = {
      ...localFilters,
      [type === "min" ? "minPrice" : "maxPrice"]: numValue,
    };
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

  if (loading || !options) {
    return (
      <Card className="w-80 h-fit">
        <CardContent className="p-6">
          <div className="text-center">Loading filters...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-fit">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zip Code Filter */}
        <div>
          <Label>Zip Code</Label>
          <motion.p
            key={localFilters.zip.length === 0 ? "alpha" : "selected"}
            layout
            className="text-xs text-muted-foreground mb-2"
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
                  ${options.zipAveragePrices[zip] || 0}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Room Type Filter */}
        <div>
          <Label>Room Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {options.roomTypes.map((type) => (
              <Card key={type} className="relative p-3 bg-muted/30 border-0 hover:bg-muted/50 transition-colors">
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
              </Card>
            ))}
          </div>
        </div>

        {/* Property Type Filter */}
        <div>
          <Label>Property Type</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {options.propertyTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
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
          min={options.minAccommodates}
          max={options.maxAccommodates}
          step={1}
          volumes={options.accommodatesVolumes}
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
          min={options.minBedrooms}
          max={options.maxBedrooms}
          step={1}
          volumes={options.bedroomsVolumes}
        />

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
          min={options.minReviewScore}
          max={options.maxReviewScore}
          step={0.1}
          formatValue={(v) => v.toFixed(1)}
          volumes={options.reviewScoreVolumes}
        />

        {/* Host Superhost Filter */}
        <div>
          <div className="flex items-center space-x-2">
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
        </div>

        {/* Instant Bookable Filter */}
        <div>
          <div className="flex items-center space-x-2">
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

        {/* Price Range Filter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Price Range</Label>
            <span className="text-xs text-muted-foreground">
              ${localFilters.minPrice} - ${localFilters.maxPrice}
            </span>
          </div>
          <div className="flex gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-xs">
                Min
              </Label>
              <Input
                id="minPrice"
                type="number"
                value={localFilters.minPrice}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-xs">
                Max
              </Label>
              <Input
                id="maxPrice"
                type="number"
                value={localFilters.maxPrice}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                placeholder="1000"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <Button onClick={onClearFilters} variant="outline" className="w-full">
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}
