import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const decodeHtmlEntities = (str: string): string => {
  const entities = new Map<string, string>([
    ['&quot;', '"'],
    ['&Quot;', '"'],
    ['&apos;', "'"],
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&nbsp;', ' '],
    ['&#x27;', "'"],
    ['&#x2F;', '/'],
    ['&#x60;', '`'],
    ['&#x3D;', '='],
  ]);

  return str.replace(/&[a-zA-Z0-9#]+;/g, (entity) => entities.get(entity) || entity);
};

/**
 * Calculates the Interquartile Range (IQR) bounds for outlier detection.
 * Outlier detection using IQR method:
 * - Sort the values
 * - Find Q1 (25th percentile) and Q3 (75th percentile)
 * - IQR = Q3 - Q1
 * - Lower bound = Q1 - multiplier * IQR
 * - Upper bound = Q3 + multiplier * IQR
 * - Values outside these bounds are considered outliers
 * Uses a multiplier of 2.0 for more lenient detection, allowing some extreme but valid values.
 * @param values Array of numbers (should be filtered for valid values)
 * @returns Object with lower and upper bounds
 */
export function calculateIQRBounds(values: number[]): { lower: number; upper: number } {
  if (values.length === 0) return { lower: -Infinity, upper: Infinity };

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lower = q1 - 2.0 * iqr;
  const upper = q3 + 2.0 * iqr;

  return { lower, upper };
}

/**
 * Checks if a value is an outlier based on IQR bounds.
 * @param value The value to check
 * @param bounds The IQR bounds
 * @returns True if outlier
 */
export function isOutlier(value: number, bounds: { lower: number; upper: number }): boolean {
  return value < bounds.lower || value > bounds.upper;
}
