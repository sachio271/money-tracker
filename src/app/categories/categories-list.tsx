'use client'

import { useState, useRef } from 'react'
import { createCategory, deleteCategory } from '@/lib/actions/categories'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Archive, ChevronRight, Loader2 } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'

type Category = {
  id: string
  name: string
  icon: string | null
  color: string | null
  parentId: string | null
}

export default function CategoriesList({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  // Create confirmation
  const [pendingCreateData, setPendingCreateData] = useState<FormData | null>(null)

  // Delete confirmation
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const parents = categories.filter((c) => !c.parentId)
  const children = categories.filter((c) => c.parentId)

  function handleCreate(formData: FormData) {
    setPendingCreateData(formData)
  }

  async function handleConfirmCreate() {
    if (!pendingCreateData || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    try {
      await createCategory(pendingCreateData)
      setPendingCreateData(null)
      setOpen(false)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!pendingDeleteId) return
    setDeletingId(pendingDeleteId)
    setPendingDeleteId(null)
    await deleteCategory(pendingDeleteId)
    setDeletingId(null)
  }

  const createName = pendingCreateData?.get('name') as string | null
  const createParentId = pendingCreateData?.get('parentId') as string | null
  const createParentName = createParentId ? parents.find(p => p.id === createParentId)?.name : null
  const pendingCat = categories.find(c => c.id === pendingDeleteId)

  return (
    <div className="space-y-3">
      {/* Create confirmation */}
      <ConfirmDialog
        open={!!pendingCreateData}
        onClose={() => setPendingCreateData(null)}
        onConfirm={handleConfirmCreate}
        loading={saving}
        title="Create category?"
        description={createName
          ? createParentName
            ? `"${createName}" will be added under "${createParentName}".`
            : `"${createName}" will be added as a top-level category.`
          : ''}
        confirmLabel="Create"
        variant="save"
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDelete}
        loading={!!deletingId}
        title="Archive category?"
        description={pendingCat ? `Archive "${pendingCat.name}"? Subcategories will also be removed.` : ''}
        confirmLabel="Archive"
      />

      {parents.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-400 text-sm">
          No categories yet
        </div>
      )}

      {parents.map((cat) => {
        const subs = children.filter(c => c.parentId === cat.id)
        return (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-semibold text-gray-600 text-sm">
                  {cat.name[0]}
                </div>
                <p className="font-semibold text-gray-900">{cat.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {subs.length > 0 && (
                  <span className="text-xs text-gray-400">{subs.length} sub</span>
                )}
                <button
                  onClick={() => setPendingDeleteId(cat.id)}
                  disabled={deletingId === cat.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                >
                  {deletingId === cat.id
                    ? <Loader2 size={14} className="animate-spin text-rose-400" />
                    : <Archive size={14} />}
                </button>
              </div>
            </div>
            {subs.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-2 pl-3">
                  <ChevronRight size={14} className="text-gray-300" />
                  <p className="text-sm text-gray-700">{sub.name}</p>
                </div>
                <button
                  onClick={() => setPendingDeleteId(sub.id)}
                  disabled={deletingId === sub.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                >
                  {deletingId === sub.id
                    ? <Loader2 size={14} className="animate-spin text-rose-400" />
                    : <Archive size={14} />}
                </button>
              </div>
            ))}
          </div>
        )
      })}

      <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
        <DialogTrigger asChild>
          <button className="w-full bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-100">
            <Plus size={18} />
            <span className="text-sm font-medium">Add Category</span>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="e.g. Food & Drinks" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent category (optional)</Label>
              <select name="parentId" className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">None</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full h-11 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Creating…' : 'Create Category'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
