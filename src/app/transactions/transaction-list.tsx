'use client'

import { useRouter } from 'next/navigation'
import { deleteTransaction } from '@/lib/actions/transactions'
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

type Transaction = {
  id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  note: string | null
  occurredAt: Date
  categoryId: string | null
  accountId: string
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function groupByDate(txns: Transaction[]) {
  const groups: Record<string, Transaction[]> = {}
  for (const t of txns) {
    const key = new Date(t.occurredAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  }
  return groups
}

export default function TransactionsList({
  transactions,
  year,
  month,
}: {
  transactions: Transaction[]
  year: number
  month: number
}) {
  const router = useRouter()

  function navigate(m: number, y: number) {
    router.push(`/transactions?year=${y}&month=${m}`)
  }

  function prev() { if (month === 1) navigate(12, year - 1); else navigate(month - 1, year) }
  function next() { if (month === 12) navigate(1, year + 1); else navigate(month + 1, year) }

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const groups = groupByDate(transactions)

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-gray-900">{MONTHS[month - 1]} {year}</span>
        <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium mb-1">
            <ArrowUpRight size={13} /> Income
          </div>
          <p className="font-bold text-gray-900">{formatIDR(income)}</p>
        </div>
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-rose-500 text-xs font-medium mb-1">
            <ArrowDownRight size={13} /> Expenses
          </div>
          <p className="font-bold text-gray-900">{formatIDR(expense)}</p>
        </div>
      </div>

      {/* Grouped list */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400 shadow-sm">
          No transactions this month
        </div>
      ) : (
        Object.entries(groups).map(([date, txns]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">{date}</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
              {txns.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      t.type === 'income' ? 'bg-emerald-100' :
                      t.type === 'expense' ? 'bg-rose-100' : 'bg-sky-100'
                    }`}>
                      {t.type === 'income'
                        ? <ArrowUpRight size={16} className="text-emerald-600" />
                        : <ArrowDownRight size={16} className="text-rose-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.note ?? '—'}</p>
                      <p className="text-xs text-gray-400 capitalize">{t.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-semibold text-sm ${
                      t.type === 'income' ? 'text-emerald-600' :
                      t.type === 'expense' ? 'text-rose-500' : 'text-sky-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                    </p>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
