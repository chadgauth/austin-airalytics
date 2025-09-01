import { parseCSVToListings } from "../lib/csv-parser";
import type { Listing } from "../types/listings";

export async function getListingsData(): Promise<Listing[]> {
  try {
    const response = await fetch("http://localhost:3000/listings.csv");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`,
      );
    }
    const csvText = await response.text();

    return parseCSVToListings(csvText);
  } catch (error) {
    console.error("Error fetching or parsing data:", error);  
    return [];
  }
}
