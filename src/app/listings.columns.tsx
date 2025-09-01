"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import type { Listing } from "../types/listings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, decodeHtmlEntities } from "@/lib/utils";

const formatCurrency = (value: number) => {
  if (Number.isNaN(value)) {
    return "N/A";
  }

  const formatted = value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Split into dollars and cents
  const [dollars, cents] = formatted.split('.');

  return (
    <span>
      {dollars}<sup className="text-[9px] pl-[1px] text-gray-400 font-semibold relative -top-1">{cents}</sup>
    </span>
  );
};

const SortableHeaderButton = ({
  column,
  label,
  className,
  isNumeric,
}: {
  column: Column<Listing>;
  label: string;
  className?: string;
  isNumeric?: boolean
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn("pl-[8px]!", isNumeric && "justify-end w-full pr-0.5!", className)}
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
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeaderButton column={column} label="Host Name / Name" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div>{decodeHtmlEntities(row.original.host_name)}</div>
        <div className="text-[11px] text-gray-700">{row.original.name}</div>
      </div>
    ),
  },
  {
    accessorKey: "room_type",
    header: "Room Type",
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
        <SortableHeaderButton column={column} label="Price" isNumeric={true} />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));

      return (
        <div className="text-right font-medium">
          {formatCurrency(price)}
        </div>
      );
    },
  },
  {
    accessorKey: "neighbourhood",
    header: "Neighborhood",
  },
  {
    accessorKey: "potential_revenue",
    header: ({ column }) => (
      <SortableHeaderButton column={column} label="Potential Revenue" isNumeric={true} />
    ),
    cell: ({ row }) => {
      const revenue = row.getValue("potential_revenue") as number;

      return (
        <div className="text-right font-medium">
          {formatCurrency(revenue)}
        </div>
      );
    },
  },
  {
    accessorKey: "risk_score",
    header: ({ column }) => (
      <SortableHeaderButton column={column} label="Risk Score" isNumeric={true} />
    ),
    cell: ({ row }) => {
      const risk = row.getValue("risk_score") as number;
      const formatted = Number.isNaN(risk) ? "N/A" : risk.toFixed(2);

      return <div className="text-right font-medium">{formatted}</div>;
    },
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
