import { useCallback, useEffect, useState } from "react";
import { trpc } from "./trpc/client";
import type { FilterOptions, Filters } from "@/types/filters";

export function useFilters(
  onFiltersChange: (filters: Filters) => void,
  onFilterOptionsChange: (options: FilterOptions) => void,
) {
  const [localFilters, setLocalFilters] = useState<Filters | null>({
    zipCodes: [],
    roomTypes: [],
    propertyTypes: [],
    minPrice: 0,
    maxPrice: Infinity,
    minAccommodates: 0,
    maxAccommodates: Infinity,
    minBedrooms: 0,
    maxBedrooms: Infinity,
    minReviewScore: 0,
    maxReviewScore: Infinity,
    hostIsSuperhost: false,
    instantBookable: false,
  });

  // Debounce filters
  useEffect(() => {
    if (!localFilters) return;
    const timeout = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);
    return () => clearTimeout(timeout);
  }, [localFilters, onFiltersChange]);

  const { data: filterOptionsData } = trpc.listings.getFilterOptions.useQuery({});

  useEffect(() => {
    if (filterOptionsData) {
      onFilterOptionsChange(filterOptionsData);
      // Update localFilters with actual values from filter options only if they are still defaults
      setLocalFilters((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          minPrice: prev.minPrice === 0 ? filterOptionsData.minPrice : prev.minPrice,
          maxPrice: prev.maxPrice === Infinity ? filterOptionsData.maxPrice : prev.maxPrice,
          minAccommodates: prev.minAccommodates === 0 ? filterOptionsData.minAccommodates : prev.minAccommodates,
          maxAccommodates: prev.maxAccommodates === Infinity ? filterOptionsData.maxAccommodates : prev.maxAccommodates,
          minBedrooms: prev.minBedrooms === 0 ? filterOptionsData.minBedrooms : prev.minBedrooms,
          maxBedrooms: prev.maxBedrooms === Infinity ? filterOptionsData.maxBedrooms : prev.maxBedrooms,
          minReviewScore: prev.minReviewScore === 0 ? filterOptionsData.minReviewScore : prev.minReviewScore,
          maxReviewScore: prev.maxReviewScore === Infinity ? filterOptionsData.maxReviewScore : prev.maxReviewScore,
        };
      });
    }
  }, [filterOptionsData, onFilterOptionsChange]);


  // Handlers
  const handleMultiSelectChange = useCallback(
    (
      key: "zipCodes" | "roomTypes" | "propertyTypes",
      value: string,
      checked: boolean,
    ) => {
      setLocalFilters((prev) => {
        if (!prev) return prev;
        const current = prev[key];
        return {
          ...prev,
          [key]: checked
            ? [...current, value]
            : current.filter((v) => v !== value),
        };
      });
    },
    [],
  );

  const handleBooleanChange = useCallback(
    (key: keyof Filters, checked: boolean) => {
      setLocalFilters((prev) => {
        if (!prev) return prev;
        return { ...prev, [key]: checked };
      });
    },
    [],
  );

  const createRangeHandlers = useCallback(
    (minKey: keyof Filters, maxKey: keyof Filters) => ({
      onChange: (min: number, max: number) =>
        setLocalFilters((prev) => {
          if (!prev) return prev;
          return { ...prev, [minKey]: min, [maxKey]: max };
        }),
      onMinChange: (value: string) => {
        const num = parseFloat(value);
        if (!Number.isNaN(num))
          setLocalFilters((prev) => {
            if (!prev) return prev;
            return { ...prev, [minKey]: num };
          });
      },
      onMaxChange: (value: string) => {
        const num = parseFloat(value);
        if (!Number.isNaN(num))
          setLocalFilters((prev) => {
            if (!prev) return prev;
            return { ...prev, [maxKey]: num };
          });
      },
    }),
    [],
  );


  return {
    localFilters,
    handleMultiSelectChange,
    handleBooleanChange,
    createRangeHandlers,
  };
}
