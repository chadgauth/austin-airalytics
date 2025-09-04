"use client";

import type {
  ColumnDef,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc/client";
import { useDebounce } from "@/lib/utils";
import type { FilterOptions, Filters } from "@/types/filters";
import type { Listing } from "@/types/listings";

const COLUMN_LABELS: Record<string, string> = {
  name: "Host Name / Name",
  room_type: "Room Type",
  price: "Price",
  neighbourhood_cleansed: "Neighborhood",
  potential_revenue: "Potential Revenue",
  risk_score: "Risk Score",
  actions: "Actions",
};

interface PaginatedResponse {
  data: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface DataTableProps {
  columns: ColumnDef<Listing>[];
  filters: Filters;
  filterOptions: FilterOptions | null;
}

export function DataTable({ columns, filters, filterOptions }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const debouncedSorting = useDebounce(sorting, 300);

  const handleSort = useCallback((columnId: string, order: "asc" | "desc") => {
    setSortBy(columnId);
    setSortOrder(order);
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
  }, []);

  const { data: listingsData, isLoading } = trpc.listings.getListings.useQuery({
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
    search,
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
  });

  useEffect(() => {
    if (listingsData) {
      setData(listingsData.data);
      setTotal(listingsData.total);
      setCurrentPage(listingsData.page);
    }
    setLoading(isLoading);
  }, [listingsData, isLoading]);


  const table = useReactTable({
    data,
    columns,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize),
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
    },
  });

  // Handle debounced search
  useEffect(() => {
    if (handleSearch) {
      handleSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, handleSearch]);

  // Handle debounced sorting
  useEffect(() => {
    if (debouncedSorting.length > 0 && handleSort) {
      const { id, desc } = debouncedSorting[0];
      handleSort(id, desc ? "desc" : "asc");
    }
  }, [debouncedSorting, handleSort]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="flex items-center relative gap-2 py-2 max-w-sm">
        <Input
          placeholder="Search properties..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm pl-8"
        >
          <Search />
        </Input>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <Filter className="size-3" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {COLUMN_LABELS[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative max-h-[calc(100vh-300px)] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: pageSize }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Loading skeletons use stable indices
                <TableRow key={`skeleton-${currentPage}-${index}`}>
                  {columns.map((_, colIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Loading skeletons use stable indices
                    <TableCell key={`skeleton-cell-${colIndex}-${index}`}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {loading
            ? "Loading..."
            : `Showing ${data.length} of ${total} listings`}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {Math.ceil(total / pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage >= Math.ceil(total / pageSize) || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
