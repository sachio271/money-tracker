"use server";

import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const accountSchema = z.object({
  name: z.string().min(1),
  currency: z.string().default("IDR"),
  openingBalance: z.coerce.number().int().default(0),
  icon: z.string().optional(),
  color: z.string().optional(),
});

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getAccounts() {
  const userId = await getUserId();
  return db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.isArchived, false)));
}

export async function createAccount(formData: FormData) {
  const userId = await getUserId();
  const parsed = accountSchema.parse({
    name: formData.get("name"),
    currency: formData.get("currency"),
    openingBalance: formData.get("openingBalance"),
    icon: formData.get("icon") || undefined,
    color: formData.get("color") || undefined,
  });

  await db.insert(accounts).values({ ...parsed, userId });
  revalidatePath("/accounts");
}

export async function deleteAccount(id: string) {
  const userId = await getUserId();
  await db
    .update(accounts)
    .set({ isArchived: true })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
  revalidatePath("/accounts");
}
