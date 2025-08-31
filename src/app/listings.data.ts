import type { Listing } from "./listings.types";

export async function getListingsData(): Promise<Listing[]> {
  const response = await fetch("http://localhost:3000/listings.csv");
  const csvText = await response.text();
  
  // Parse CSV data
  const lines = csvText.split("\n");
  const headers = lines[0].split(",").map(header => header.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => { // Limit to first 100 rows for performance
    if (line.trim() === "") return null;
    
    const values = line.split(",");
    const listing = {} as Listing;
    
    headers.forEach((header, index) => {
      const value = values[index] ? values[index].trim().replace(/"/g, '') : "";
      switch (header) {
        case 'id':
          listing.id = value;
          break;
        case 'name':
          listing.name = value;
          break;
        case 'host_id':
          listing.host_id = value;
          break;
        case 'host_name':
          listing.host_name = value;
          break;
        case 'neighbourhood_group':
          listing.neighbourhood_group = value;
          break;
        case 'neighbourhood':
          listing.neighbourhood = value;
          break;
        case 'latitude':
          listing.latitude = value;
          break;
        case 'longitude':
          listing.longitude = value;
          break;
        case 'room_type':
          listing.room_type = value;
          break;
        case 'price':
          listing.price = value;
          break;
        case 'minimum_nights':
          listing.minimum_nights = value;
          break;
        case 'number_of_reviews':
          listing.number_of_reviews = value;
          break;
        case 'last_review':
          listing.last_review = value;
          break;
        case 'reviews_per_month':
          listing.reviews_per_month = value;
          break;
        case 'calculated_host_listings_count':
          listing.calculated_host_listings_count = value;
          break;
        case 'availability_365':
          listing.availability_365 = value;
          break;
        case 'number_of_reviews_ltm':
          listing.number_of_reviews_ltm = value;
          break;
        case 'license':
          listing.license = value;
          break;
        default:
          // Handle any additional fields if needed
          break;
      }
    });
    
    return listing;
  }).filter(Boolean) as Listing[]; // Remove null values
}