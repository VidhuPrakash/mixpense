import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import apiRoutes from "./api";
import { logger } from "hono/logger";
import { auth } from "../lib/auth-server";

const app = new OpenAPIHono();

app.use(
  "*",
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL as string,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.on(["GET", "POST", "OPTIONS"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
app.use("*", logger());
app.route("/api", apiRoutes);
app.use("*", async (c, next) => {
  console.log(`Incoming request: ${c.req.method} ${c.req.path}`);
  await next();
});
export default app;
