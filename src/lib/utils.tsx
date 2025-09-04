"use client";
import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const decodeHtmlEntities = (str: string): string => {
  const entities = new Map<string, string>([
    ["&quot;", '"'],
    ["&Quot;", '"'],
    ["&apos;", "'"],
    ["&amp;", "&"],
    ["&lt;", "<"],
    ["&gt;", ">"],
    ["&nbsp;", " "],
    ["&#x27;", "'"],
    ["&#x2F;", "/"],
    ["&#x60;", "`"],
    ["&#x3D;", "="],
  ]);

  return str.replace(
    /&[a-zA-Z0-9#]+;/g,
    (entity) => entities.get(entity) || entity,
  );
};

export const formatCurrency = (value: string | number | null | undefined) => {
  if (value == null) {
    return "N/A";
  }

  const strValue = typeof value === 'string' ? value : value.toString();
  const numValue = parseFloat(strValue.replace(/[^0-9.-]/g, ''));

  if (Number.isNaN(numValue)) {
    return "N/A";
  }

  const formatted = numValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Split into dollars and cents
  const [dollars, cents] = formatted.split(".");

  return (
    <span>
      {dollars}
      <sup className="text-[9px] pl-[1px] text-gray-400 font-semibold relative -top-1">
        {cents}
      </sup>
    </span>
  );
};
