"use server";

import { db } from "@/lib/db";
import { budgets, transactions, categories } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
});

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getBudgets(year: number, month: number) {
  const userId = await getUserId();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  const budgetList = await db
    .select({
      id: budgets.id,
      amount: budgets.amount,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.userId, userId));

  const txns = await db
    .select({
      amount: transactions.amount,
      categoryId: transactions.categoryId,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        gte(transactions.occurredAt, from),
        lte(transactions.occurredAt, to),
      ),
    );

  const spentMap: Record<string, number> = {};
  for (const t of txns) {
    const key = t.categoryId ?? "";
    spentMap[key] = (spentMap[key] ?? 0) + t.amount;
  }

  return budgetList.map((b) => ({
    ...b,
    spent: spentMap[b.categoryId] ?? 0,
    percentage: Math.min(
      Math.round(((spentMap[b.categoryId] ?? 0) / b.amount) * 100),
      100,
    ),
  }));
}

export async function createBudget(formData: FormData) {
  const userId = await getUserId();
  const parsed = budgetSchema.parse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
  });

  const existing = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.categoryId, parsed.categoryId),
      ),
    );

  if (existing.length > 0) {
    await db
      .update(budgets)
      .set({ amount: parsed.amount })
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.categoryId, parsed.categoryId),
        ),
      );
  } else {
    await db.insert(budgets).values({ ...parsed, userId });
  }

  revalidatePath("/budgets");
}

export async function deleteBudget(id: string) {
  const userId = await getUserId();
  await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  revalidatePath("/budgets");
}
