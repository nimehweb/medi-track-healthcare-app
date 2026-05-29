'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut } from '@/lib/auth'
import { getUserProfile } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { user, error: signInError } = await signIn(email, password)
    if (signInError || !user) {
      setError(signInError || 'Sign in failed')
      setLoading(false)
      return
    }

    const { data: profile } = await getUserProfile(user.uid)
    if (!profile || profile.role !== 'admin') {
      await signOut()
      setError('Unauthorized. This portal is for administrators only.')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="size-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Authorized personnel only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
