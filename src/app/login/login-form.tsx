'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSent(true)
      setLoading(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/')
    }
  }

  if (sent) {
    return (
      <div className="bg-white/10 rounded-2xl p-6 text-center">
        <p className="text-white font-semibold text-lg mb-1">Check your email</p>
        <p className="text-gray-400 text-sm">
          We sent a magic link to<br />
          <span className="text-white">{email}</span>
        </p>
      </div>
    )
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

      {mode === 'password' && (
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-white/30 transition-colors"
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-gray-900 font-semibold rounded-2xl py-3.5 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {loading
          ? 'Please wait…'
          : mode === 'magic' ? 'Send magic link' : 'Sign in'}
      </button>

      <button
        type="button"
        onClick={() => { setMode(mode === 'magic' ? 'password' : 'magic'); setError(null) }}
        className="w-full text-gray-500 text-xs py-1 hover:text-gray-400 transition-colors"
      >
        {mode === 'magic' ? 'Sign in with password instead' : 'Sign in with magic link instead'}
      </button>
    </form>
  )
}
