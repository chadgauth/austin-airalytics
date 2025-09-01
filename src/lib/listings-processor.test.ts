import { describe, expect, it } from "vitest";
import {
  calculateRiskScore,
  enhanceListings,
  processListings,
} from "./listings-processor";
import type { Listing } from "@/types/listings";

describe("listings-processor", () => {
  const mockListings: Listing[] = [
    {
      id: "1",
      name: "Test Listing 1",
      host_id: "1",
      host_name: "Host 1",
      neighbourhood_group: "Manhattan",
      neighbourhood: "Midtown",
      latitude: "40.7589",
      longitude: "-73.9851",
      room_type: "Entire home/apt",
      price: "100",
      minimum_nights: "1",
      number_of_reviews: "10",
      last_review: "2023-01-01",
      reviews_per_month: "2.5",
      calculated_host_listings_count: "1",
      availability_365: "200",
      number_of_reviews_ltm: "5",
      license: "",
      potential_revenue: 0,
      risk_score: 0,
    },
    {
      id: "2",
      name: "Test Listing 2",
      host_id: "2",
      host_name: "Host 2",
      neighbourhood_group: "Manhattan",
      neighbourhood: "Midtown",
      latitude: "40.7589",
      longitude: "-73.9851",
      room_type: "Private room",
      price: "50",
      minimum_nights: "2",
      number_of_reviews: "5",
      last_review: "2023-01-01",
      reviews_per_month: "1.0",
      calculated_host_listings_count: "1",
      availability_365: "100",
      number_of_reviews_ltm: "2",
      license: "",
      potential_revenue: 0,
      risk_score: 0,
    },
    {
      id: "3",
      name: "Invalid Price Listing",
      host_id: "3",
      host_name: "Host 3",
      neighbourhood_group: "Brooklyn",
      neighbourhood: "Williamsburg",
      latitude: "40.7081",
      longitude: "-73.9571",
      room_type: "Entire home/apt",
      price: "0",
      minimum_nights: "1",
      number_of_reviews: "0",
      last_review: "",
      reviews_per_month: "",
      calculated_host_listings_count: "1",
      availability_365: "365",
      number_of_reviews_ltm: "0",
      license: "",
      potential_revenue: 0,
      risk_score: 0,
    },
  ];

  describe("processListings", () => {
    it("should filter out invalid listings (price <= 0)", () => {
      const result = processListings(mockListings);
      expect(result).toHaveLength(2);
      expect(result.find((l) => l.id === "3")).toBeUndefined();
    });

    it("should process valid listings", () => {
      const result = processListings(mockListings);
      expect(result.every((l) => parseFloat(l.price) > 0)).toBe(true);
    });
  });

  describe("enhanceListings", () => {
    it("should calculate potential_revenue and risk_score", () => {
      const processed = processListings(mockListings);
      const result = enhanceListings(processed);

      expect(result[0].potential_revenue).toBe(100 * 200); // price * availability
      expect(result[0].risk_score).toBeGreaterThanOrEqual(0);
      expect(result[1].potential_revenue).toBe(50 * 100);
    });
  });

  describe("calculateRiskScore", () => {
    it("should calculate risk score for entire home", () => {
      const listing = mockListings[0];
      const score = calculateRiskScore(listing);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it("should calculate risk score for private room", () => {
      const listing = mockListings[1];
      const score = calculateRiskScore(listing);
      expect(score).toBeGreaterThan(0); // Should be higher than entire home
    });
  });
});
