import { describe, expect, it } from "vitest";
import { parseCSVToListings } from "../lib/csv-parser";

describe("CSV Upload - Split Record Handling", () => {
  it("should correctly handle split records across multiple lines", () => {
    // Sample CSV content with a split record
    const csvContent = `id,name,host_id,host_name,neighbourhood_group,neighbourhood,latitude,longitude,room_type,price,minimum_nights,number_of_reviews,last_review,reviews_per_month,calculated_host_listings_count,availability_365,number_of_reviews_ltm,license
775192,Private Bedroom/Bathroom SE Austin,2438977,David,,78741,30.23746,-97.7099,Private room,,1,2,2013-03-18,0.01,1,0,0,
776649,"Huge house 15mins walk
to Downtown",1101753,John & Tina,,78704,30.24369,-97.74169,Entire home/apt,,2,58,2019-08-04,0.39,1,0,0,
785963,Bouldin Cottage,4143759,Katy,,78704,30.24784,-97.76318,Entire home/apt,248,2,131,2025-06-08,0.96,1,147,10,`;

    const result = parseCSVToListings(csvContent);

    expect(result).toHaveLength(3);
    expect(result[1].name).toBe("Huge house 15mins walk\nto Downtown");
    expect(result[1].id).toBe("776649");
    expect(result[1].host_name).toBe("John & Tina");
  });

  it("should handle multiple split records", () => {
    const csvContent = `id,name,host_id,host_name,neighbourhood_group,neighbourhood,latitude,longitude,room_type,price,minimum_nights,number_of_reviews,last_review,reviews_per_month,calculated_host_listings_count,availability_365,number_of_reviews_ltm,license
775192,Private Bedroom/Bathroom SE Austin,2438977,David,,78741,30.23746,-97.7099,Private room,,1,2,2013-03-18,0.01,1,0,0,
776649,"Huge house 15mins walk
to Downtown",1101753,John & Tina,,78704,30.24369,-97.74169,Entire home/apt,,2,58,2019-08-04,0.39,1,0,0,
785963,"Bouldin
Cottage",4143759,Katy,,78704,30.24784,-97.76318,Entire home/apt,248,2,131,2025-06-08,0.96,1,147,10,`;

    const result = parseCSVToListings(csvContent);

    expect(result).toHaveLength(3);
    expect(result[1].name).toBe("Huge house 15mins walk\nto Downtown");
    expect(result[2].name).toBe("Bouldin\nCottage");
  });

  it("should handle records with quotes but no splits", () => {
    const csvContent = `id,name,host_id,host_name,neighbourhood_group,neighbourhood,latitude,longitude,room_type,price,minimum_nights,number_of_reviews,last_review,reviews_per_month,calculated_host_listings_count,availability_365,number_of_reviews_ltm,license
775192,"Private Bedroom/Bathroom SE Austin",2438977,David,,78741,30.23746,-97.7099,Private room,,1,2,2013-03-18,0.01,1,0,0,
776649,"Huge house 15mins walk to Downtown",1101753,"John & Tina",,78704,30.24369,-97.74169,Entire home/apt,,2,58,2019-08-04,0.39,1,0,0,`;

    const result = parseCSVToListings(csvContent);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Private Bedroom/Bathroom SE Austin");
    expect(result[1].name).toBe("Huge house 15mins walk to Downtown");
    expect(result[1].host_name).toBe("John & Tina");
  });
});
