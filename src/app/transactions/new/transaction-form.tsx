'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction } from '@/lib/actions/transactions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Loader2 } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'

type Account = { id: string; name: string; currency: string }
type Category = { id: string; name: string; parentId: string | null }

const typeStyle = {
  expense: { active: 'bg-rose-500 text-white', amount: 'text-rose-500', border: 'border-rose-200 bg-rose-50', btn: 'bg-rose-500 hover:bg-rose-600' },
  income:  { active: 'bg-emerald-500 text-white', amount: 'text-emerald-600', border: 'border-emerald-200 bg-emerald-50', btn: 'bg-emerald-500 hover:bg-emerald-600' },
  transfer:{ active: 'bg-sky-500 text-white', amount: 'text-sky-500', border: 'border-sky-200 bg-sky-50', btn: 'bg-sky-500 hover:bg-sky-600' },
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export default function TransactionForm({
  accounts,
  categories,
}: {
  accounts: Account[]
  categories: Category[]
}) {
  const router = useRouter()
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense')
  const [loading, setLoading] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)
  const [categoryId, setCategoryId] = useState('uncategorized')
  const submitting = useRef(false)
  const style = typeStyle[type]
  const today = new Date().toISOString().slice(0, 16)

  const parentCategories = categories.filter((c) => !c.parentId)
  const childCategories = categories.filter((c) => c.parentId)

  // Step 1: intercept submit → show confirm dialog
  function handleSubmit(formData: FormData) {
    formData.set('categoryId', categoryId === 'uncategorized' ? '' : categoryId)
    setPendingData(formData)
  }

  // Step 2: user confirms → actually save
  async function handleConfirm() {
    if (!pendingData || submitting.current) return
    submitting.current = true
    setLoading(true)
    try {
      await createTransaction(pendingData)
      router.push('/transactions')
    } catch {
      submitting.current = false
      setLoading(false)
      setPendingData(null)
    }
  }

  // Build a human-readable summary for the confirm dialog
  const confirmDescription = (() => {
    if (!pendingData) return ''
    const amount = Number(pendingData.get('amount') ?? 0)
    const accountId = pendingData.get('accountId') as string
    const categoryId = pendingData.get('categoryId') as string
    const note = pendingData.get('note') as string
    const account = accounts.find(a => a.id === accountId)?.name ?? ''
    const category = categoryId ? (categories.find(c => c.id === categoryId)?.name ?? '') : ''
    const parts = [formatIDR(amount), category || 'Uncategorized', account]
    if (note) parts.push(`"${note}"`)
    return parts.filter(Boolean).join(' · ')
  })()

  return (
    <div>
      <ConfirmDialog
        open={!!pendingData && !loading}
        onClose={() => setPendingData(null)}
        onConfirm={handleConfirm}
        loading={loading}
        title={`Save this ${type}?`}
        description={confirmDescription}
        confirmLabel="Save"
        variant="save"
      />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">New Transaction</h1>
      </div>

      <form action={handleSubmit} className="space-y-3">
        {/* Type selector */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-sm">
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                type === t ? typeStyle[t].active : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />

        {/* Amount */}
        <div className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${style.border}`}>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Amount</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${style.amount}`}>Rp</span>
            <input
              name="amount"
              type="number"
              min="1"
              placeholder="0"
              required
              className={`flex-1 text-3xl font-bold bg-transparent outline-none ${style.amount} placeholder-gray-200`}
            />
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm">
          <Label htmlFor="occurredAt" className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date & Time</Label>
          <Input
            id="occurredAt"
            name="occurredAt"
            type="datetime-local"
            defaultValue={today}
            required
            className="border-0 shadow-none p-0 mt-1 text-gray-900 font-medium focus-visible:ring-0"
          />
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            {type === 'transfer' ? 'From Account' : 'Account'}
          </p>
          <select name="accountId" required className="w-full text-gray-900 font-medium bg-transparent border-0 outline-none text-sm">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
            ))}
          </select>
        </div>

        {/* To Account */}
        {type === 'transfer' && (
          <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">To Account</p>
            <select name="toAccountId" required className="w-full text-gray-900 font-medium bg-transparent border-0 outline-none text-sm">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
              ))}
            </select>
          </div>
        )}

        {/* Category */}
        {type !== 'transfer' && (
          <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Category</p>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full border-0 shadow-none p-0 h-auto text-sm font-medium text-gray-900 bg-transparent focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {parentCategories.map((p) => {
                  const subs = childCategories.filter((c) => c.parentId === p.id)
                  if (subs.length === 0) {
                    return <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  }
                  return (
                    <SelectGroup key={p.id}>
                      <SelectLabel>{p.name}</SelectLabel>
                      <SelectItem value={p.id}>{p.name} (general)</SelectItem>
                      {subs.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Note */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm">
          <Label htmlFor="note" className="text-xs text-gray-400 font-medium uppercase tracking-wide">Note</Label>
          <Textarea
            id="note"
            name="note"
            placeholder="What was this for?"
            rows={2}
            className="border-0 shadow-none p-0 mt-1 resize-none focus-visible:ring-0 text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-12 text-base font-semibold rounded-2xl text-white transition-colors flex items-center justify-center gap-2 ${style.btn} disabled:opacity-50`}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving…' : `Save ${type}`}
        </button>
      </form>
    </div>
  )
}
