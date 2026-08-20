/**
 * Wishes Service - Business Logic for Wishes
 */

import { getDbClient } from "../db/client.js";
import { NotFoundError, ConflictError } from "../lib/errors.js";

/**
 * Get all wishes with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Maximum number of wishes to return (1-100)
 * @param {number} params.offset - Number of wishes to skip
 * @returns {Promise<Object>} Response with wishes data and pagination
 */
export async function getWishes({ limit, offset }) {
  const pool = await getDbClient();

  // Get wishes
  const result = await pool.query(
    `SELECT id, guest_name, message, attendance,
              created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as created_at
       FROM wishes
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  // Get total count
  const countResult = await pool.query("SELECT COUNT(*) FROM wishes");

  return {
    success: true,
    data: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    },
  };
}

/**
 * Create a new wish
 * @param {Object} params - Wish data
 * @param {string} params.name - Guest name
 * @param {string} params.message - Wish message
 * @param {string} params.attendance - Attendance status
 * @returns {Promise<Object>} Response with created wish
 */
export async function createWish({ name, message, attendance }) {
  const pool = await getDbClient();

  // Check if guest has already submitted a wish
  const existingWish = await pool.query(
    "SELECT id FROM wishes WHERE guest_name = $1",
    [name],
  );

  if (existingWish.rows.length > 0) {
    throw new ConflictError(
      "You have already submitted a wish. Each guest can only send one wish.",
      "DUPLICATE_WISH",
    );
  }

  // Insert wish
  try {
    const result = await pool.query(
      `INSERT INTO wishes (guest_name, message, attendance, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')
         RETURNING id, name, message, attendance,
                   created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as created_at`,
      [name, message, attendance],
    );

    return { success: true, data: result.rows[0] };
  } catch (error) {
    // Handle database unique constraint violation
    if (error.code === "23505") {
      throw new ConflictError(
        "You have already submitted a wish. Each guest can only send one wish.",
        "DUPLICATE_WISH",
      );
    }
    throw error;
  }
}

/**
 * Delete a wish
 * @param {number} id - Wish ID
 * @returns {Promise<Object>} Response with deletion confirmation
 */
export async function deleteWish(id) {
  const pool = await getDbClient();
  const result = await pool.query(
    "DELETE FROM wishes WHERE id = $1 RETURNING id",
    [id],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Wish not found");
  }

  return { success: true, message: "Wish deleted" };
}

/**
 * Check if guest has already submitted a wish
 * @param {string} name - Guest name
 * @returns {Promise<Object>} Response with hasSubmitted boolean
 */
export async function checkWish(name) {
  if (!name || name.trim().length === 0) {
    return { success: false, error: "Name is required" };
  }

  const pool = await getDbClient();
  const existingWish = await pool.query(
    "SELECT id FROM wishes WHERE guest_name = $1",
    [name.trim()],
  );

  return {
    success: true,
    hasSubmitted: existingWish.rows.length > 0,
  };
}

/**
 * Get attendance statistics
 * @returns {Promise<Object>} Response with stats data
 */
export async function getWishStats() {
  const pool = await getDbClient();
  const result = await pool.query(
    `SELECT
        COUNT(*) FILTER (WHERE attendance = 'ATTENDING') as attending,
        COUNT(*) FILTER (WHERE attendance = 'NOT_ATTENDING') as not_attending,
        COUNT(*) FILTER (WHERE attendance = 'MAYBE') as maybe,
        COUNT(*) as total
     FROM wishes`,
  );

  return { success: true, data: result.rows[0] };
}
