import type { Listing } from "../types/listings";

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
          listing_url: "",
          scrape_id: "",
          last_scraped: "",
          source: "",
          name: "",
          description: "",
          neighborhood_overview: "",
          picture_url: "",
          host_id: "",
          host_url: "",
          host_name: "",
          host_since: "",
          host_location: "",
          host_about: "",
          host_response_time: "",
          host_response_rate: "",
          host_acceptance_rate: "",
          host_is_superhost: "",
          host_thumbnail_url: "",
          host_picture_url: "",
          host_neighbourhood: "",
          host_listings_count: "",
          host_total_listings_count: "",
          host_verifications: "",
          host_has_profile_pic: "",
          host_identity_verified: "",
          neighbourhood: "",
          neighbourhood_cleansed: "",
          neighbourhood_group_cleansed: "",
          latitude: "",
          longitude: "",
          property_type: "",
          room_type: "",
          accommodates: "",
          bathrooms: "",
          bathrooms_text: "",
          bedrooms: "",
          beds: "",
          amenities: "",
          price: "",
          minimum_nights: "",
          maximum_nights: "",
          minimum_minimum_nights: "",
          maximum_minimum_nights: "",
          minimum_maximum_nights: "",
          maximum_maximum_nights: "",
          minimum_nights_avg_ntm: "",
          maximum_nights_avg_ntm: "",
          calendar_updated: "",
          has_availability: "",
          availability_30: "",
          availability_60: "",
          availability_90: "",
          availability_365: "",
          calendar_last_scraped: "",
          number_of_reviews: "",
          number_of_reviews_ltm: "",
          number_of_reviews_l30d: "",
          availability_eoy: "",
          number_of_reviews_ly: "",
          estimated_occupancy_l365d: "",
          estimated_revenue_l365d: "",
          first_review: "",
          last_review: "",
          review_scores_rating: "",
          review_scores_accuracy: "",
          review_scores_cleanliness: "",
          review_scores_checkin: "",
          review_scores_communication: "",
          review_scores_location: "",
          review_scores_value: "",
          license: "",
          instant_bookable: "",
          calculated_host_listings_count: "",
          calculated_host_listings_count_entire_homes: "",
          calculated_host_listings_count_private_rooms: "",
          calculated_host_listings_count_shared_rooms: "",
          reviews_per_month: "",
          potential_revenue: 0,
          risk_score: 0,
        };

        headers.forEach((header, index) => {
          const value = values[index] ? values[index].trim().replace(/"/g, "") : "";
          switch (header) {
            case "id":
              listing.id = value;
              break;
            case "listing_url":
              listing.listing_url = value;
              break;
            case "scrape_id":
              listing.scrape_id = value;
              break;
            case "last_scraped":
              listing.last_scraped = value;
              break;
            case "source":
              listing.source = value;
              break;
            case "name":
              listing.name = value;
              break;
            case "description":
              listing.description = value;
              break;
            case "neighborhood_overview":
              listing.neighborhood_overview = value;
              break;
            case "picture_url":
              listing.picture_url = value;
              break;
            case "host_id":
              listing.host_id = value;
              break;
            case "host_url":
              listing.host_url = value;
              break;
            case "host_name":
              listing.host_name = value;
              break;
            case "host_since":
              listing.host_since = value;
              break;
            case "host_location":
              listing.host_location = value;
              break;
            case "host_about":
              listing.host_about = value;
              break;
            case "host_response_time":
              listing.host_response_time = value;
              break;
            case "host_response_rate":
              listing.host_response_rate = value;
              break;
            case "host_acceptance_rate":
              listing.host_acceptance_rate = value;
              break;
            case "host_is_superhost":
              listing.host_is_superhost = value;
              break;
            case "host_thumbnail_url":
              listing.host_thumbnail_url = value;
              break;
            case "host_picture_url":
              listing.host_picture_url = value;
              break;
            case "host_neighbourhood":
              listing.host_neighbourhood = value;
              break;
            case "host_listings_count":
              listing.host_listings_count = value;
              break;
            case "host_total_listings_count":
              listing.host_total_listings_count = value;
              break;
            case "host_verifications":
              listing.host_verifications = value;
              break;
            case "host_has_profile_pic":
              listing.host_has_profile_pic = value;
              break;
            case "host_identity_verified":
              listing.host_identity_verified = value;
              break;
            case "neighbourhood":
              listing.neighbourhood = value;
              break;
            case "neighbourhood_cleansed":
              listing.neighbourhood_cleansed = value;
              break;
            case "neighbourhood_group_cleansed":
              listing.neighbourhood_group_cleansed = value;
              break;
            case "latitude":
              listing.latitude = value;
              break;
            case "longitude":
              listing.longitude = value;
              break;
            case "property_type":
              listing.property_type = value;
              break;
            case "room_type":
              listing.room_type = value;
              break;
            case "accommodates":
              listing.accommodates = value;
              break;
            case "bathrooms":
              listing.bathrooms = value;
              break;
            case "bathrooms_text":
              listing.bathrooms_text = value;
              break;
            case "bedrooms":
              listing.bedrooms = value;
              break;
            case "beds":
              listing.beds = value;
              break;
            case "amenities":
              listing.amenities = value;
              break;
            case "price":
              listing.price = value;
              break;
            case "minimum_nights":
              listing.minimum_nights = value;
              break;
            case "maximum_nights":
              listing.maximum_nights = value;
              break;
            case "minimum_minimum_nights":
              listing.minimum_minimum_nights = value;
              break;
            case "maximum_minimum_nights":
              listing.maximum_minimum_nights = value;
              break;
            case "minimum_maximum_nights":
              listing.minimum_maximum_nights = value;
              break;
            case "maximum_maximum_nights":
              listing.maximum_maximum_nights = value;
              break;
            case "minimum_nights_avg_ntm":
              listing.minimum_nights_avg_ntm = value;
              break;
            case "maximum_nights_avg_ntm":
              listing.maximum_nights_avg_ntm = value;
              break;
            case "calendar_updated":
              listing.calendar_updated = value;
              break;
            case "has_availability":
              listing.has_availability = value;
              break;
            case "availability_30":
              listing.availability_30 = value;
              break;
            case "availability_60":
              listing.availability_60 = value;
              break;
            case "availability_90":
              listing.availability_90 = value;
              break;
            case "availability_365":
              listing.availability_365 = value;
              break;
            case "calendar_last_scraped":
              listing.calendar_last_scraped = value;
              break;
            case "number_of_reviews":
              listing.number_of_reviews = value;
              break;
            case "number_of_reviews_ltm":
              listing.number_of_reviews_ltm = value;
              break;
            case "number_of_reviews_l30d":
              listing.number_of_reviews_l30d = value;
              break;
            case "availability_eoy":
              listing.availability_eoy = value;
              break;
            case "number_of_reviews_ly":
              listing.number_of_reviews_ly = value;
              break;
            case "estimated_occupancy_l365d":
              listing.estimated_occupancy_l365d = value;
              break;
            case "estimated_revenue_l365d":
              listing.estimated_revenue_l365d = value;
              break;
            case "first_review":
              listing.first_review = value;
              break;
            case "last_review":
              listing.last_review = value;
              break;
            case "review_scores_rating":
              listing.review_scores_rating = value;
              break;
            case "review_scores_accuracy":
              listing.review_scores_accuracy = value;
              break;
            case "review_scores_cleanliness":
              listing.review_scores_cleanliness = value;
              break;
            case "review_scores_checkin":
              listing.review_scores_checkin = value;
              break;
            case "review_scores_communication":
              listing.review_scores_communication = value;
              break;
            case "review_scores_location":
              listing.review_scores_location = value;
              break;
            case "review_scores_value":
              listing.review_scores_value = value;
              break;
            case "license":
              listing.license = value;
              break;
            case "instant_bookable":
              listing.instant_bookable = value;
              break;
            case "calculated_host_listings_count":
              listing.calculated_host_listings_count = value;
              break;
            case "calculated_host_listings_count_entire_homes":
              listing.calculated_host_listings_count_entire_homes = value;
              break;
            case "calculated_host_listings_count_private_rooms":
              listing.calculated_host_listings_count_private_rooms = value;
              break;
            case "calculated_host_listings_count_shared_rooms":
              listing.calculated_host_listings_count_shared_rooms = value;
              break;
            case "reviews_per_month":
              listing.reviews_per_month = value;
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
 * Parses a single CSV line, handling quoted fields that may contain commas and escaped quotes.
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
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
