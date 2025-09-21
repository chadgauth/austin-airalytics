import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables
if (process.env.NODE_ENV === "production") {
  config({ path: ".env.production" });
} else {
  config({ path: ".env.local" });
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/rental_insight",
  },
});
