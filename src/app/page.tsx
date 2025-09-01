"use client";

import { useCallback, useEffect, useState } from "react";
import type { Listing } from "../types/listings";
// import { CSVUpload } from "./csv-upload";
import { columns } from "./listings.columns";
import { DataTable } from "./listings.data-table";

interface PaginatedResponse {
  data: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function Home() {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  // const [showAnimation, setShowAnimation] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally omitting sortBy, sortOrder, search to prevent fetchData re-creation on sort/search changes
  const fetchData = useCallback(
    async (page: number = 1, sortByParam?: string, sortOrderParam?: 'asc' | 'desc', searchParam?: string) => {
      setLoading(true);
      try {
        const sortByValue = sortByParam || sortBy;
        const sortOrderValue = sortOrderParam || sortOrder;
        const searchValue = searchParam !== undefined ? searchParam : search;
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy: sortByValue,
          sortOrder: sortOrderValue,
        });
        if (searchValue) {
          params.append('search', searchValue);
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
    [pageSize],
  );

  const handleSort = useCallback((columnId: string, order: 'asc' | 'desc') => {
    setSortBy(columnId);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting
    fetchData(1, columnId, order);
  }, [fetchData]);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
    fetchData(1, undefined, undefined, searchTerm);
  }, [fetchData]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // const handleDataUpload = (uploadedData: Listing[]) => {
  //   setData(uploadedData);
  //   setShowAnimation(true);

  //   // Hide animation after 2 seconds
  //   setTimeout(() => {
  //     setShowAnimation(false);
  //   }, 2000);
  // };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Airbnb Listings</h1>
        {/* <CSVUpload onDataUpload={handleDataUpload} /> */}
      </div>

      {/* {showAnimation && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-bold">Success!</p>
          <p>Data has been updated with {data.length} records.</p>
        </div>
      )} */}

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
    </div>
  );
}
