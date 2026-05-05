import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import apiRoutes from "./api";
import { logger } from "hono/logger";
import { auth } from "../lib/auth-server";

const app = new OpenAPIHono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL as string,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.on(["GET", "POST", "OPTIONS"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
app.route("/api", apiRoutes);
export default app;
