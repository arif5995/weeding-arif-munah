import { getRequestListener } from "@hono/node-server";
import app from "../src/server/index.js";

// getRequestListener properly converts Node.js IncomingMessage to Web Fetch Request
// and passes process.env as Hono's c.env so getDbClient can read DATABASE_URL
export default getRequestListener((req) => app.fetch(req, process.env));
