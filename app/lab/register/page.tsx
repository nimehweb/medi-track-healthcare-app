'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { createUserProfile, createLab } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Hospital, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LabRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    labName: '',
    labAddress: '',
    licenseNumber: '',
    phone: '',
    staffName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { user, error: signUpError } = await signUp(formData.email, formData.password)
    if (signUpError || !user) {
      setError(signUpError || 'Signup failed')
      setLoading(false)
      return
    }

    // Create lab entry
    const { id: labId, error: labError } = await createLab({
      name: formData.labName,
      address: formData.labAddress,
      licenseNumber: formData.licenseNumber,
      phone: formData.phone,
      email: formData.email,
      status: 'inactive',
    })

    if (labError || !labId) {
      setError(labError || 'Failed to create lab')
      setLoading(false)
      return
    }

    // Create lab staff profile
    await createUserProfile(user.uid, {
      email: formData.email,
      name: formData.staffName,
      role: 'lab_staff',
      labId,
      phone: formData.phone || undefined,
    })

    setRegistered(true)
    setLoading(false)
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hospital className="size-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Registration Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Your lab registration is pending admin approval. You'll be able to access the portal once verified.
          </p>
          <Link href="/lab/login">
            <Button className="bg-primary hover:bg-primary/90">Go to Login</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Hospital className="size-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Register Your Lab</h1>
            <p className="text-muted-foreground mt-2">Get verified to start uploading patient results</p>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Registration requires admin approval. You'll receive access once verified.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Lab / Hospital Name *</label>
              <Input name="labName" value={formData.labName} onChange={handleChange} placeholder="City Diagnostics Center" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Lab Address *</label>
              <Input name="labAddress" value={formData.labAddress} onChange={handleChange} placeholder="123 Health Street" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">License Number *</label>
              <Input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="e.g., HPC/LAB/2024/001" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Lab Phone</label>
              <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+233 50 000 0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Staff Name (you) *</label>
              <Input name="staffName" value={formData.staffName} onChange={handleChange} placeholder="Dr. Jane Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Staff Email (login) *</label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="lab@example.com" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
                <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 chars" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm *</label>
                <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? 'Submitting...' : 'Register Lab'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already registered?{' '}
              <Link href="/lab/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
