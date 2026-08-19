/**
 * Database connection helper
 * Uses pg Pool with connection pooling for serverless environments.
 */

import pg from "pg";

const { Pool } = pg;

// Module-scoped cache: connectionString -> pg.Pool
// Reused across requests within the same runtime instance.
const poolCache = new Map();

/**
 * Get database connection string from environment.
 * @returns {string} The connection string
 */
function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Configure it in Vercel Project Settings.",
    );
  }

  return connectionString;
}

/**
 * Get a database client (cached pool).
 * @returns {Promise<import('pg').Pool>} Database pool
 */
export async function getDbClient() {
  const connectionString = getConnectionString();

  // Reuse an existing pool for this connection string if we have one.
  const cached = poolCache.get(connectionString);
  if (cached) {
    return cached;
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  poolCache.set(connectionString, pool);

  return pool;
}
