'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm rounded-2xl px-4 py-3">
          {error}
        </div>
      )}
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-white/30 transition-colors"
      />
      <input
        type="password"
        placeholder="Password (min. 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-white/30 transition-colors"
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-white/30 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-gray-900 font-semibold rounded-2xl py-3.5 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-center text-sm text-gray-500 pt-1">
        Already have an account?{' '}
        <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
