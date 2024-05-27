import { Hono } from "hono";
import type { ContextVariables } from "../lib/types";
import { and, eq, inArray } from "drizzle-orm";
import { accounts, insertAccountSchema } from "../lib/db/schema";
import { getUser } from "../lib/auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AccountSchema } from "../sharedTypes";

const app = new Hono()
  .get("/", getUser, async (c) => {
    const data = await c.var.db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, c.var.user.id));
    return c.json({ data });
  })
  .get(
    "/:id{[a-z0-9]{20,30}}",
    getUser,
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await c.var.db
        .select({
          id: accounts.id,
          name: accounts.name,
        })
        .from(accounts)
        .where(and(eq(accounts.userId, c.var.user.id), eq(accounts.id, id)));

      if (!data) {
        return c.json({ error: "Account not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post("/", getUser, zValidator("json", AccountSchema), async (c) => {
    const values = c.req.valid("json");
    const [data] = await c.var.db
      .insert(accounts)
      .values({
        userId: c.var.user.id,
        ...values,
      })
      .returning();
    return c.json({ data });
  })
  .post(
    "/bulk-delete",
    getUser,
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const { ids } = c.req.valid("json");
      const data = await c.var.db
        .delete(accounts)
        .where(
          and(eq(accounts.userId, c.var.user.id), inArray(accounts.id, ids))
        )
        .returning({
          id: accounts.id,
        });
      return c.json({ data });
    }
  )
  .patch(
    "/:id{[a-z0-9]{20,30}}",
    getUser,
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator("json", AccountSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await c.var.db
        .update(accounts)
        .set(values)
        .where(and(eq(accounts.userId, c.var.user.id), eq(accounts.id, id)))
        .returning();

      if (!data) {
        return c.json({ error: "Account not found" }, 404);
      }
      return c.json({ data });
    }
  )
  .delete(
    "/:id{[a-z0-9]{20,30}}",
    getUser,
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await c.var.db
        .delete(accounts)
        .where(and(eq(accounts.userId, c.var.user.id), eq(accounts.id, id)))
        .returning({
          id: accounts.id,
        });

      if (!data) {
        return c.json({ error: "Account not found" }, 404);
      }
      return c.json({ data });
    }
  );

export default app;
