import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-2xl font-bold text-gray-900">$</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Money Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
