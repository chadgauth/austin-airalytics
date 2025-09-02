"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { Listing } from "../../types/listings";
import { columns } from "../listings.columns";
import { DataTable } from "../listings.data-table";
import { FiltersSidebar } from "@/components/filters-sidebar";
import ListingsMap from "@/components/map";

// import { ProfitCalculator } from "@/components/profit-calculator";

interface PaginatedResponse {
  data: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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

export default function Dashboard() {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({
    zip: [],
    roomType: [],
    propertyType: [],
    minPrice: 0,
    maxPrice: 1000,
    minAccommodates: 1,
    maxAccommodates: 16,
    minBedrooms: 0,
    maxBedrooms: 10,
    minReviewScore: 0,
    maxReviewScore: 5,
    hostIsSuperhost: false,
    instantBookable: false,
  });

  const fetchData = useCallback(
    async (
      page: number = 1,
      sortByParam?: string,
      sortOrderParam?: "asc" | "desc",
      searchParam?: string,
      filtersParam?: Filters,
    ) => {
      setLoading(true);
      try {
        const sortByValue = sortByParam || sortBy;
        const sortOrderValue = sortOrderParam || sortOrder;
        const searchValue = searchParam !== undefined ? searchParam : search;
        const currentFilters = filtersParam || filters;

        // If any parameter changed (not just page), reset to page 1
        const paramsChanged =
          sortByParam !== undefined ||
          sortOrderParam !== undefined ||
          searchParam !== undefined ||
          filtersParam !== undefined;

        const actualPage = paramsChanged ? 1 : page;

        const params = new URLSearchParams({
          page: actualPage.toString(),
          pageSize: pageSize.toString(),
          sortBy: sortByValue,
          sortOrder: sortOrderValue,
        });
        if (searchValue) {
          params.append("search", searchValue);
        }
        if (currentFilters.zip.length > 0) {
          params.append("zip", currentFilters.zip.join(","));
        }
        if (currentFilters.roomType.length > 0) {
          params.append("roomType", currentFilters.roomType.join(","));
        }
        if (currentFilters.propertyType.length > 0) {
          params.append("propertyType", currentFilters.propertyType.join(","));
        }
        if (currentFilters.minPrice > 0) {
          params.append("minPrice", currentFilters.minPrice.toString());
        }
        if (currentFilters.maxPrice < 1000) {
          params.append("maxPrice", currentFilters.maxPrice.toString());
        }
        if (currentFilters.minAccommodates > 1) {
          params.append("minAccommodates", currentFilters.minAccommodates.toString());
        }
        if (currentFilters.maxAccommodates < 16) {
          params.append("maxAccommodates", currentFilters.maxAccommodates.toString());
        }
        if (currentFilters.minBedrooms > 0) {
          params.append("minBedrooms", currentFilters.minBedrooms.toString());
        }
        if (currentFilters.maxBedrooms < 10) {
          params.append("maxBedrooms", currentFilters.maxBedrooms.toString());
        }
        if (currentFilters.minReviewScore > 0) {
          params.append("minReviewScore", currentFilters.minReviewScore.toString());
        }
        if (currentFilters.maxReviewScore < 5) {
          params.append("maxReviewScore", currentFilters.maxReviewScore.toString());
        }
        if (currentFilters.hostIsSuperhost) {
          params.append("hostIsSuperhost", "true");
        }
        if (currentFilters.instantBookable) {
          params.append("instantBookable", "true");
        }
        const response = await fetch(`/api/listings?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const result: PaginatedResponse = await response.json();
        setData(result.data);
        setTotal(result.total);
        setCurrentPage(result.page);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, sortBy, sortOrder, search, filters],
  );

  const handleSort = useCallback((columnId: string, order: "asc" | "desc") => {
    setSortBy(columnId);
    setSortOrder(order);
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
  }, []);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    const defaultFilters: Filters = {
      zip: [],
      roomType: [],
      propertyType: [],
      minPrice: 0,
      maxPrice: 1000,
      minAccommodates: 1,
      maxAccommodates: 16,
      minBedrooms: 0,
      maxBedrooms: 10,
      minReviewScore: 0,
      maxReviewScore: 5,
      hostIsSuperhost: false,
      instantBookable: false,
    };
    setFilters(defaultFilters);
  }, []);

  // biome-ignore lint: We depend on states to trigger fetch, fetchData is memoized with these deps
  useEffect(() => {
    fetchData(1);
  }, [sortBy, sortOrder, search, filters, pageSize, fetchData]);

  return (
    <div className="min-h-screen">
      <section className="bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-center mb-2">
              Detailed Listings
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Browse and analyze your complete rental listings with advanced
              filtering and sorting
            </p>
          </motion.div>

          <div className="flex gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <FiltersSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </motion.div>

            <div>
                <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4">Location Overview</h2>
              <ListingsMap filters={filters} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex-1"
            >
              <DataTable
                columns={columns}
                data={data}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={fetchData}
                onSort={handleSort}
                onSearch={handleSearch}
                loading={loading}
              />
            </motion.div>
            </div>
          
          </div>
        </div>
      </section>
    </div>
  );
}
