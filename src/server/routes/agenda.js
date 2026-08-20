/**
 * Agenda Routes - API Routes for /api/:uid/agenda
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getAgenda } from "../services/wedding.service.js";

const agendaRoutes = new Hono();

// Validation schemas
const uidParamSchema = z.object({
  uid: z.string().min(1),
});

/**
 * GET /api/:uid/agenda
 * Get agenda items for an invitation
 */
agendaRoutes.get("/", zValidator("param", uidParamSchema), async (c) => {
  const { uid } = c.req.valid("param");
  const result = await getAgenda(uid);
  return c.json(result);
});

export { agendaRoutes };
