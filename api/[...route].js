import app from "../src/server/index.js";

export default async function handler(req, res) {
  // Pass process.env as the Hono env bindings so getDbClient can read DATABASE_URL
  return app.fetch(req, process.env);
}
