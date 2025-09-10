"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { Listing } from "../types/listings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, decodeHtmlEntities, formatCurrency } from "@/lib/utils";


const SortableHeaderButton = ({
  column,
  label,
  className,
  isNumeric,
  tooltip,
}: {
  column: Column<Listing>;
  label: string;
  className?: string;
  isNumeric?: boolean;
  tooltip?: string;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn(
      "pl-[8px]!",
      isNumeric && "justify-end w-full pr-0.5!",
      className,
    )}
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    aria-label={
      column.getIsSorted() === "asc"
        ? `Sort ${label} descending`
        : `Sort ${label} ascending`
    }
    title={tooltip}
  >
    {label}
    {Boolean(column.getIsSorted()) && (
        column.getIsSorted() === "asc" ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
    )}
  </Button>
);

export const columns: ColumnDef<Listing>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeaderButton column={column} label="Host Name / Name" />
    ),
    cell: ({ row }) => {
      const [imageError, setImageError] = useState(false);
      const [imageLoaded, setImageLoaded] = useState(false);

      return (
        <div className="flex items-center gap-3">
          {imageError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center"
            >
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12"
            >
              <Image
                src={row.original.picture_url}
                alt={row.original.name}
                width={48}
                height={48}
                className="rounded-md object-cover w-full h-full"
                loading="lazy"
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
          )}
          <div className="flex flex-col">
            <div>{decodeHtmlEntities(row.original.host_name)}</div>
            <div className="text-[11px] text-gray-700">{row.original.name}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "room_type",
    header: "Room Type",
    cell: ({ row }) => {
      const roomType = row.getValue("room_type") as string;
      const getBadgeVariant = (type: string) => {
        switch (type.toLowerCase()) {
          case "entire home/apt":
            return "default";
          case "private room":
            return "secondary";
          case "shared room":
            return "warning";
          case "hotel room":
            return "info";
          default:
            return "outline";
        }
      };

      return (
        <Badge
          variant={getBadgeVariant(roomType)}
          className="font-medium text-[10px] whitespace-nowrap"
          title={roomType}
        >
          {roomType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <SortableHeaderButton column={column} label="Price" isNumeric={true} />
    ),
    cell: ({ row }) => {
      const price = row.getValue<string | number>("price");
      return (
        <div className="text-right font-medium">{formatCurrency(price)}</div>
      );
    },
  },
  {
    accessorKey: "neighbourhood_cleansed",
    header: "Neighborhood",
  },
  {
    accessorKey: "potential_revenue",
    header: ({ column }) => (
      <SortableHeaderButton
        column={column}
        label="Potential Revenue"
        isNumeric={true}
      />
    ),
    cell: ({ row }) => {
      const revenue = row.getValue("potential_revenue") as number;

      return (
        <div className="text-right font-medium">{formatCurrency(revenue)}</div>
      );
    },
  },
  {
    accessorKey: "risk_score",
    header: ({ column }) => (
      <SortableHeaderButton
        column={column}
        label="Risk Score"
        isNumeric={true}
        tooltip="Risk Score: 0-50 (lower is better). Combines factors: room type (shared rooms higher risk), occupancy (lower availability higher risk), host exposure (more listings higher risk), reviews (fewer reviews higher risk), minimum nights (longer stays higher risk), reviews per month (less frequent higher risk)."
      />
    ),
    cell: ({ row }) => {
      const risk = row.getValue("risk_score") as number;
      const formatted = Number.isNaN(risk) ? "N/A" : risk.toFixed(2);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];
