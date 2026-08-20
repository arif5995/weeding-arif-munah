/**
 * Sakeenah API Server
 * Hono-based REST API for wedding invitations
 *
 * Features:
 * - Invitation: Fetch invitation data with agenda and bank accounts
 * - Wishes: Guest wishes/RSVP management
 */

import { Hono } from "hono";
import { logger } from "hono/logger";

// Feature routes
import { wishesRoutes } from "./routes/wishes.js";
import { weddingRoutes } from "./routes/wedding.js";
import { bankRoutes } from "./routes/bank.js";
import { agendaRoutes } from "./routes/agenda.js";
import { getDbClient } from "./db/client.js";

// Create single Hono app
const app = new Hono();

// ============ Middleware ============

app.use("*", logger());

// ============ Global Error Handler ============

import { AppError } from "./lib/errors.js";

app.onError((err, c) => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      },
      err.status,
    );
  }

  // Handle Zod validation errors from zValidator
  if (err.name === "ZodError") {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: err.errors,
        },
      },
      400,
    );
  }

  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
    },
    500,
  );
});

// ============ Not Found Handler ============

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    },
    404,
  );
});

// ============ Health Check Endpoints ============

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    service: "wedding-api",
  });
});

app.get("/api/health/db", async (c) => {
  try {
    const pool = await getDbClient();
    await pool.query("SELECT 1");
    return c.json({
      success: true,
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Database connection failed",
        },
      },
      503,
    );
  }
});

// ============ Mount Feature Routes ============

// Legacy wishes routes: /api/test-wedding/wishes (for backward compatibility)
app.route("/api/test-wedding", wishesRoutes);

// New dynamic wishes routes: /api/:uid/wishes
app.route("/api", wishesRoutes);

// Wedding routes at /api/wedding (legacy)
app.route("/api/wedding", weddingRoutes);

// Wedding routes at /api (new pattern: /api/:uid/invitations, /api/:uid/bank, /api/:uid/agenda)
app.route("/api", weddingRoutes);

// Bank routes: /api/:uid/bank
app.route("/api", bankRoutes);

// Agenda routes: /api/:uid/agenda
app.route("/api", agendaRoutes);

// ============ Export ============

export default app;
