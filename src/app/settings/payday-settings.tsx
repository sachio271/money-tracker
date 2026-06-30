'use client'

import { useState, useRef } from 'react'
import {
  updateDefaultPayday,
  setPaydayOverride,
  deletePaydayOverride,
} from '@/lib/actions/settings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Trash2 } from 'lucide-react'

type Override = {
  id: string
  year: number
  month: number
  payday: number
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export default function PaydaySettings({
  defaultPayday,
  overrides,
}: {
  defaultPayday: number
  overrides: Override[]
}) {
  const [savingDefault, setSavingDefault] = useState(false)
  const [addingOverride, setAddingOverride] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const savingRef = useRef(false)

  const now = new Date()

  async function handleDefaultSubmit(formData: FormData) {
    if (savingRef.current) return
    savingRef.current = true
    setSavingDefault(true)
    try {
      await updateDefaultPayday(formData)
    } finally {
      savingRef.current = false
      setSavingDefault(false)
    }
  }

  async function handleOverrideSubmit(formData: FormData) {
    setAddingOverride(true)
    try {
      await setPaydayOverride(formData)
    } finally {
      setAddingOverride(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deletePaydayOverride(id)
    setDeletingId(null)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-5">
      <div>
        <p className="font-medium text-gray-900 mb-1">Default payday</p>
        <p className="text-xs text-gray-400 mb-3">
          Day of the month your salary normally lands. Cycles run from one payday up to the day before the next.
        </p>
        <form action={handleDefaultSubmit} className="flex items-center gap-2">
          <Input
            name="defaultPayday"
            type="number"
            min={1}
            max={31}
            defaultValue={defaultPayday}
            className="w-24"
          />
          <button
            type="submit"
            disabled={savingDefault}
            className="h-10 px-4 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {savingDefault && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
        </form>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="font-medium text-gray-900 mb-1">Payday overrides</p>
        <p className="text-xs text-gray-400 mb-3">
          For months where your actual payday shifted (e.g. earlier due to a weekend), record the real date here.
        </p>

        {overrides.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {overrides.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2"
              >
                <p className="text-sm text-gray-700">
                  {MONTHS[o.month - 1]} {o.year} &mdash; day {o.payday}
                </p>
                <button
                  onClick={() => handleDelete(o.id)}
                  disabled={deletingId === o.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                >
                  {deletingId === o.id ? (
                    <Loader2 size={13} className="animate-spin text-rose-400" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <form action={handleOverrideSubmit} className="grid grid-cols-3 gap-2 items-end">
          <div className="space-y-1">
            <Label htmlFor="month" className="text-xs">Month</Label>
            <select
              id="month"
              name="month"
              defaultValue={now.getMonth() + 1}
              className="w-full h-10 rounded-xl border border-gray-200 px-2 text-sm"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="year" className="text-xs">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              defaultValue={now.getFullYear()}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="payday" className="text-xs">Payday</Label>
            <Input id="payday" name="payday" type="number" min={1} max={31} required />
          </div>
          <button
            type="submit"
            disabled={addingOverride}
            className="col-span-3 h-10 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {addingOverride && <Loader2 size={14} className="animate-spin" />}
            Add override
          </button>
        </form>
      </div>
    </div>
  )
}
