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
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSort?: (columnId: string, order: "asc" | "desc") => void;
  onSearch?: (searchTerm: string) => void;
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onSort,
  onSearch,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const sortTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      if (newSorting.length > 0 && onSort) {
        // Clear existing timeout
        if (sortTimeoutRef.current) {
          clearTimeout(sortTimeoutRef.current);
        }
        // Debounce the sort call
        sortTimeoutRef.current = setTimeout(() => {
          const { id, desc } = newSorting[0];
          onSort(id, desc ? "desc" : "asc");
        }, 300); // 300ms debounce
      }
    },
  });

  // Debounce search calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchValue);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  // Cleanup sort timeout on unmount
  useEffect(() => {
    return () => {
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
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
            <Button variant="outline" className="ml-auto">
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative max-h-[calc(100vh-300px)] overflow-auto">
        <Table className="relative">
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
            onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(total / pageSize) || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
