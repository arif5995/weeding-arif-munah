/**
 * Bank Routes - API Routes for /api/:uid/bank
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getBanks } from "../services/wedding.service.js";

const bankRoutes = new Hono();

// Validation schemas
const uidParamSchema = z.object({
  uid: z.string().min(1),
});

/**
 * GET /api/:uid/bank
 * Get bank accounts for an invitation
 */
bankRoutes.get("/", zValidator("param", uidParamSchema), async (c) => {
  const { uid } = c.req.valid("param");
  const result = await getBanks(uid);
  return c.json(result);
});

export { bankRoutes };