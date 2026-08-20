/**
 * Fetch all wishes for an invitation
 * @param {object} options - Query options (limit, offset)
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with wishes data
 */
export async function fetchWishes(uid, options = {}) {
  const { limit = 50, offset = 0 } = options;

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const response = await fetch(`/api/${uid}/wishes?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error?.message || "Failed to fetch wishes");
  }

  return response.json();
}

/**
 * Create a new wish
 * @param {string} uid - Invitation UID
 * @param {object} wishData - Wish data (name, message, attendance)
 * @returns {Promise<object>} Response with created wish
 */
export async function createWish(uid, wishData) {
  const response = await fetch(`/api/${uid}/wishes`, {
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
 * @param {string} uid - Invitation UID
 * @param {string} name - Guest name
 * @returns {Promise<object>} Response with hasSubmitted boolean
 */
export async function checkWishSubmitted(uid, name) {
  const response = await fetch(
    `/api/${uid}/wishes/check/${encodeURIComponent(name)}`,
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to check wish status");
  }
  return response.json();
}

/**
 * Delete a wish (admin function)
 * @param {string} uid - Invitation UID
 * @param {number} wishId - Wish ID to delete
 * @returns {Promise<object>} Response with deletion confirmation
 */
export async function deleteWish(uid, wishId) {
  const response = await fetch(`/api/${uid}/wishes/${wishId}`, {
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
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with stats data
 */
export async function fetchAttendanceStats(uid) {
  const response = await fetch(`/api/${uid}/wishes/stats`);
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
  const response = await fetch(`/api/${uid}/invitations`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch invitation");
  }
  return response.json();
}

/**
 * Get bank accounts for an invitation
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with bank data
 */
export async function fetchBanks(uid) {
  const response = await fetch(`/api/${uid}/bank`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch bank accounts");
  }
  return response.json();
}

/**
 * Get agenda items for an invitation
 * @param {string} uid - Invitation UID
 * @returns {Promise<object>} Response with agenda data
 */
export async function fetchAgenda(uid) {
  const response = await fetch(`/api/${uid}/agenda`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch agenda");
  }
  return response.json();
}