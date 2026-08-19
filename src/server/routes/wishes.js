/**
 * Wishes Routes - API Routes for /api/test-wedding/wishes
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getWishes,
  createWish,
  deleteWish,
  checkWish,
  getWishStats,
} from "../services/wishes.service.js";

const wishesRoutes = new Hono();

// Validation schemas
const wishesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const createWishSchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  attendance: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]),
});

const nameParamSchema = z.object({
  name: z.string().min(1).max(100),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * GET /api/test-wedding/wishes
 * Get all wishes with pagination
 */
wishesRoutes.get(
  "/wishes",
  zValidator("query", wishesQuerySchema),
  async (c) => {
    const { limit, offset } = c.req.valid("query");
    const result = await getWishes({ limit, offset });
    return c.json(result);
  },
);

/**
 * POST /api/test-wedding/wishes
 * Create a new wish
 */
wishesRoutes.post(
  "/wishes",
  zValidator("json", createWishSchema),
  async (c) => {
    const { name, message, attendance } = c.req.valid("json");
    const result = await createWish({ name, message, attendance });
    return c.json(result, 201);
  },
);

/**
 * DELETE /api/test-wedding/wishes/:id
 * Delete a wish
 */
wishesRoutes.delete(
  "/wishes/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await deleteWish(id);
    return c.json(result);
  },
);

/**
 * GET /api/test-wedding/wishes/check/:name
 * Check if guest has already submitted a wish
 */
wishesRoutes.get(
  "/wishes/check/:name",
  zValidator("param", nameParamSchema),
  async (c) => {
    const { name } = c.req.valid("param");
    const result = await checkWish(name);
    return c.json(result);
  },
);

/**
 * GET /api/test-wedding/wishes/stats
 * Get attendance statistics
 */
wishesRoutes.get("/wishes/stats", async (c) => {
  const result = await getWishStats();
  return c.json(result);
});

export { wishesRoutes };
