/**
 * Wedding Routes - API Routes for /api/wedding
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getInvitation } from "../services/wedding.service.js";

const weddingRoutes = new Hono();

// Validation schemas
const uidParamSchema = z.object({
  uid: z.string().min(1),
});

/**
 * GET /api/wedding/:uid
 * Get invitation by UID with all related data (agenda, banks)
 */
weddingRoutes.get(
  "/:uid",
  zValidator("param", uidParamSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const result = await getInvitation(uid);
    return c.json(result);
  },
);

export { weddingRoutes };