"use client";

import { motion } from "framer-motion";
import { Building, Home, Shield, User, Users, Zap } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { ButtonGrid } from "@/components/button-grid";
import { CheckboxList } from "@/components/checkbox-list";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useFilters } from "@/lib/use-filters";
import type { FilterOptions, Filters } from "@/types/filters";

interface FiltersSidebarProps {
  filterOptions: FilterOptions | null;
  onFiltersChange: (filters: Filters) => void;
  onFilterOptionsChange: (options: FilterOptions) => void;
  onClearFilters: () => void;
}

export const FiltersSidebar = memo(function FiltersSidebar({
  filterOptions,
  onFiltersChange,
  onFilterOptionsChange,
}: FiltersSidebarProps) {
  const [sortedZipCodes, setSortedZipCodes] = useState<string[]>([]);
  const [highlightedZips, setHighlightedZips] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    localFilters,
    handleMultiSelectChange,
    handleBooleanChange,
    createRangeHandlers,
  } = useFilters(onFiltersChange, onFilterOptionsChange);

  // Initialize sorted zip codes when filterOptions change
  useEffect(() => {
    if (filterOptions) {
      setSortedZipCodes(filterOptions.zipCodes);
    }
  }, [filterOptions]);

  useEffect(() => {
    if (!filterOptions || !localFilters) return;
    const selected = localFilters.zipCodes;
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
  }, [localFilters, filterOptions]);

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

  if (!filterOptions || !localFilters) {
    return (
      <LoadingSkeleton
        sections={[
          { title: true, extraElements: 2 }, // Price Range
          { title: true, items: 4, gridCols: 2, itemHeight: "h-16" }, // Room Type
          { title: true, items: 1, itemHeight: "h-10" }, // Accommodates
          { title: true, items: 1, itemHeight: "h-10" }, // Bedrooms
          { title: true, items: 3, itemHeight: "h-8" }, // Property Type
          {
            title: true,
            items: 6,
            gridCols: 2,
            itemHeight: "h-10",
            extraElements: 1,
          }, // Zip Code (with extra subtitle)
          { title: true, items: 1, itemHeight: "h-10" }, // Review Score
          { title: true, items: 2, itemHeight: "h-8" }, // Host Filters
        ]}
      />
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white/30 backdrop-blur-sm rounded-2xl border border-neutral-200/30 p-6 shadow-sm">
      <div className="space-y-8">
        {/* Price Range Filter - Most Important */}
        {filterOptions && (
          <Slider
            label="Price Range"
            minValue={localFilters?.minPrice ?? undefined}
            maxValue={localFilters?.maxPrice ?? undefined}
            onRangeChange={createRangeHandlers("minPrice", "maxPrice").onChange}
            onMinChange={
              createRangeHandlers("minPrice", "maxPrice").onMinChange
            }
            onMaxChange={
              createRangeHandlers("minPrice", "maxPrice").onMaxChange
            }
            min={filterOptions.minPrice}
            max={filterOptions.maxPrice}
            step={1}
            formatValue={(value: number) => `$${Math.round(value)}`}
            volumes={filterOptions.priceVolumes}
          />
        )}

        {/* Room Type Filter */}
        <ButtonGrid
          label="Room Type"
          options={filterOptions.roomTypes.map((type) => ({
            value: type,
            label: type,
            icon: getRoomTypeIcon(type),
          }))}
          selected={localFilters.roomTypes}
          onChange={(value, checked) =>
            handleMultiSelectChange("roomTypes", value, checked)
          }
        />

        {/* Accommodates Filter */}
        <Slider
          label="Accommodates"
          minValue={localFilters.minAccommodates ?? undefined}
          maxValue={localFilters.maxAccommodates ?? undefined}
          onRangeChange={
            createRangeHandlers("minAccommodates", "maxAccommodates").onChange
          }
          onMinChange={
            createRangeHandlers("minAccommodates", "maxAccommodates")
              .onMinChange
          }
          onMaxChange={
            createRangeHandlers("minAccommodates", "maxAccommodates")
              .onMaxChange
          }
          min={filterOptions.minAccommodates}
          max={filterOptions.maxAccommodates}
          step={1}
          volumes={filterOptions.accommodatesVolumes}
        />

        {/* Bedrooms Filter */}
        <Slider
          label="Bedrooms"
          minValue={localFilters.minBedrooms ?? undefined}
          maxValue={localFilters.maxBedrooms ?? undefined}
          onRangeChange={
            createRangeHandlers("minBedrooms", "maxBedrooms").onChange
          }
          onMinChange={
            createRangeHandlers("minBedrooms", "maxBedrooms").onMinChange
          }
          onMaxChange={
            createRangeHandlers("minBedrooms", "maxBedrooms").onMaxChange
          }
          min={filterOptions.minBedrooms}
          max={filterOptions.maxBedrooms}
          step={1}
          volumes={filterOptions.bedroomsVolumes}
        />

        {/* Property Type Filter */}
        <CheckboxList
          label="Property Type"
          options={filterOptions.propertyTypes}
          selected={localFilters.propertyTypes}
          onChange={(value, checked) =>
            handleMultiSelectChange("propertyTypes", value, checked)
          }
          gridCols={2}
        />

        {/* Zip Code Filter */}
        <div>
          <Label className="text-base font-medium mb-2 block">
            Location (Zip Code)
          </Label>
          <motion.p
            key={localFilters.zipCodes?.length === 0 ? "alpha" : "selected"}
            layout
            className="text-xs text-muted-foreground mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {localFilters.zipCodes?.length === 0
              ? "Sorted alphabetically"
              : "Selected zips first, then by price proximity"}
          </motion.p>
          <div
            ref={scrollRef}
            className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto"
          >
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
                  checked={localFilters.zipCodes.includes(zip)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange("zipCodes", zip, checked as boolean)
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
        <Slider
          label="Review Score"
          minValue={localFilters.minReviewScore ?? undefined}
          maxValue={localFilters.maxReviewScore ?? undefined}
          onRangeChange={
            createRangeHandlers("minReviewScore", "maxReviewScore").onChange
          }
          onMinChange={
            createRangeHandlers("minReviewScore", "maxReviewScore").onMinChange
          }
          onMaxChange={
            createRangeHandlers("minReviewScore", "maxReviewScore").onMaxChange
          }
          min={filterOptions.minReviewScore}
          max={filterOptions.maxReviewScore}
          step={0.1}
          formatValue={(v: number) => v.toFixed(1)}
          volumes={filterOptions.reviewScoreVolumes}
        />

        {/* Host Filters */}
        <ButtonGrid
          label="Host Preferences"
          options={[
            {
              value: "hostIsSuperhost",
              label: "Superhost only",
              icon: <Shield className="w-4 h-4" />,
            },
            {
              value: "instantBookable",
              label: "Instant bookable",
              icon: <Zap className="w-4 h-4" />,
            },
          ]}
          selected={{
            hostIsSuperhost: localFilters.hostIsSuperhost,
            instantBookable: localFilters.instantBookable,
          }}
          onChange={(value, checked) =>
            handleBooleanChange(value as keyof Filters, checked)
          }
        />
      </div>
    </div>
  );
});
