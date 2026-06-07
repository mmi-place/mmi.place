import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

let db: PostgresJsDatabase<typeof schema> | null = null;

export const getDatabase = () => {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to use the Drizzle client.");
  }

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  db = drizzle(client, { schema });
  return db;
};
