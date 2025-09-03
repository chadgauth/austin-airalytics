"use client";

import { motion } from "framer-motion";
import { Filter, List, MapIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Listing } from "../../types/listings";
import { columns } from "../listings.columns";
import { DataTable } from "../listings.data-table";
import { FiltersSidebar } from "@/components/filters-sidebar";
import ListingsMap from "@/components/map";
import { Button } from "@/components/ui/button";

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

export default function Dashboard() {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<Filters>({
    zip: [],
    roomType: [],
    propertyType: [],
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

  // Mobile-specific state
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [filtersOpen, setFiltersOpen] = useState(false);

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
        if (currentFilters.maxPrice < Infinity && currentFilters.maxPrice !== filterOptions?.maxPrice) {
          params.append("maxPrice", currentFilters.maxPrice.toString());
        }
        if (currentFilters.minAccommodates > 0) {
          params.append(
            "minAccommodates",
            currentFilters.minAccommodates.toString(),
          );
        }
        if (currentFilters.maxAccommodates < Infinity && currentFilters.maxAccommodates !== filterOptions?.maxAccommodates) {
          params.append(
            "maxAccommodates",
            currentFilters.maxAccommodates.toString(),
          );
        }
        if (currentFilters.minBedrooms > 0) {
          params.append("minBedrooms", currentFilters.minBedrooms.toString());
        }
        if (currentFilters.maxBedrooms < Infinity && currentFilters.maxBedrooms !== filterOptions?.maxBedrooms) {
          params.append("maxBedrooms", currentFilters.maxBedrooms.toString());
        }
        if (currentFilters.minReviewScore > 0) {
          params.append(
            "minReviewScore",
            currentFilters.minReviewScore.toString(),
          );
        }
        if (currentFilters.maxReviewScore < Infinity && currentFilters.maxReviewScore !== filterOptions?.maxReviewScore) {
          params.append(
            "maxReviewScore",
            currentFilters.maxReviewScore.toString(),
          );
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
    [pageSize, sortBy, sortOrder, search, filters, filterOptions],
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

  // Fetch filter options and set initial filters based on dataset ranges
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/listings/filters');
        if (response.ok) {
          const options: FilterOptions = await response.json();
          setFilterOptions(options);
          // Update filters with dataset ranges
          setFilters(prev => ({
            ...prev,
            minPrice: options.minPrice,
            maxPrice: options.maxPrice,
            minAccommodates: options.minAccommodates,
            maxAccommodates: options.maxAccommodates,
            minBedrooms: options.minBedrooms,
            maxBedrooms: options.maxBedrooms,
            minReviewScore: options.minReviewScore,
            maxReviewScore: options.maxReviewScore,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // biome-ignore lint: We depend on states to trigger fetch, fetchData is memoized with these deps
  useEffect(() => {
    fetchData(1);
  }, [sortBy, sortOrder, search, filters, pageSize, fetchData]);

  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Austin Airbnb Explorer</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={mobileView === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMobileView('map')}
          >
            <MapIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={mobileView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMobileView('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <section className="hidden md:block bg-muted/30">
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
                filterOptions={filterOptions}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </motion.div>

            <div className="flex-1">
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

      {/* Mobile Layout */}
      <div className="md:hidden relative">
        {/* Mobile Content */}
        <div className="h-[calc(100vh-73px)]">
          {mobileView === 'map' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <ListingsMap filters={filters} className="h-full" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full overflow-auto"
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
          )}
        </div>

        {/* Mobile Filters Overlay */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1100]"
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute left-0 top-0 h-full w-80 bg-background shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiltersOpen(false)}
                    >
                      ✕
                    </Button>
                    <h3 className="font-semibold">Filters</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-muted-foreground hover:text-foreground border border-orange-200 hover:border-orange-300"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto flex-1 h-full bg-background">
                <FiltersSidebar
                  filters={filters}
                  filterOptions={filterOptions}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Floating Filter Button */}
        <Button
          className="fixed bottom-4 left-4 z-[1000] rounded-full w-12 h-12 shadow-lg"
          onClick={() => setFiltersOpen(true)}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
