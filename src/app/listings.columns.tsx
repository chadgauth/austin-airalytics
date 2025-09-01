"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import type { Listing } from "./listings.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const SortableHeaderButton = ({
  column,
  label,
  className,
}: {
  column: Column<Listing>;
  label: string;
  className?: string;
}) => (
  <Button
    variant="ghost"     
    size="sm"
    className={cn("pl-[8px]!", className)}
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    aria-label={
      column.getIsSorted() === "asc"
        ? `Sort ${label} descending`
        : `Sort ${label} ascending`
    }
  >
    {label}
    {
      Boolean(column.getIsSorted()) && <>
        {column.getIsSorted() === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      </>
    }
  </Button>
);

export const columns: ColumnDef<Listing>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeaderButton column={column} label="ID" />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeaderButton column={column} label="Name" />
    ),
  },
  {
    accessorKey: "host_name",
    header: ({ column }) => (
      <SortableHeaderButton column={column} label="Host" />
    ),
  },
  {
    accessorKey: "room_type",
    header: "Room Type",
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = Number.isNaN(price) ? "N/A" : `$${price.toFixed(2)}`;

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "neighbourhood",
    header: "Neighborhood",
  },
  {
    id: "actions",
    cell: () => {
      return (
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];
