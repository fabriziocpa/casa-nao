import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const poolMax = Number(process.env.DB_POOL_MAX ?? "3");

const createClient = () =>
  postgres(connectionString, {
    prepare: false,
    max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 3,
  });

declare global {
  // eslint-disable-next-line no-var
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

const client = globalThis.__dbClient ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__dbClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
