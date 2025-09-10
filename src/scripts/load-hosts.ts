import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../db';
import { hosts } from '../db/schema';
import { sql } from 'drizzle-orm';

const results: any[] = [];

// Truncate the table to clear existing data
await db.execute(sql`TRUNCATE TABLE hosts`);

fs.createReadStream('src/data/listings.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log('CSV parsed, extracting unique hosts...');

    // Extract unique hosts
    const hostMap = new Map();
    results.forEach((row) => {
      const hostId = parseInt(row.host_id);
      if (hostId && !hostMap.has(hostId)) {
        hostMap.set(hostId, {
          id: hostId,
          url: row.host_url || null,
          name: row.host_name || null,
          since: row.host_since || null,
          location: row.host_location || null,
          about: row.host_about || null,
          response_time: row.host_response_time || null,
          response_rate: row.host_response_rate || null,
          acceptance_rate: row.host_acceptance_rate || null,
          is_superhost: row.host_is_superhost === 't',
          thumbnail_url: row.host_thumbnail_url || null,
          picture_url: row.host_picture_url || null,
          neighbourhood: row.host_neighbourhood || null,
          listings_count: row.host_listings_count ? parseInt(row.host_listings_count) : null,
          total_listings_count: row.host_total_listings_count ? parseInt(row.host_total_listings_count) : null,
          verifications: row.host_verifications || null,
          has_profile_pic: row.host_has_profile_pic === 't',
          identity_verified: row.host_identity_verified === 't',
        });
      }
    });

    const dataToInsert = Array.from(hostMap.values());

    console.log(`Inserting ${dataToInsert.length} unique hosts...`);

    // Insert in batches of 500
    const batchSize = 500;
    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize);
      await db.insert(hosts).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log('Hosts loaded successfully!');
    process.exit(0);
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
    process.exit(1);
  });