'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Hospital } from 'lucide-react'

export default function LabLoginPage() {
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
    if (signInError) {
      setError(signInError)
      setLoading(false)
      return
    }

    router.push('/lab/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Hospital className="size-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Lab Portal</h1>
            <p className="text-muted-foreground mt-2">Sign in to your lab account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="lab@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have a lab account?{' '}
              <Link href="/lab/register" className="font-medium text-primary hover:underline">Register your lab</Link>
            </p>
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">Patient login</Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
