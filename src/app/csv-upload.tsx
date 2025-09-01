"use client";

import { useRef, useState } from "react";
import { parseCSVToListings } from "../lib/csv-parser";
import type { Listing } from "./listings.types";
import { Input } from "@/components/ui/input";

interface CSVUploadProps {
  onDataUpload: (data: Listing[]) => void;
}

export function CSVUpload({ onDataUpload }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (content) {
          // Parse CSV content with split record support
          const parsedData = parseCSVToListings(content);

          onDataUpload(parsedData);
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="max-w-sm"
        disabled={isUploading}
      />
      {isUploading && (
        <div className="flex items-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <span className="ml-2">Processing...</span>
        </div>
      )}
    </div>
  );
}
