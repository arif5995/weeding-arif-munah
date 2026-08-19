/**
 * Wedding Service - Business Logic for Wedding/Invitation
 */

import { getDbClient } from "../db/client.js";
import { NotFoundError } from "../lib/errors.js";

/**
 * Get invitation by UID with all related data (agenda, banks)
 * @param {string} uid - Invitation UID
 * @returns {Promise<Object>} Response with invitation data
 */
export async function getInvitation(uid) {
  const pool = await getDbClient();

  // Get invitation details
  const invitationResult = await pool.query(
    "SELECT * FROM invitations WHERE uid = $1",
    [uid],
  );

  if (invitationResult.rows.length === 0) {
    throw new NotFoundError("Invitation not found");
  }

  const invitation = invitationResult.rows[0];

  // Get agenda items
  const agendaResult = await pool.query(
    "SELECT id, title, date, start_time, end_time, location, address FROM agenda WHERE invitation_uid = $1 ORDER BY order_index, date",
    [uid],
  );

  // Get bank accounts
  const banksResult = await pool.query(
    "SELECT id, bank, account_number, account_name FROM banks WHERE invitation_uid = $1 ORDER BY order_index",
    [uid],
  );

  // Format the response to match frontend config structure
  const data = {
    title: invitation.title,
    description: invitation.description,
    groomName: invitation.groom_name,
    brideName: invitation.bride_name,
    parentGroom: invitation.parent_groom,
    parentBride: invitation.parent_bride,
    date: invitation.wedding_date,
    time: invitation.time,
    location: invitation.location,
    address: invitation.address,
    maps_url: invitation.maps_url,
    maps_embed: invitation.maps_embed,
    ogImage: invitation.og_image,
    favicon: invitation.favicon,
    audio: invitation.audio,
    agenda: agendaResult.rows.map((a) => ({
      title: a.title,
      date: a.date,
      startTime: a.start_time,
      endTime: a.end_time,
      location: a.location,
      address: a.address,
    })),
    banks: banksResult.rows.map((b) => ({
      bank: b.bank,
      accountNumber: b.account_number,
      accountName: b.account_name,
    })),
  };

  return { success: true, data };
}
