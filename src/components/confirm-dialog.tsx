"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "save";
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title,
  description,
  confirmLabel = "Delete",
  variant = "danger",
}: Props) {
  const confirmCls =
    variant === "save"
      ? "bg-gray-900 hover:bg-gray-700"
      : "bg-rose-500 hover:bg-rose-600";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-11 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${confirmCls}`}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
