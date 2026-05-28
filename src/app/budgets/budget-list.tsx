"use client";

import { useState } from "react";
import { createBudget, deleteBudget } from "@/lib/actions/budgets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

type Budget = {
  id: string;
  categoryId: string;
  categoryName: string | null;
  amount: number;
  spent: number;
  percentage: number;
};

type Category = { id: string; name: string; parentId: string | null };

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BudgetList({
  budgets,
  categories,
}: {
  budgets: Budget[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);

  async function handleCreate(formData: FormData) {
    await createBudget(formData);
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      {budgets.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-400 text-sm">
          No budgets set yet
        </div>
      )}

      {budgets.map((b) => {
        const isOver = b.spent > b.amount;
        return (
          <div
            key={b.id}
            className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-semibold text-gray-600 text-sm">
                  {(b.categoryName ?? "U")[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {b.categoryName ?? "Uncategorized"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatIDR(b.spent)} of {formatIDR(b.amount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${isOver ? "text-rose-500" : "text-gray-900"}`}
                >
                  {b.percentage}%
                </span>
                <button
                  onClick={() => deleteBudget(b.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOver ? "bg-rose-500" : b.percentage > 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                style={{ width: `${b.percentage}%` }}
              />
            </div>
          </div>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="w-full bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-100">
            <Plus size={18} />
            <span className="text-sm font-medium">Set Budget</span>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Budget</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                name="categoryId"
                required
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monthly Limit</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="1"
                placeholder="e.g. 500000"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Save Budget
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
