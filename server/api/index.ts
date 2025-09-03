import { OpenAPIHono } from "@hono/zod-openapi";
import mainRouter from "./main";
import authRouter from "./auth";

const apiRoutes = new OpenAPIHono();

// apiRoutes.route("/auth", authRouter);
apiRoutes.route("/items", mainRouter);

export default apiRoutes;
