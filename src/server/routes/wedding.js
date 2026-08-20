/**
 * Wedding Routes - API Routes for /api/wedding and /api/:uid/invitations
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getInvitation,
  getBanks,
  getAgenda,
} from "../services/wedding.service.js";

const weddingRoutes = new Hono();

// Validation schemas
const uidParamSchema = z.object({
  uid: z.string().min(1),
});

/**
 * GET /api/wedding/:uid
 * Get invitation by UID with all related data (agenda, banks)
 * Legacy endpoint
 */
weddingRoutes.get("/:uid", zValidator("param", uidParamSchema), async (c) => {
  const { uid } = c.req.valid("param");
  const result = await getInvitation(uid);
  return c.json(result);
});

/**
 * GET /api/:uid/invitations
 * Get invitation by UID with all related data (agenda, banks)
 * New endpoint pattern
 */
weddingRoutes.get(
  "/:uid/invitations",
  zValidator("param", uidParamSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const result = await getInvitation(uid);
    return c.json(result);
  },
);

/**
 * GET /api/:uid/bank
 * Get bank accounts for an invitation
 */
weddingRoutes.get(
  "/:uid/bank",
  zValidator("param", uidParamSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const result = await getBanks(uid);
    return c.json(result);
  },
);

/**
 * GET /api/:uid/agenda
 * Get agenda items for an invitation
 */
weddingRoutes.get(
  "/:uid/agenda",
  zValidator("param", uidParamSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const result = await getAgenda(uid);
    return c.json(result);
  },
);

export { weddingRoutes };
