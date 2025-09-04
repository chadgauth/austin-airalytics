"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "./dashboard-layout";
import { columns } from "./listings.columns";
import { DataTable } from "./listings.data-table";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { trpc } from "@/lib/trpc/client";
import type { FilterOptions, Filters } from "@/types/filters";

const FILTERS_STORAGE_KEY = "rental-insight-filters";

const defaultFilters: Filters = {
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
};

// Load filters from localStorage
const loadFiltersFromStorage = (): Filters => {
  if (typeof window === "undefined") return defaultFilters;
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    return stored
      ? { ...defaultFilters, ...JSON.parse(stored) }
      : defaultFilters;
  } catch (error) {
    console.warn("Failed to load filters from localStorage:", error);
    return defaultFilters;
  }
};

// Save filters to localStorage
const saveFiltersToStorage = (filters: Filters) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn("Failed to save filters to localStorage:", error);
  }
};

// Dynamically import map component to avoid SSR issues
const ListingsMap = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-80 sm:h-96 lg:h-[500px] bg-muted rounded-lg">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
});

// import { ProfitCalculator } from "@/components/profit-calculator";

export default function Dashboard() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null,
  );
  const [filters, setFilters] = useState<Filters>(() =>
    loadFiltersFromStorage(),
  );

  // Debounce filters
  useEffect(() => {
    const timeout = setTimeout(() => {
      // This would trigger any filter-dependent operations
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const { data: filterOptionsData } = trpc.listings.getFilterOptions.useQuery({});

  useEffect(() => {
    if (filterOptionsData) {
      setFilterOptions(filterOptionsData);
      // Update filters with actual values from filter options only if they are still defaults
      setFilters((prev) => {
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
  }, [filterOptionsData]);

  // Handlers
  const handleMultiSelectChange = useCallback(
    (
      key: "zipCodes" | "roomTypes" | "propertyTypes",
      value: string,
      checked: boolean,
    ) => {
      setFilters((prev) => {
        const current = prev[key];
        const newFilters = {
          ...prev,
          [key]: checked
            ? [...current, value]
            : current.filter((v) => v !== value),
        };
        saveFiltersToStorage(newFilters);
        return newFilters;
      });
    },
    [],
  );

  const handleBooleanChange = useCallback(
    (key: keyof Filters, checked: boolean) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: checked };
        saveFiltersToStorage(newFilters);
        return newFilters;
      });
    },
    [],
  );

  const createRangeHandlers = useCallback(
    (minKey: keyof Filters, maxKey: keyof Filters) => ({
      onChange: (min: number, max: number) =>
        setFilters((prev) => {
          const newFilters = { ...prev, [minKey]: min, [maxKey]: max };
          saveFiltersToStorage(newFilters);
          return newFilters;
        }),
      onMinChange: (value: string) => {
        const num = parseFloat(value);
        if (!Number.isNaN(num))
          setFilters((prev) => {
            const newFilters = { ...prev, [minKey]: num };
            saveFiltersToStorage(newFilters);
            return newFilters;
          });
      },
      onMaxChange: (value: string) => {
        const num = parseFloat(value);
        if (!Number.isNaN(num))
          setFilters((prev) => {
            const newFilters = { ...prev, [maxKey]: num };
            saveFiltersToStorage(newFilters);
            return newFilters;
          });
      },
    }),
    [],
  );

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    saveFiltersToStorage(newFilters);
  }, []);

  const handleFilterOptionsChange = useCallback((newOptions: FilterOptions) => {
    setFilterOptions(newOptions);
  }, []);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: Filters = {
      zipCodes: [],
      roomTypes: [],
      propertyTypes: [],
      minPrice: filterOptions?.minPrice ?? 0,
      maxPrice: filterOptions?.maxPrice ?? Infinity,
      minAccommodates: filterOptions?.minAccommodates ?? 0,
      maxAccommodates: filterOptions?.maxAccommodates ?? Infinity,
      minBedrooms: filterOptions?.minBedrooms ?? 0,
      maxBedrooms: filterOptions?.maxBedrooms ?? Infinity,
      minReviewScore: filterOptions?.minReviewScore ?? 0,
      maxReviewScore: filterOptions?.maxReviewScore ?? Infinity,
      hostIsSuperhost: false,
      instantBookable: false,
    };
    setFilters(clearedFilters);
    saveFiltersToStorage(clearedFilters);
  }, [filterOptions]);

  return (
    <DashboardLayout
      map={<ListingsMap key="map" filters={filters} data-layout="map" />}
      sidebar={
        <FiltersSidebar
          key="sidebar"
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onFilterOptionsChange={handleFilterOptionsChange}
          initialFilters={filters}
          handleMultiSelectChange={handleMultiSelectChange}
          handleBooleanChange={handleBooleanChange}
          createRangeHandlers={createRangeHandlers}
          data-layout="sidebar"
        />
      }
      table={
        <DataTable
          key="data"
          columns={columns}
          filters={filters}
          filterOptions={filterOptions}
          data-layout="table"
        />
      }
    />
  );
}
