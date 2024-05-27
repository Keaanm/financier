import { Hono } from "hono";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { getUser } from "../lib/auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { TransactionSchema } from "../sharedTypes";
import { accounts, categories, transactions } from "../lib/db/schema";
import { parse, subDays } from "date-fns";

const app = new Hono()
  .get(
    "/",
    getUser,
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const { from, to, accountId } = c.req.valid("query");

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;

      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const data = await c.var.db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          account: accounts.name,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, c.var.user.id),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));

      return c.json({ data });
    }
  )
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
          id: transactions.id,
          date: transactions.date,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(eq(transactions.id, id), eq(accounts.userId, c.var.user.id))
        );

      if (!data) {
        return c.json({ error: "Transaction not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post("/", getUser, zValidator("json", TransactionSchema), async (c) => {
    const values = c.req.valid("json");

    const [data] = await c.var.db
      .insert(transactions)
      .values({
        ...values,
      })
      .returning();

    return c.json({ data });
  })
  .post(
    "/bulk-create",
    getUser,
    zValidator("json", z.array(TransactionSchema)),
    async (c) => {
      const values = c.req.valid("json");

      const data = await c.var.db
        .insert(transactions)
        .values(values)
        .returning();

      return c.json({ data });
    }
  )
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

      const transactionsToDelete = c.var.db.$with("transactions_to_delete").as(
        c.var.db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, ids),
              eq(accounts.userId, c.var.user.id)
            )
          )
      );

      const data = await c.var.db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning({
          id: transactions.id,
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
    zValidator("json", TransactionSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const transactionsToUpdate = c.var.db.$with("transactions_to_update").as(
        c.var.db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(eq(transactions.id, id), eq(accounts.userId, c.var.user.id))
          )
      );

      const [data] = await c.var.db
        .with(transactionsToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToUpdate})`
          )
        )
        .returning();

      if (!data) {
        return c.json({ error: "Transaction not found" }, 404);
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

      const transactionsToDelete = c.var.db.$with("transactions_to_delete").as(
        c.var.db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(eq(transactions.id, id), eq(accounts.userId, c.var.user.id))
          )
      );

      const [data] = await c.var.db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning({
          id: transactions.id,
        });

      if (!data) {
        return c.json({ error: "Transaction not found" }, 404);
      }
      return c.json({ data });
    }
  );

export default app;
