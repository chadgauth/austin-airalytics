import { useCallback, useEffect, useState } from "react";
import { trpc } from "./trpc/client";
import type { FilterOptions, Filters } from "@/types/filters";

export function useFilters(
  initialFilters: Filters,
  onFiltersChange: (filters: Filters) => void,
  onFilterOptionsChange: (options: FilterOptions) => void,
) {
  const [localFilters, setLocalFilters] = useState<Filters>(initialFilters);

  // Update local filters when initialFilters change (e.g., from localStorage)
  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

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
        const isUsingDefaults = prev.minPrice === 0 && prev.maxPrice === Infinity &&
          prev.minAccommodates === 0 && prev.maxAccommodates === Infinity &&
          prev.minBedrooms === 0 && prev.maxBedrooms === Infinity &&
          prev.minReviewScore === 0 && prev.maxReviewScore === Infinity;

        if (isUsingDefaults) {
          return {
            ...prev,
            minPrice: filterOptionsData.minPrice,
            maxPrice: filterOptionsData.maxPrice,
            minAccommodates: filterOptionsData.minAccommodates,
            maxAccommodates: filterOptionsData.maxAccommodates,
            minBedrooms: filterOptionsData.minBedrooms,
            maxBedrooms: filterOptionsData.maxBedrooms,
            minReviewScore: filterOptionsData.minReviewScore,
            maxReviewScore: filterOptionsData.maxReviewScore,
          };
        }
        return prev;
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
