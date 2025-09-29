import { sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { calendar, listings } from "./schema";

// Portfolio KPIs view
export const portfolioKPIs = pgView("portfolio_kpis").as((qb) =>
  qb
    .select({
      totalListings: sql<number>`count(${listings.id})`.as("total_listings"),
      avgADR: sql<number>`avg(${listings.estimated_revenue_l365d} / nullif(${listings.estimated_occupancy_l365d}, 0) * 365)`.as("avg_adr"),
      avgOccupancy: sql<number>`avg(${listings.estimated_occupancy_l365d})`.as("avg_occupancy"),
      avgRevPAR: sql<number>`avg(${listings.estimated_revenue_l365d} / 365)`.as("avg_revpar"),
      totalMonthlyRevenue: sql<number>`sum(${listings.estimated_revenue_l365d} / 12)`.as("total_monthly_revenue"),
    })
    .from(listings)
);

// Amenity impact view - simplified version using existing data
export const amenityImpact = pgView("amenity_impact").as((qb) =>
  qb
    .select({
      amenity: sql<string>`unnest(string_to_array(${listings.amenities}, ','))`.as("amenity"),
      avgPriceWith: sql<number>`avg(${listings.price}) filter (where ${listings.amenities} like '%' || unnest(string_to_array(${listings.amenities}, ',')) || '%')`.as("avg_price_with"),
      avgPriceWithout: sql<number>`avg(${listings.price}) filter (where ${listings.amenities} not like '%' || unnest(string_to_array(${listings.amenities}, ',')) || '%')`.as("avg_price_without"),
      countWith: sql<number>`count(*) filter (where ${listings.amenities} like '%' || unnest(string_to_array(${listings.amenities}, ',')) || '%')`.as("count_with"),
      countWithout: sql<number>`count(*) filter (where ${listings.amenities} not like '%' || unnest(string_to_array(${listings.amenities}, ',')) || '%')`.as("count_without"),
    })
    .from(listings)
    .groupBy(sql`unnest(string_to_array(${listings.amenities}, ','))`)
    .having(sql`count(*) > 10`)
);

// Neighborhood analysis view
export const neighborhoodAnalysis = pgView("neighborhood_analysis").as((qb) =>
  qb
    .select({
      neighbourhood: listings.neighbourhood_cleansed,
      avgPrice: sql<number>`avg(${listings.price})`.as("avg_price"),
      avgOccupancy: sql<number>`avg(${listings.estimated_occupancy_l365d})`.as("avg_occupancy"),
      avgRevPAR: sql<number>`avg(${listings.estimated_revenue_l365d} / 365)`.as("avg_revpar"),
      totalListings: sql<number>`count(*)`.as("total_listings"),
    })
    .from(listings)
    .groupBy(listings.neighbourhood_cleansed)
    .having(sql`count(*) > 5`)
);

// Bedroom configuration analysis
export const bedroomConfigAnalysis = pgView("bedroom_config_analysis").as((qb) =>
  qb
    .select({
      bedrooms: listings.bedrooms,
      bathrooms: listings.bathrooms,
      avgPrice: sql<number>`avg(${listings.price})`.as("avg_price"),
      avgOccupancy: sql<number>`avg(${listings.estimated_occupancy_l365d})`.as("avg_occupancy"),
      avgRevPAR: sql<number>`avg(${listings.estimated_revenue_l365d} / 365)`.as("avg_revpar"),
      totalListings: sql<number>`count(*)`.as("total_listings"),
      avgAccommodates: sql<number>`avg(${listings.accommodates})`.as("avg_accommodates"),
    })
    .from(listings)
    .groupBy(listings.bedrooms, listings.bathrooms)
    .having(sql`count(*) > 3`)
);