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
