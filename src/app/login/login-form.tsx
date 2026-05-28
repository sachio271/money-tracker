'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setSent(true)
    setLoading(false)
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
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-white/30 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-gray-900 font-semibold rounded-2xl py-3.5 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send magic link'}
      </button>
    </form>
  )
}
