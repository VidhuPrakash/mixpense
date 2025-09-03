import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "../../../lib/auth-server";

const authRouter = new OpenAPIHono();

authRouter.on(["GET", "POST", "PUT", "DELETE"], "/**", (c) => {
  return auth.handler(c.req.raw);
});
export default authRouter;
