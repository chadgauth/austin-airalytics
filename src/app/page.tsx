"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import DashboardLayout from "./dashboard-layout";
import { columns } from "./listings.columns";
import { DataTable } from "./listings.data-table";
import { FiltersSidebar } from "@/components/filters-sidebar";
import type { FilterOptions, Filters } from "@/types/filters";

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
  const [filters, setFilters] = useState<Filters>({
    zipCodes: [],
    roomTypes: [],
    propertyTypes: [],
    minPrice: 0,
    maxPrice: Infinity, // Will be updated with actual max from filterOptions
    minAccommodates: 0,
    maxAccommodates: Infinity, // Will be updated with actual max from filterOptions
    minBedrooms: 0,
    maxBedrooms: Infinity, // Will be updated with actual max from filterOptions
    minReviewScore: 0,
    maxReviewScore: Infinity, // Will be updated with actual max from filterOptions
    hostIsSuperhost: false,
    instantBookable: false,
  });

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleFilterOptionsChange = useCallback((newOptions: FilterOptions) => {
    setFilterOptions(newOptions);
  }, []);

  const handleClearFilters = useCallback(() => {
    const defaultFilters: Filters = {
      zipCodes: [],
      roomTypes: [],
      propertyTypes: [],
      minPrice: filterOptions?.minPrice ?? 0,
      maxPrice: filterOptions?.maxPrice ?? 1000,
      minAccommodates: filterOptions?.minAccommodates ?? 1,
      maxAccommodates: filterOptions?.maxAccommodates ?? 16,
      minBedrooms: filterOptions?.minBedrooms ?? 0,
      maxBedrooms: filterOptions?.maxBedrooms ?? 10,
      minReviewScore: filterOptions?.minReviewScore ?? 0,
      maxReviewScore: filterOptions?.maxReviewScore ?? 5,
      hostIsSuperhost: false,
      instantBookable: false,
    };
    setFilters(defaultFilters);
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
