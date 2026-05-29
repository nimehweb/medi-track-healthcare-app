'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, signOut } from '@/lib/auth'
import { getUserProfile, getLabById } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Hospital } from 'lucide-react'

export default function LabLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
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
    if (!profile) {
      await signOut()
      setError('No hospital account found for this email. Please register your hospital first.')
      setLoading(false)
      return
    }

    if (profile.role !== 'lab_staff') {
      await signOut()
      setError('This account is registered as a patient. Please use the Patient login.')
      setLoading(false)
      return
    }

    if (!profile.labId) {
      await signOut()
      setError('Hospital account not properly configured. Contact support.')
      setLoading(false)
      return
    }

    const { data: lab } = await getLabById(profile.labId)
    if (!lab) {
      await signOut()
      setError('Hospital not found. Contact support.')
      setLoading(false)
      return
    }

    if (lab.status !== 'active') {
      await signOut()
      setError('Your hospital registration is pending approval. Please wait for admin verification.')
      setLoading(false)
      return
    }

    if (lab.licenseNumber !== licenseNumber.trim()) {
      await signOut()
      setError('License number does not match our records.')
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
            <h1 className="text-2xl font-bold text-foreground">Hospital Portal</h1>
            <p className="text-muted-foreground mt-2">Sign in to your hospital account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hospital@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Hospital License Number *</label>
              <Input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g., HPC/LAB/2024/001" required />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? 'Verifying...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have a hospital account?{' '}
              <Link href="/lab/register" className="font-medium text-primary hover:underline">Register your hospital</Link>
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
