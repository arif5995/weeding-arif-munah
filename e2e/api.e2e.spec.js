/**
 * E2E tests for the Sakeenah API
 *
 * These tests run against the actual Hono app (but with mocked database).
 * For full integration tests with a real database, see the integration test files.
 */

import { describe, it, expect, vi } from "vitest";
import app from "../src/server/index.js";

// Mock database for E2E tests
vi.mock("../src/server/db/client.js", () => {
  const mockInvitation = {
    uid: "e2e-test-wedding",
    title: "E2E Test Wedding",
    description: "Test invitation",
    groom_name: "Test Groom",
    bride_name: "Test Bride",
    parent_groom: "Parent Groom",
    parent_bride: "Parent Bride",
    wedding_date: "2025-12-25",
    time: "10:00",
    location: "Test Venue",
    address: "123 Test Street",
    maps_url: "https://maps.google.com",
    maps_embed: "<iframe></iframe>",
    og_image: "/og.jpg",
    favicon: "/favicon.ico",
    audio: "/music.mp3",
  };

  const mockWishes = [
    {
      id: 1,
      name: "Guest One",
      message: "Congratulations!",
      attendance: "ATTENDING",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Guest Two",
      message: "Best wishes!",
      attendance: "MAYBE",
      created_at: new Date().toISOString(),
    },
  ];

  // Track inserted wishes for duplicate detection
  let insertedWishes = [...mockWishes];
  let nextId = 3;

  const mockPool = {
    query: vi.fn(async (sql, params) => {
      // Invitation queries
      if (
        sql.includes("SELECT * FROM invitations") ||
        sql.includes("SELECT uid FROM invitations")
      ) {
        if (params[0] === "e2e-test-wedding") {
          return { rows: [mockInvitation] };
        }
        return { rows: [] };
      }

      // Agenda queries
      if (sql.includes("SELECT id, title, date, start_time")) {
        return {
          rows: [
            {
              id: 1,
              title: "Akad Nikah",
              date: "2025-12-25",
              start_time: "10:00",
              end_time: "11:00",
              location: "Mosque",
              address: "123 Street",
            },
          ],
        };
      }

      // Banks queries
      if (sql.includes("SELECT id, bank, account_number")) {
        return {
          rows: [
            {
              id: 1,
              bank: "BCA",
              account_number: "1234567890",
              account_name: "Test Groom",
            },
          ],
        };
      }

      // Wishes list query
      if (
        sql.includes("SELECT id") &&
        sql.includes("name") &&
        sql.includes("message") &&
        sql.includes("attendance") &&
        sql.includes("FROM wishes")
      ) {
        // Filter by invitation_uid if present in params
        let filteredWishes = insertedWishes;
        if (params && params.length > 0 && params[0] === "test-wedding") {
          // In real DB, all wishes would have invitation_uid, but in mock we just return all
          filteredWishes = insertedWishes;
        }
        return { rows: filteredWishes };
      }

      // Wishes count query
      if (
        sql.includes("SELECT COUNT(*)") &&
        !sql.includes("FILTER") &&
        sql.includes("FROM wishes")
      ) {
        return { rows: [{ count: String(insertedWishes.length) }] };
      }

      // Stats query
      if (sql.includes("FILTER") && sql.includes("FROM wishes")) {
        const attending = insertedWishes.filter(
          (w) => w.attendance === "ATTENDING",
        ).length;
        const notAttending = insertedWishes.filter(
          (w) => w.attendance === "NOT_ATTENDING",
        ).length;
        const maybe = insertedWishes.filter(
          (w) => w.attendance === "MAYBE",
        ).length;
        return {
          rows: [
            {
              attending: String(attending),
              not_attending: String(notAttending),
              maybe: String(maybe),
              total: String(insertedWishes.length),
            },
          ],
        };
      }

      // Check existing wish (by name and invitation_uid)
      if (
        sql.includes("SELECT id FROM wishes WHERE") &&
        sql.includes("name") &&
        sql.includes("invitation_uid")
      ) {
        const name = params[1]; // params[0] is invitation_uid, params[1] is name
        const existing = insertedWishes.find((w) => w.name === name);
        if (existing) {
          return { rows: [{ id: existing.id }] };
        }
        return { rows: [] };
      }

      // Insert wish
      if (sql.includes("INSERT INTO wishes")) {
        // params: [invitationUid, name, message, attendance]
        const newWish = {
          id: nextId++,
          name: params[1],
          message: params[2],
          attendance: params[3],
          created_at: new Date().toISOString(),
        };
        insertedWishes.push(newWish);
        return { rows: [newWish] };
      }

      // Delete wish
      if (sql.includes("DELETE FROM wishes")) {
        const id = Number(params[0]);
        const index = insertedWishes.findIndex((w) => w.id === id);
        if (index !== -1) {
          const deleted = insertedWishes.splice(index, 1)[0];
          return { rows: [{ id: deleted.id }] };
        }
        return { rows: [] };
      }

      return { rows: [] };
    }),
  };

  return {
    getDbClient: vi.fn().mockResolvedValue(mockPool),
  };
});

describe("E2E: Sakeenah API", () => {
  describe("Health Check Endpoints", () => {
    it("GET /api/health - should return health status", async () => {
      const res = await app.request("/api/health");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.service).toBe("wedding-api");
    });

    it("GET /api/health/db - should return database health", async () => {
      const res = await app.request("/api/health/db");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.database).toBe("connected");
    });
  });

  describe("Wedding/Invitation Endpoints", () => {
    it("GET /api/wedding/:uid - should return invitation data", async () => {
      const res = await app.request("/api/wedding/e2e-test-wedding");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.groomName).toBe("Test Groom");
      expect(json.data.brideName).toBe("Test Bride");
      expect(json.data.agenda).toHaveLength(1);
      expect(json.data.banks).toHaveLength(1);
    });

    it("GET /api/wedding/:uid - should return 404 for non-existent wedding", async () => {
      const res = await app.request("/api/wedding/non-existent");
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("NOT_FOUND");
    });

    it("GET /api/wedding/:uid - should validate UID format", async () => {
      const res = await app.request("/api/wedding/INVALID_FORMAT");
      expect(res.status).toBe(404); // Returns 404 for non-existent wedding
    });
  });

  describe("Wishes Endpoints", () => {
    it("GET /api/test-wedding/wishes - should return wishes with pagination", async () => {
      const res = await app.request("/api/test-wedding/wishes");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(2);
      expect(json.pagination.total).toBe(2);
    });

    it("GET /api/test-wedding/wishes - should respect limit parameter", async () => {
      const res = await app.request("/api/test-wedding/wishes?limit=1");
      expect(res.status).toBe(200);
    });

    it("POST /api/test-wedding/wishes - should create a new wish", async () => {
      const res = await app.request("/api/test-wedding/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Guest",
          message: "Happy wedding!",
          attendance: "ATTENDING",
        }),
      });

      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.name).toBe("New Guest");
    });

    it("POST /api/test-wedding/wishes - should reject duplicate wish", async () => {
      const res = await app.request("/api/test-wedding/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Guest One",
          message: "Another message",
          attendance: "ATTENDING",
        }),
      });

      const json = await res.json();

      expect(res.status).toBe(409);
      expect(json.error.code).toBe("DUPLICATE_WISH");
    });

    it("POST /api/test-wedding/wishes - should validate input", async () => {
      const res = await app.request("/api/test-wedding/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          message: "",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("DELETE /api/test-wedding/wishes/:id - should delete a wish", async () => {
      const res = await app.request("/api/test-wedding/wishes/1", {
        method: "DELETE",
      });

      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it("DELETE /api/test-wedding/wishes/:id - should return 404 for non-existent wish", async () => {
      const res = await app.request("/api/test-wedding/wishes/999", {
        method: "DELETE",
      });

      expect(res.status).toBe(404);
    });

    it("GET /api/test-wedding/wishes/check/:name - should check if wish submitted", async () => {
      const res = await app.request(
        "/api/test-wedding/wishes/check/Guest%20Two",
      );
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.hasSubmitted).toBe(true);
    });

    it("GET /api/test-wedding/wishes/stats - should return attendance statistics", async () => {
      const res = await app.request("/api/test-wedding/wishes/stats");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveProperty("attending");
      expect(json.data).toHaveProperty("not_attending");
      expect(json.data).toHaveProperty("maybe");
      expect(json.data).toHaveProperty("total");
    });
  });

  describe("Error Response Format", () => {
    it("should return consistent error format", async () => {
      const res = await app.request("/api/wedding/non-existent");
      const json = await res.json();

      expect(json.success).toBe(false);
      expect(json.error).toHaveProperty("code");
      expect(json.error).toHaveProperty("message");
    });
  });

  describe("404 for Unknown API", () => {
    it("should return 404 JSON for unknown API route", async () => {
      const res = await app.request("/api/unknown-route");
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toHaveProperty("code");
    });
  });
});
