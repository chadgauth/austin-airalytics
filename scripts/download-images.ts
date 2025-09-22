console.log("Starting script");

import sharp from "sharp";
import fs from "node:fs";

const envPath = ".env.production";
console.log("Loading env from", envPath);
if (fs.existsSync(envPath)) {
  console.log("File exists");
  const envContent = fs.readFileSync(envPath, "utf-8");
  console.log("Content:", envContent);
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} else {
  console.log("File does not exist");
}

import { eq } from "drizzle-orm";
import path from "node:path";

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download ${url}: ${response.status}`);
      return null;
    }
    const buffer = await response.arrayBuffer();
    console.log(`Downloaded ${url}`);
    return Buffer.from(buffer);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return null;
  }
}

async function optimizeImage(
  buffer: Buffer,
  filepath: string,
  width: number,
  height: number,
  quality: number,
) {
  try {
    await sharp(buffer)
      .resize(width, height, { fit: "cover" })
      .webp({ quality })
      .toFile(filepath);
    console.log(`Optimized ${filepath}`);
  } catch (error) {
    console.error(`Error optimizing ${filepath}:`, error);
  }
}

async function main() {
  console.log("POSTGRES_URL:", process.env.POSTGRES_URL);
  console.log("Getting featured listing IDs...");

  // Dynamic import after env is loaded
  const { getFeaturedListingIds } = await import(
    "../src/lib/featured-listings.js"
  );
  const { db } = await import("../src/db/index.js");
  const { listings: listingsTable } = await import("../src/db/schema.js");

  const featuredIds = await getFeaturedListingIds();

  console.log(`Found ${featuredIds.length} featured listings`);

  // Ensure directory exists
  const imagesDir = path.join("public", "images", "listings");
  fs.mkdirSync(imagesDir, { recursive: true });

  for (const id of featuredIds) {
    const listing = await db
      .select({ picture_url: listingsTable.picture_url })
      .from(listingsTable)
      .where(eq(listingsTable.id, parseInt(id, 10)))
      .limit(1);

    if (listing.length === 0 || !listing[0].picture_url) {
      console.log(`No picture URL for listing ${id}`);
      continue;
    }

    const url = listing[0].picture_url;
    const ext = ".webp"; // always save as webp for optimized

    // Check if optimized images already exist
    const filepathDetail = path.join(imagesDir, `${id}_824x463${ext}`);
    const filepathCard = path.join(imagesDir, `${id}_388x388${ext}`);

    if (fs.existsSync(filepathDetail) && fs.existsSync(filepathCard)) {
      console.log(`Optimized images already exist for ${id}`);
      continue;
    }

    const buffer = await downloadImage(url);
    if (!buffer) continue;

    // Generate detail version (higher quality)
    await optimizeImage(buffer, filepathDetail, 824, 463, 90);

    // Generate card version (balanced quality/size)
    await optimizeImage(buffer, filepathCard, 388, 388, 80);
  }

  console.log("Image download complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
