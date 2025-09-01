import type { Listing } from "../app/listings.types";

/**
 * Parses CSV text into an array of Listing objects.
 * Handles quoted fields that may contain commas and newlines.
 */
export function parseCSVToListings(csvText: string): Listing[] {
  const lines = csvText.split("\n");
  if (lines.length < 1) return [];

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().replace(/"/g, ""));

  const listings: Listing[] = [];
  let currentLine = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" && currentLine === "") continue;

    currentLine += (currentLine ? "\n" : "") + line;

    // Count quotes to determine if we're in a quoted field
    const quoteCount = (currentLine.match(/"/g) || []).length;

    // If we have an even number of quotes, we've completed a record
    if (quoteCount % 2 === 0) {
      // Parse the completed record
      const values = parseCSVLine(currentLine);
      if (values.length === headers.length) {
        const listing: Listing = {
          id: "",
          name: "",
          host_id: "",
          host_name: "",
          neighbourhood_group: "",
          neighbourhood: "",
          latitude: "",
          longitude: "",
          room_type: "",
          price: "",
          minimum_nights: "",
          number_of_reviews: "",
          last_review: "",
          reviews_per_month: "",
          calculated_host_listings_count: "",
          availability_365: "",
          number_of_reviews_ltm: "",
          license: "",
        };

        headers.forEach((header, index) => {
          const value = values[index] ? values[index].trim().replace(/"/g, "") : "";
          switch (header) {
            case "id":
              listing.id = value;
              break;
            case "name":
              listing.name = value;
              break;
            case "host_id":
              listing.host_id = value;
              break;
            case "host_name":
              listing.host_name = value;
              break;
            case "neighbourhood_group":
              listing.neighbourhood_group = value;
              break;
            case "neighbourhood":
              listing.neighbourhood = value;
              break;
            case "latitude":
              listing.latitude = value;
              break;
            case "longitude":
              listing.longitude = value;
              break;
            case "room_type":
              listing.room_type = value;
              break;
            case "price":
              listing.price = value;
              break;
            case "minimum_nights":
              listing.minimum_nights = value;
              break;
            case "number_of_reviews":
              listing.number_of_reviews = value;
              break;
            case "last_review":
              listing.last_review = value;
              break;
            case "reviews_per_month":
              listing.reviews_per_month = value;
              break;
            case "calculated_host_listings_count":
              listing.calculated_host_listings_count = value;
              break;
            case "availability_365":
              listing.availability_365 = value;
              break;
            case "number_of_reviews_ltm":
              listing.number_of_reviews_ltm = value;
              break;
            case "license":
              listing.license = value;
              break;
            default:
              // Handle any additional fields if needed
              break;
          }
        });

        listings.push(listing);
      }
      currentLine = "";
    }
  }

  return listings;
}

/**
 * Parses a single CSV line, handling quoted fields that may contain commas.
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      // End of field
      values.push(currentValue);
      currentValue = "";
    } else {
      // Regular character
      currentValue += char;
    }
  }

  // Add the last value
  values.push(currentValue);

  return values;
}