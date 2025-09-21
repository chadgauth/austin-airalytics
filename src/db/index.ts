import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

let databaseUrl: string;

// Use POSTGRES_URL if available (for Vercel/Supabase)
const postgresUrl = process.env.POSTGRES_URL;
if (postgresUrl) {
  databaseUrl = postgresUrl;
} else {
  // Fallback to constructing from individual Postgres vars
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST;
  const database = process.env.POSTGRES_DATABASE;
  if (user && password && host && database) {
    databaseUrl = `postgresql://${user}:${password}@${host}:5432/${database}`;
  } else {
    throw new Error("POSTGRES_URL or individual POSTGRES_* environment variables are required");
  }
}

const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });
