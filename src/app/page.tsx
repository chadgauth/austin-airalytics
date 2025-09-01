"use client";

import { useEffect, useState } from "react";
import { CSVUpload } from "./csv-upload";
import { columns } from "./listings.columns";
import { getListingsData } from "./listings.data";
import { DataTable } from "./listings.data-table";
import type { Listing } from "./listings.types";

export default function Home() {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const initialData = await getListingsData();
        setData(initialData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDataUpload = (uploadedData: Listing[]) => {
    setData(uploadedData);
    setShowAnimation(true);

    // Hide animation after 2 seconds
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Airbnb Listings</h1>
        <CSVUpload onDataUpload={handleDataUpload} />
      </div>

      {showAnimation && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-bold">Success!</p>
          <p>Data has been updated with {data.length} records.</p>
        </div>
      )}

      <DataTable columns={columns} data={data} />
    </div>
  );
}
