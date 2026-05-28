"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().uuid().optional(),
});

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getCategories() {
  const userId = await getUserId();
  return db
    .select()
    .from(categories)
    .where(
      and(eq(categories.userId, userId), eq(categories.isArchived, false)),
    );
}

export async function createCategory(formData: FormData) {
  const userId = await getUserId();
  const parentId = formData.get("parentId");
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    icon: formData.get("icon") || undefined,
    color: formData.get("color") || undefined,
    parentId: parentId && parentId !== "" ? parentId : undefined,
  });

  await db.insert(categories).values({ ...parsed, userId });
  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  const userId = await getUserId();
  await db
    .update(categories)
    .set({ isArchived: true })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  revalidatePath("/categories");
}
