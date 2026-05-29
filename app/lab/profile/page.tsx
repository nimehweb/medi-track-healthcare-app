'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, getLabByStaffId, updateLab } from '@/lib/firestore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, MapPin, Phone, Mail, Globe, FileText, BadgeCheck, Edit3, Save, X, AlertCircle, Check } from 'lucide-react'

export default function LabProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [labId, setLabId] = useState<string | null>(null)
  const [lab, setLab] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    licenseNumber: '',
  })

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/lab/login'); return }
      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') { router.push('/lab/login'); return }

      if (profile.labId) {
        setLabId(profile.labId)
        const { data: labData } = await getLabByStaffId(user.uid)
        if (labData) {
          setLab(labData)
          setForm({
            name: labData.name || '',
            address: labData.address || '',
            phone: labData.phone || '',
            email: labData.email || '',
            website: labData.website || '',
            licenseNumber: labData.licenseNumber || '',
          })
        }
      }
      setAuthorized(true)
      setLoading(false)
    })
    return () => unsub()
  }, [router])

  const handleSave = async () => {
    if (!labId) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { success: ok, error: saveError } = await updateLab(labId, {
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      website: form.website,
      licenseNumber: form.licenseNumber,
    })

    if (saveError) {
      setError(saveError)
    } else {
      setSuccess(true)
      setLab((prev: any) => ({ ...prev, ...form }))
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  const handleCancel = () => {
    if (lab) {
      setForm({
        name: lab.name || '',
        address: lab.address || '',
        phone: lab.phone || '',
        email: lab.email || '',
        website: lab.website || '',
        licenseNumber: lab.licenseNumber || '',
      })
    }
    setEditing(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lab Profile</h1>
          <p className="text-muted-foreground mt-1">View and manage your hospital details</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
            <Edit3 className="size-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="ghost" className="gap-2">
              <X className="size-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="size-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-accent/10 border-accent/20">
          <Check className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent">Profile updated successfully</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-title font-bold text-foreground mb-6">Hospital Information</h2>
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Hospital Name</Label>
                {editing ? (
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                ) : (
                  <p className="text-foreground flex items-center gap-2"><Building2 className="size-4 text-muted-foreground" />{lab?.name || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Address</Label>
                {editing ? (
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                ) : (
                  <p className="text-foreground flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />{lab?.address || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
                {editing ? (
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                ) : (
                  <p className="text-foreground flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{lab?.phone || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Email</Label>
                {editing ? (
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                ) : (
                  <p className="text-foreground flex items-center gap-2"><Mail className="size-4 text-muted-foreground" />{lab?.email || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Website</Label>
                {editing ? (
                  <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
                ) : (
                  <p className="text-foreground flex items-center gap-2"><Globe className="size-4 text-muted-foreground" />{lab?.website || '—'}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-title font-bold text-foreground mb-4">License</h2>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground block mb-1">License Number</Label>
                {editing ? (
                  <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
                ) : (
                  <p className="text-foreground font-mono text-sm flex items-center gap-2">
                    <BadgeCheck className="size-4 text-accent" />
                    {lab?.licenseNumber || '—'}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground block mb-1">Status</Label>
                <p className="text-sm">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    lab?.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {lab?.status === 'active' ? 'Verified' : 'Pending Approval'}
                  </span>
                </p>
              </div>
              {lab?.licenseDocumentUrl && (
                <div className="pt-3 border-t border-border">
                  <Label className="text-xs text-muted-foreground block mb-2">License Document</Label>
                  <a
                    href={lab.licenseDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <FileText className="size-4" />
                      View License
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
