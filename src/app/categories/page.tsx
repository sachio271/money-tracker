import { getCategories } from "@/lib/actions/categories";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CategoriesList from "./categories-list";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const categoriesList = await getCategories();

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>
      <CategoriesList categories={categoriesList} />
    </main>
  );
}
