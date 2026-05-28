'use client'

import { useState } from 'react'
import { createCategory, deleteCategory } from '@/lib/actions/categories'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Archive, ChevronRight } from 'lucide-react'

type Category = {
  id: string
  name: string
  icon: string | null
  color: string | null
  parentId: string | null
}

export default function CategoriesList({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  const parents = categories.filter((c) => !c.parentId)
  const children = categories.filter((c) => c.parentId)

  async function handleCreate(formData: FormData) {
    await createCategory(formData)
    setOpen(false)
  }

  return (
    <div className="space-y-3">
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
                  onClick={() => deleteCategory(cat.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Archive size={14} />
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
                  onClick={() => deleteCategory(sub.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Archive size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      })}

      <Dialog open={open} onOpenChange={setOpen}>
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
            <Button type="submit" className="w-full">Create Category</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
