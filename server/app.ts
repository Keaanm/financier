import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { db } from "./lib/db";
import { getCookie } from "hono/cookie";
import { lucia } from "./lib/auth";
import { authRoutes } from "./routes/auth";
import accounts from "./routes/accounts";
import categories from "./routes/categories";
import transactions from "./routes/transactions";
import summary from "./routes/summary";
import type { Session, User } from "lucia";
import { HTTPException } from "hono/http-exception";
import { csrf } from "hono/csrf";
import { rateLimiter } from "hono-rate-limiter";
import type { SocketAddress } from "bun";

declare module "hono" {
  interface ContextVariableMap {
    db: typeof db;
    user: User | null;
    session: Session | null;
  }
}

const app = new Hono();

app.use(logger());
app.use("*", csrf());

const maxMultiple = 1;

const generalRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 1000 * maxMultiple,
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => c.env?.ip?.address! as string,
});

app.use("*", generalRateLimit);
app.use("*", async (c, next) => {
  c.set("db", db);
  const sessionId = getCookie(c, lucia.sessionCookieName);

  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }

  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }

  c.set("user", user);
  c.set("session", session);
  return next();
});

const apiRoutes = app
  .basePath("/api")
  .route("/", authRoutes)
  .route("/summary", summary)
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions);

app.onError(async (err: Error, c) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    return err.getResponse();
  }
  //...
  return c.json({ error: err.message }, 500);
});

// app.get("*", serveStatic({ root: "./frontend/dist" }));
// app.get("*", serveStatic({ path: "./frontend/dist.index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;
