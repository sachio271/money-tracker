'use client'

import { useState, useRef } from 'react'
import { createAccount, deleteAccount } from '@/lib/actions/accounts'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Archive, Loader2 } from 'lucide-react'
import ConfirmDialog from '@/components/confirm-dialog'

type Account = {
  id: string
  name: string
  currency: string
  openingBalance: number
  icon: string | null
  color: string | null
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export default function AccountsList({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false)
  const [currency, setCurrency] = useState('IDR')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate(formData: FormData) {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    try {
      formData.set('currency', currency)
      await createAccount(formData)
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
    await deleteAccount(pendingDeleteId)
    setDeletingId(null)
  }

  const pendingAccount = accounts.find(a => a.id === pendingDeleteId)

  return (
    <div className="space-y-3">
      <ConfirmDialog
        open={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDelete}
        loading={!!deletingId}
        title="Archive account?"
        description={pendingAccount ? `Archive "${pendingAccount.name}"? This cannot be undone.` : 'This cannot be undone.'}
        confirmLabel="Archive"
      />

      {accounts.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-400 text-sm">
          No accounts yet
        </div>
      )}

      {accounts.map((account) => (
        <div key={account.id} className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-700 text-lg">
              {account.name[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{account.name}</p>
              <p className="text-sm text-gray-400">{formatAmount(account.openingBalance, account.currency)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{account.currency}</span>
            <button
              onClick={() => setPendingDeleteId(account.id)}
              disabled={deletingId === account.id}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              {deletingId === account.id
                ? <Loader2 size={15} className="animate-spin text-rose-400" />
                : <Archive size={15} />}
            </button>
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
        <DialogTrigger asChild>
          <button className="w-full bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-100">
            <Plus size={18} />
            <span className="text-sm font-medium">Add Account</span>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="e.g. BCA Savings" required />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR — Indonesian Rupiah</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Opening Balance</Label>
              <Input id="openingBalance" name="openingBalance" type="number" defaultValue="0" />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full h-11 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Creating…' : 'Create Account'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
