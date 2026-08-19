/**
 * Fetch all wishes for an invitation
 * @param {object} options - Query options (limit, offset)
 * @returns {Promise<object>} Response with wishes data
 */
export async function fetchWishes(options = {}) {
  const { limit = 50, offset = 0 } = options;

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const response = await fetch(
    `/api/test-wedding/wishes?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.error?.message || "Failed to fetch wishes"
    );
  }

  return response.json();
}

/**
 * Create a new wish
 * @param {object} wishData - Wish data (name, message, attendance)
 * @returns {Promise<object>} Response with created wish
 */
export async function createWish(wishData) {
  const response = await fetch("/api/test-wedding/wishes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(wishData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Preserve error code for duplicate wish detection
    const error = new Error(data.error?.message || "Failed to create wish");
    error.code = data.error?.code;
    throw error;
  }
  return data;
}

/**
 * Check if guest has already submitted a wish
 * @param {string} name - Guest name
 * @returns {Promise<object>} Response with hasSubmitted boolean
 */
export async function checkWishSubmitted(name) {
  const response = await fetch(
    `/api/test-wedding/wishes/check/${encodeURIComponent(name)}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to check wish status");
  }
  return response.json();
}

/**
 * Delete a wish (admin function)
 * @param {number} wishId - Wish ID to delete
 * @returns {Promise<object>} Response with deletion confirmation
 */
export async function deleteWish(wishId) {
  const response = await fetch(`/api/test-wedding/wishes/${wishId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to delete wish");
  }
  return response.json();
}

/**
 * Get attendance statistics
 * @returns {Promise<object>} Response with stats data
 */
export async function fetchAttendanceStats() {
  const response = await fetch("/api/test-wedding/wishes/stats");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch stats");
  }
  return response.json();
}

/**
 * Get invitation details
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with invitation data
 */
export async function fetchInvitation(uid) {
  const response = await fetch(`/api/wedding/${uid}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch invitation");
  }
  return response.json();
}
