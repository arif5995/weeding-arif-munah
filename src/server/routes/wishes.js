/**
 * Wishes Routes - API Routes for /api/test-wedding/wishes (legacy) and /api/:uid/wishes (new)
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

const uidParamSchema = z.object({
  uid: z.string().min(1),
});

// Hardcoded invitation UID for legacy endpoint
const LEGACY_INVITATION_UID = "test-wedding";

// ============ Legacy Routes (mounted at /api/test-wedding) ============

/**
 * GET /api/test-wedding/wishes
 * Get all wishes with pagination (legacy)
 */
wishesRoutes.get(
  "/wishes",
  zValidator("query", wishesQuerySchema),
  async (c) => {
    const { limit, offset } = c.req.valid("query");
    const result = await getWishes({
      invitationUid: LEGACY_INVITATION_UID,
      limit,
      offset,
    });
    return c.json(result);
  },
);

/**
 * POST /api/test-wedding/wishes
 * Create a new wish (legacy)
 */
wishesRoutes.post(
  "/wishes",
  zValidator("json", createWishSchema),
  async (c) => {
    const { name, message, attendance } = c.req.valid("json");
    const result = await createWish({
      invitationUid: LEGACY_INVITATION_UID,
      name,
      message,
      attendance,
    });
    return c.json(result, 201);
  },
);

/**
 * DELETE /api/test-wedding/wishes/:id
 * Delete a wish (legacy)
 */
wishesRoutes.delete(
  "/wishes/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await deleteWish(id, LEGACY_INVITATION_UID);
    return c.json(result);
  },
);

/**
 * GET /api/test-wedding/wishes/check/:name
 * Check if guest has already submitted a wish (legacy)
 */
wishesRoutes.get(
  "/wishes/check/:name",
  zValidator("param", nameParamSchema),
  async (c) => {
    const { name } = c.req.valid("param");
    const result = await checkWish(LEGACY_INVITATION_UID, name);
    return c.json(result);
  },
);

/**
 * GET /api/test-wedding/wishes/stats
 * Get attendance statistics (legacy)
 */
wishesRoutes.get("/wishes/stats", async (c) => {
  const result = await getWishStats(LEGACY_INVITATION_UID);
  return c.json(result);
});

// ============ New Dynamic Routes (mounted at /api) ============

/**
 * GET /api/:uid/wishes
 * Get all wishes with pagination
 */
wishesRoutes.get(
  "/:uid/wishes",
  zValidator("param", uidParamSchema),
  zValidator("query", wishesQuerySchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const { limit, offset } = c.req.valid("query");
    const result = await getWishes({ invitationUid: uid, limit, offset });
    return c.json(result);
  },
);

/**
 * POST /api/:uid/wishes
 * Create a new wish
 */
wishesRoutes.post(
  "/:uid/wishes",
  zValidator("param", uidParamSchema),
  zValidator("json", createWishSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const { name, message, attendance } = c.req.valid("json");
    const result = await createWish({
      invitationUid: uid,
      name,
      message,
      attendance,
    });
    return c.json(result, 201);
  },
);

/**
 * DELETE /api/:uid/wishes/:id
 * Delete a wish
 */
wishesRoutes.delete(
  "/:uid/wishes/:id",
  zValidator("param", uidParamSchema),
  zValidator("param", idParamSchema),
  async (c) => {
    const { uid, id } = c.req.valid("param");
    const result = await deleteWish(id, uid);
    return c.json(result);
  },
);

/**
 * GET /api/:uid/wishes/check/:name
 * Check if guest has already submitted a wish
 */
wishesRoutes.get(
  "/:uid/wishes/check/:name",
  zValidator("param", uidParamSchema),
  zValidator("param", nameParamSchema),
  async (c) => {
    const { uid, name } = c.req.valid("param");
    const result = await checkWish(uid, name);
    return c.json(result);
  },
);

/**
 * GET /api/:uid/wishes/stats
 * Get attendance statistics
 */
wishesRoutes.get(
  "/:uid/wishes/stats",
  zValidator("param", uidParamSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const result = await getWishStats(uid);
    return c.json(result);
  },
);

export { wishesRoutes };
