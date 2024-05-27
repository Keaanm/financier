import { Hono } from "hono";
import type { ContextVariables } from "../lib/types";
import { and, eq, inArray } from "drizzle-orm";
import { getUser } from "../lib/auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CategorySchema } from "../sharedTypes";
import { categories } from "../lib/db/schema";

const app = new Hono()
  .get("/", getUser, async (c) => {
    const data = await c.var.db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.userId, c.var.user.id));
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
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .where(
          and(eq(categories.userId, c.var.user.id), eq(categories.id, id))
        );

      if (!data) {
        return c.json({ error: "Category not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post("/", getUser, zValidator("json", CategorySchema), async (c) => {
    const values = c.req.valid("json");
    const [data] = await c.var.db
      .insert(categories)
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
        .delete(categories)
        .where(
          and(eq(categories.userId, c.var.user.id), inArray(categories.id, ids))
        )
        .returning({
          id: categories.id,
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
    zValidator("json", CategorySchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await c.var.db
        .update(categories)
        .set(values)
        .where(and(eq(categories.userId, c.var.user.id), eq(categories.id, id)))
        .returning();

      if (!data) {
        return c.json({ error: "Category not found" }, 404);
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
        .delete(categories)
        .where(and(eq(categories.userId, c.var.user.id), eq(categories.id, id)))
        .returning({
          id: categories.id,
        });

      if (!data) {
        return c.json({ error: "Category not found" }, 404);
      }
      return c.json({ data });
    }
  );

export default app;
