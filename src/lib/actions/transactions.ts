"use server";

import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.coerce.number().int().positive(),
  accountId: z.string().uuid(),
  toAccountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  note: z.string().optional(),
  occurredAt: z.string().transform((v) => new Date(v)),
});

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getTransactions(year: number, month: number) {
  const userId = await getUserId();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, from),
        lte(transactions.occurredAt, to),
      ),
    )
    .orderBy(desc(transactions.occurredAt));
}

export async function createTransaction(formData: FormData) {
  const userId = await getUserId();
  const parsed = transactionSchema.parse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    accountId: formData.get("accountId"),
    toAccountId: formData.get("toAccountId") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    note: formData.get("note") || undefined,
    occurredAt: formData.get("occurredAt"),
  });

  await db.insert(transactions).values({ ...parsed, userId });
  revalidatePath("/transactions");
}

export async function deleteTransaction(id: string) {
  const userId = await getUserId();
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  revalidatePath("/transactions");
}
