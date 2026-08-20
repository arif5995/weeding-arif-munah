/**
 * Wishes Service - Business Logic for Wishes
 */

import { getDbClient } from "../db/client.js";
import { NotFoundError, ConflictError } from "../lib/errors.js";

/**
 * Get all wishes with pagination
 * @param {Object} params - Query parameters
 * @param {string} params.invitationUid - Invitation UID
 * @param {number} params.limit - Maximum number of wishes to return (1-100)
 * @param {number} params.offset - Number of wishes to skip
 * @returns {Promise<Object>} Response with wishes data and pagination
 */
export async function getWishes({ invitationUid, limit, offset }) {
  const pool = await getDbClient();

  // Get wishes
  const result = await pool.query(
    `SELECT id, invitation_uid, name, message, attendance,
              created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as created_at
         FROM wishes
        WHERE invitation_uid = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
    [invitationUid, limit, offset],
  );

  // Get total count
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM wishes WHERE invitation_uid = $1",
    [invitationUid],
  );

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
 * @param {string} params.invitationUid - Invitation UID
 * @param {string} params.name - Guest name
 * @param {string} params.message - Wish message
 * @param {string} params.attendance - Attendance status
 * @returns {Promise<Object>} Response with created wish
 */
export async function createWish({ invitationUid, name, message, attendance }) {
  const pool = await getDbClient();

  // Check if guest has already submitted a wish for this invitation
  const existingWish = await pool.query(
    "SELECT id FROM wishes WHERE invitation_uid = $1 AND LOWER(name) = LOWER($2)",
    [invitationUid, name],
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
      `INSERT INTO wishes (invitation_uid, name, message, attendance, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')
         RETURNING id, invitation_uid, name, message, attendance,
                   created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as created_at`,
      [invitationUid, name, message, attendance],
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
 * @param {string} invitationUid - Invitation UID (for security)
 * @returns {Promise<Object>} Response with deletion confirmation
 */
export async function deleteWish(id, invitationUid) {
  const pool = await getDbClient();
  const result = await pool.query(
    "DELETE FROM wishes WHERE id = $1 AND invitation_uid = $2 RETURNING id",
    [id, invitationUid],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Wish not found");
  }

  return { success: true, message: "Wish deleted" };
}

/**
 * Check if guest has already submitted a wish
 * @param {string} invitationUid - Invitation UID
 * @param {string} name - Guest name
 * @returns {Promise<Object>} Response with hasSubmitted boolean
 */
export async function checkWish(invitationUid, name) {
  if (!name || name.trim().length === 0) {
    return { success: false, error: "Name is required" };
  }

  const pool = await getDbClient();
  const existingWish = await pool.query(
    "SELECT id FROM wishes WHERE invitation_uid = $1 AND LOWER(name) = LOWER($2)",
    [invitationUid, name.trim()],
  );

  return {
    success: true,
    hasSubmitted: existingWish.rows.length > 0,
  };
}

/**
 * Get attendance statistics
 * @param {string} invitationUid - Invitation UID
 * @returns {Promise<Object>} Response with stats data
 */
export async function getWishStats(invitationUid) {
  const pool = await getDbClient();
  const result = await pool.query(
    `SELECT
        COUNT(*) FILTER (WHERE attendance = 'ATTENDING') as attending,
        COUNT(*) FILTER (WHERE attendance = 'NOT_ATTENDING') as not_attending,
        COUNT(*) FILTER (WHERE attendance = 'MAYBE') as maybe,
        COUNT(*) as total
     FROM wishes
     WHERE invitation_uid = $1`,
    [invitationUid],
  );

  return { success: true, data: result.rows[0] };
}