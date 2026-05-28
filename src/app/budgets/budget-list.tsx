"use client";

import { useState, useRef } from "react";
import { createBudget, deleteBudget } from "@/lib/actions/budgets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/confirm-dialog";

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
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // Create confirmation
  const [pendingCreateData, setPendingCreateData] = useState<FormData | null>(null);

  // Delete confirmation
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate(formData: FormData) {
    setPendingCreateData(formData);
  }

  async function handleConfirmCreate() {
    if (!pendingCreateData || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await createBudget(pendingCreateData);
      setPendingCreateData(null);
      setOpen(false);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    setPendingDeleteId(null);
    await deleteBudget(pendingDeleteId);
    setDeletingId(null);
  }

  const createCategoryId = pendingCreateData?.get('categoryId') as string | null;
  const createCategoryName = createCategoryId
    ? (categories.find(c => c.id === createCategoryId)?.name ?? 'Unknown')
    : null;
  const createAmount = Number(pendingCreateData?.get('amount') ?? 0);
  const pendingBudget = budgets.find(b => b.id === pendingDeleteId);

  return (
    <div className="space-y-3">
      {/* Create confirmation */}
      <ConfirmDialog
        open={!!pendingCreateData}
        onClose={() => setPendingCreateData(null)}
        onConfirm={handleConfirmCreate}
        loading={saving}
        title="Set budget?"
        description={createCategoryName
          ? `Monthly limit of ${formatIDR(createAmount)} will be set for "${createCategoryName}".`
          : ''}
        confirmLabel="Save"
        variant="save"
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDelete}
        loading={!!deletingId}
        title="Delete budget?"
        description={pendingBudget
          ? `Delete budget for "${pendingBudget.categoryName ?? 'Uncategorized'}"? This cannot be undone.`
          : ''}
      />

      {budgets.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-400 text-sm">
          No budgets set yet
        </div>
      )}

      {budgets.map((b) => {
        const isOver = b.spent > b.amount;
        return (
          <div key={b.id} className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-3">
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
                <span className={`text-sm font-bold ${isOver ? "text-rose-500" : "text-gray-900"}`}>
                  {b.percentage}%
                </span>
                <button
                  onClick={() => setPendingDeleteId(b.id)}
                  disabled={deletingId === b.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                >
                  {deletingId === b.id
                    ? <Loader2 size={14} className="animate-spin text-rose-400" />
                    : <Trash2 size={14} />}
                </button>
              </div>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOver ? "bg-rose-500" : b.percentage > 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(b.percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      })}

      <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
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
                  <option key={c.id} value={c.id}>{c.name}</option>
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
            <button
              type="submit"
              disabled={saving}
              className="w-full h-11 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save Budget'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
