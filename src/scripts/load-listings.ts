import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../db';
import { listings } from '../db/schema';
import { sql } from 'drizzle-orm';

const results: any[] = [];

// Truncate the table to clear existing data
await db.execute(sql`TRUNCATE TABLE listings`);

fs.createReadStream('src/data/listings.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log('CSV parsed, processing data...');

    const dataToInsert = results.map((row) => ({
      id: parseInt(row.id) || 0,
      listing_url: row.listing_url || null,
      scrape_id: row.scrape_id ? parseInt(row.scrape_id) : null,
      last_scraped: row.last_scraped || null,
      source: row.source || null,
      name: row.name || null,
      description: row.description || null,
      neighborhood_overview: row.neighborhood_overview || null,
      picture_url: row.picture_url || null,
      host_id: row.host_id ? parseInt(row.host_id) : null,
      neighbourhood: row.neighbourhood || null,
      neighbourhood_cleansed: row.neighbourhood_cleansed || null,
      neighbourhood_group_cleansed: row.neighbourhood_group_cleansed || null,
      latitude: row.latitude || null,
      longitude: row.longitude || null,
      property_type: row.property_type || null,
      room_type: row.room_type || null,
      accommodates: row.accommodates ? parseInt(row.accommodates) : null,
      bathrooms: row.bathrooms || null,
      bathrooms_text: row.bathrooms_text || null,
      bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null,
      beds: row.beds ? parseInt(row.beds) : null,
      amenities: row.amenities || null,
      price: row.price || null,
      minimum_nights: row.minimum_nights ? parseInt(row.minimum_nights) : null,
      maximum_nights: row.maximum_nights ? parseInt(row.maximum_nights) : null,
      minimum_minimum_nights: row.minimum_minimum_nights ? parseInt(row.minimum_minimum_nights) : null,
      maximum_minimum_nights: row.maximum_minimum_nights ? parseInt(row.maximum_minimum_nights) : null,
      minimum_maximum_nights: row.minimum_maximum_nights ? parseInt(row.minimum_maximum_nights) : null,
      maximum_maximum_nights: row.maximum_maximum_nights ? parseInt(row.maximum_maximum_nights) : null,
      minimum_nights_avg_ntm: row.minimum_nights_avg_ntm || null,
      maximum_nights_avg_ntm: row.maximum_nights_avg_ntm || null,
      calendar_updated: row.calendar_updated || null,
      has_availability: row.has_availability === 't',
      availability_30: row.availability_30 ? parseInt(row.availability_30) : null,
      availability_60: row.availability_60 ? parseInt(row.availability_60) : null,
      availability_90: row.availability_90 ? parseInt(row.availability_90) : null,
      availability_365: row.availability_365 ? parseInt(row.availability_365) : null,
      calendar_last_scraped: row.calendar_last_scraped || null,
      number_of_reviews: row.number_of_reviews ? parseInt(row.number_of_reviews) : null,
      number_of_reviews_ltm: row.number_of_reviews_ltm ? parseInt(row.number_of_reviews_ltm) : null,
      number_of_reviews_l30d: row.number_of_reviews_l30d ? parseInt(row.number_of_reviews_l30d) : null,
      availability_eoy: row.availability_eoy ? parseInt(row.availability_eoy) : null,
      number_of_reviews_ly: row.number_of_reviews_ly ? parseInt(row.number_of_reviews_ly) : null,
      estimated_occupancy_l365d: row.estimated_occupancy_l365d || null,
      estimated_revenue_l365d: row.estimated_revenue_l365d || null,
      first_review: row.first_review || null,
      last_review: row.last_review || null,
      review_scores_rating: row.review_scores_rating || null,
      review_scores_accuracy: row.review_scores_accuracy || null,
      review_scores_cleanliness: row.review_scores_cleanliness || null,
      review_scores_checkin: row.review_scores_checkin || null,
      review_scores_communication: row.review_scores_communication || null,
      review_scores_location: row.review_scores_location || null,
      review_scores_value: row.review_scores_value || null,
      license: row.license || null,
      instant_bookable: row.instant_bookable === 't',
      calculated_host_listings_count: row.calculated_host_listings_count ? parseInt(row.calculated_host_listings_count) : null,
      calculated_host_listings_count_entire_homes: row.calculated_host_listings_count_entire_homes ? parseInt(row.calculated_host_listings_count_entire_homes) : null,
      calculated_host_listings_count_private_rooms: row.calculated_host_listings_count_private_rooms ? parseInt(row.calculated_host_listings_count_private_rooms) : null,
      calculated_host_listings_count_shared_rooms: row.calculated_host_listings_count_shared_rooms ? parseInt(row.calculated_host_listings_count_shared_rooms) : null,
      reviews_per_month: row.reviews_per_month || null,
    }));

    console.log(`Inserting ${dataToInsert.length} records...`);

    // Insert in batches of 500
    const batchSize = 500;
    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize);
      await db.insert(listings).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log('Data loaded successfully!');
    process.exit(0);
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
    process.exit(1);
  });