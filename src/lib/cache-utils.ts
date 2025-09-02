const CACHE_DURATION =
  process.env.NODE_ENV === "development" ? 30 * 1000 : 5 * 60 * 1000; // 30 seconds dev, 5 minutes prod

export function isCacheValid(
  timestamp: number,
  fileModified: number,
  duration: number = CACHE_DURATION
): boolean {
  return Date.now() - timestamp < duration && fileModified <= timestamp;
}