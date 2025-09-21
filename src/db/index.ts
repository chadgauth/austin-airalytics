import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let databaseUrl: string;

if (supabaseUrl && supabaseServiceRoleKey) {
  // Construct postgres URL from Supabase vars
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
  databaseUrl = `postgresql://postgres:${supabaseServiceRoleKey}@db.${projectRef}.supabase.co:5432/postgres`;
} else {
  // Fallback to direct DATABASE_URL for local dev
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY environment variables are required",
    );
  }
  databaseUrl = dbUrl;
}

const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });
