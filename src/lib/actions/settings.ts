"use server";

import { db } from "@/lib/db";
import { userSettings, paydayOverrides } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getPaydaySettings() {
  const userId = await getUserId();

  const [settingsRows, overrides] = await Promise.all([
    db
      .select({ defaultPayday: userSettings.defaultPayday })
      .from(userSettings)
      .where(eq(userSettings.userId, userId)),
    db
      .select()
      .from(paydayOverrides)
      .where(eq(paydayOverrides.userId, userId))
      .orderBy(desc(paydayOverrides.year), desc(paydayOverrides.month)),
  ]);

  return {
    defaultPayday: settingsRows[0]?.defaultPayday ?? 25,
    overrides,
  };
}

const defaultPaydaySchema = z.object({
  defaultPayday: z.coerce.number().int().min(1).max(31),
});

export async function updateDefaultPayday(formData: FormData) {
  const userId = await getUserId();
  const { defaultPayday } = defaultPaydaySchema.parse({
    defaultPayday: formData.get("defaultPayday"),
  });

  const existing = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  if (existing.length > 0) {
    await db
      .update(userSettings)
      .set({ defaultPayday })
      .where(eq(userSettings.userId, userId));
  } else {
    await db.insert(userSettings).values({ userId, defaultPayday });
  }

  revalidatePath("/settings");
}

const overrideSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  payday: z.coerce.number().int().min(1).max(31),
});

export async function setPaydayOverride(formData: FormData) {
  const userId = await getUserId();
  const parsed = overrideSchema.parse({
    year: formData.get("year"),
    month: formData.get("month"),
    payday: formData.get("payday"),
  });

  const existing = await db
    .select()
    .from(paydayOverrides)
    .where(
      and(
        eq(paydayOverrides.userId, userId),
        eq(paydayOverrides.year, parsed.year),
        eq(paydayOverrides.month, parsed.month),
      ),
    );

  if (existing.length > 0) {
    await db
      .update(paydayOverrides)
      .set({ payday: parsed.payday })
      .where(eq(paydayOverrides.id, existing[0].id));
  } else {
    await db.insert(paydayOverrides).values({ ...parsed, userId });
  }

  revalidatePath("/settings");
}

export async function deletePaydayOverride(id: string) {
  const userId = await getUserId();
  await db
    .delete(paydayOverrides)
    .where(and(eq(paydayOverrides.id, id), eq(paydayOverrides.userId, userId)));
  revalidatePath("/settings");
}
