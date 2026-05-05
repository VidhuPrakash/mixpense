import { OpenAPIHono, z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { db } from "../../../schema";
import { budget, expense, item } from "../../../schema/table";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { auth } from "../../../lib/auth-server";

interface Variables {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

const mainRouter = new OpenAPIHono<{ Variables: Variables }>();

mainRouter.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);

  await next();
});

mainRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      budgetAmount: z.number().int().optional(),
    }),
  ),
  async (c) => {
    const { name, budgetAmount } = c.req.valid("json");
    const user = c.get("user");

    const [newItem] = await db
      .insert(item)
      .values({
        name,
        userId: user.id,
      })
      .returning();

    if (budgetAmount && budgetAmount > 0 && newItem.id) {
      await db.insert(budget).values({
        name,
        amount: budgetAmount,
        itemId: newItem.id,
        userId: user.id,
      });
    }

    return c.json(newItem);
  },
);

mainRouter.delete("/:itemId", async (c) => {
  const itemId = c.req.param("itemId");
  const user = c.get("user");

  const [existingItem] = await db
    .select()
    .from(item)
    .where(and(eq(item.id, itemId), eq(item.userId, user.id)))
    .limit(1);

  if (!existingItem) {
    return c.json({ error: "Item not found" }, 404);
  }

  await db.delete(expense).where(eq(expense.itemId, itemId));
  await db.delete(budget).where(eq(budget.itemId, itemId));
  await db.delete(item).where(eq(item.id, itemId));

  return c.json({ success: true });
});

mainRouter.patch(
  "/:itemId",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
    }),
  ),
  async (c) => {
    const itemId = c.req.param("itemId");
    const { name } = c.req.valid("json");
    const user = c.get("user");

    const [existingItem] = await db
      .select()
      .from(item)
      .where(and(eq(item.id, itemId), eq(item.userId, user.id)))
      .limit(1);

    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    const [updatedItem] = await db
      .update(item)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(item.id, itemId))
      .returning();

    return c.json(updatedItem);
  },
);

mainRouter.post(
  "/:itemId/budget",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      amount: z.number().int(),
    }),
  ),
  async (c) => {
    const itemId = c.req.param("itemId");
    const { name, amount } = c.req.valid("json");
    const user = c.get("user");

    const [existingItem] = await db
      .select()
      .from(item)
      .where(and(eq(item.id, itemId), eq(item.userId, user.id)))
      .limit(1);

    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    const [newBudget] = await db
      .insert(budget)
      .values({
        name,
        amount,
        itemId,
        userId: user.id,
      })
      .returning();

    return c.json(newBudget);
  },
);

mainRouter.post(
  "/:itemId/expenses",
  zValidator(
    "json",
    z.object({
      amount: z.number().int().positive(),
      description: z.string().optional(),
    }),
  ),
  async (c) => {
    const itemId = c.req.param("itemId");
    const { amount, description } = c.req.valid("json");
    const user = c.get("user");

    const [existingItem] = await db
      .select()
      .from(item)
      .where(and(eq(item.id, itemId), eq(item.userId, user.id)))
      .limit(1);

    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    const [newExpense] = await db
      .insert(expense)
      .values({
        itemId,
        amount,
        description,
      })
      .returning();

    return c.json(newExpense);
  },
);

mainRouter.patch(
  "/:itemId/budget",
  zValidator("json", z.object({ amount: z.number().int().min(0) })),
  async (c) => {
    try {
      const itemId = c.req.param("itemId");
      const { amount } = c.req.valid("json");
      const user = c.get("user");

      const [existingItem] = await db
        .select()
        .from(item)
        .where(and(eq(item.id, itemId), eq(item.userId, user.id)))
        .limit(1);

      if (!existingItem) {
        return c.json({ error: "Item not found" }, 404);
      }

      const [existingBudget] = await db
        .select()
        .from(budget)
        .where(and(eq(budget.itemId, itemId), eq(budget.userId, user.id)))
        .limit(1);

      if (!existingBudget) {
        return c.json({ error: "Budget not found" }, 404);
      }

      const [updated] = await db
        .update(budget)
        .set({ amount, updatedAt: new Date().toISOString() })
        .where(eq(budget.id, existingBudget.id))
        .returning();

      return c.json(updated);
    } catch {
      return c.json({ message: "Something went wrong." }, 500);
    }
  },
);

mainRouter.get("/:itemId/expenses/list", async (c) => {
  try {
    const { itemId } = c.req.param();
    const user = c.get("user");
    const yearParam = c.req.query("year");
    const monthParam = c.req.query("month");

    const [existingItem] = await db
      .select()
      .from(item)
      .where(and(eq(item.id, itemId), eq(item.userId, user.id)))
      .limit(1);

    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    let whereClause;
    if (yearParam && monthParam) {
      const year = Number(yearParam);
      const month = Number(monthParam);
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0).toISOString();
      const end = new Date(year, month, 0, 23, 59, 59).toISOString();
      whereClause = and(
        eq(expense.itemId, itemId),
        gte(expense.createdAt, start),
        lte(expense.createdAt, end),
      );
    } else {
      whereClause = eq(expense.itemId, itemId);
    }

    const expenses = await db
      .select()
      .from(expense)
      .where(whereClause)
      .orderBy(desc(expense.createdAt));

    return c.json({ expenses });
  } catch {
    return c.json({ message: "Something went wrong." }, 500);
  }
});

mainRouter.patch(
  "/:itemId/expenses/:expenseId",
  zValidator(
    "json",
    z.object({
      amount: z.number().int().positive().optional(),
      description: z.string().optional(),
    }),
  ),
  async (c) => {
    try {
      const { itemId, expenseId } = c.req.param();
      const { amount, description } = c.req.valid("json");
      const user = c.get("user");

      const [existingItem] = await db
        .select()
        .from(item)
        .where(and(eq(item.id, itemId), eq(item.userId, user.id)))
        .limit(1);

      if (!existingItem) {
        return c.json({ error: "Item not found" }, 404);
      }

      const [existingExpense] = await db
        .select()
        .from(expense)
        .where(and(eq(expense.id, expenseId), eq(expense.itemId, itemId)))
        .limit(1);

      if (!existingExpense) {
        return c.json({ error: "Expense not found" }, 404);
      }

      const [updated] = await db
        .update(expense)
        .set({
          ...(amount !== undefined && { amount }),
          ...(description !== undefined && { description }),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(expense.id, expenseId))
        .returning();

      return c.json(updated);
    } catch {
      return c.json({ message: "Something went wrong." }, 500);
    }
  },
);

mainRouter.get("/:itemId/expenses/:year/:month", async (c) => {
  try {
    const { itemId, year, month } = c.req.param();
    const user = c.get("user");

    const start = new Date(Number(year), Number(month) - 1, 1).toISOString();
    const end = new Date(
      Number(year),
      Number(month),
      0,
      23,
      59,
      59,
    ).toISOString();

    const result = await db
      .select({
        itemId: item.id,
        itemName: item.name,
        expectedBudget: budget.amount,
        totalSpent: sql<number>`COALESCE(SUM(${expense.amount}), 0)`,
      })
      .from(item)
      .leftJoin(
        budget,
        and(eq(budget.itemId, item.id), eq(budget.userId, user.id)),
      )
      .leftJoin(
        expense,
        and(
          eq(expense.itemId, item.id),
          gte(expense.createdAt, start),
          lte(expense.createdAt, end),
        ),
      )
      .where(and(eq(item.id, itemId), eq(item.userId, user.id)))
      .groupBy(item.id, item.name, budget.amount);

    return c.json(
      result[0]
        ? {
            itemId: result[0].itemId,
            itemName: result[0].itemName,
            expectedBudget: Number(result[0].expectedBudget ?? 0),
            totalSpent: Number(result[0].totalSpent ?? 0),
          }
        : {
            itemId,
            itemName: null,
            expectedBudget: 0,
            totalSpent: 0,
          },
    );
  } catch {
    return c.json({ message: "Something went wrong." }, 500);
  }
});

mainRouter.get("/summary", async (c) => {
  try {
    const user = c.get("user");

    const yearParam = Number(c.req.query("year"));
    const monthParam = Number(c.req.query("month"));
    const now = new Date();
    const year =
      Number.isFinite(yearParam) && yearParam > 0
        ? yearParam
        : now.getFullYear();
    const month =
      Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12
        ? monthParam
        : now.getMonth() + 1;

    const start = new Date(year, month - 1, 1, 0, 0, 0, 0).toISOString();
    const end = new Date(year, month, 1, 0, 0, 0, 0).toISOString();

    const rows = await db
      .select({
        itemId: item.id,
        itemName: item.name,
        expectedBudget: budget.amount,
        totalSpent: sql<number>`COALESCE(SUM(CASE WHEN ${expense.createdAt} >= ${start} AND ${expense.createdAt} < ${end} THEN ${expense.amount} ELSE 0 END), 0)`,
      })
      .from(item)
      .leftJoin(
        budget,
        and(eq(budget.itemId, item.id), eq(budget.userId, user.id)),
      )
      .leftJoin(expense, eq(expense.itemId, item.id))
      .where(eq(item.userId, user.id))
      .groupBy(item.id, item.name, budget.amount);

    return c.json({
      year,
      month,
      count: rows.length,
      items: rows.map((r) => ({
        id: r.itemId,
        name: r.itemName,
        expectedBudget: Number(r.expectedBudget ?? 0),
        totalSpent: Number(r.totalSpent ?? 0),
      })),
    });
  } catch (error) {
    return c.json({ message: "Something went wrong." }, 500);
  }
});

export default mainRouter;
