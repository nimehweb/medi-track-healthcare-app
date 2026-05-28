'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserByHealthId, getUserByPhone, getUserProfile } from '@/lib/firestore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Phone, Fingerprint, User, AlertCircle, Droplets, CheckCircle, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PatientData {
  id: string
  name: string
  phone?: string
  healthId?: string
  bloodType?: string
  allergies?: string[]
  dateOfBirth?: string
  gender?: string
}

export default function LabPatientsPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [query, setQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'healthId' | 'phone'>('healthId')
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/lab/login'); return }
      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') { router.push('/lab/login'); return }
      setAuthorized(true)
    })
    return () => unsub()
  }, [router])

  const handleSearch = async () => {
    if (!query.trim()) return

    setSearching(true)
    setError(null)
    setPatient(null)
    setSearched(true)

    const result = searchMode === 'healthId'
      ? await getUserByHealthId(query.trim().toUpperCase())
      : await getUserByPhone(query.trim())

    if (result.data) {
      setPatient(result.data as PatientData)
    } else {
      setError(result.error || 'Patient not found')
    }
    setSearching(false)
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Find Patient</h1>
        <p className="text-muted-foreground mt-1">Search for a patient to upload or view their records</p>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex gap-2 mb-4">
          <Button
            variant={searchMode === 'healthId' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSearchMode('healthId'); setPatient(null); setError(null) }}
            className="gap-2"
          >
            <Fingerprint className="size-4" />
            Health ID
          </Button>
          <Button
            variant={searchMode === 'phone' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSearchMode('phone'); setPatient(null); setError(null) }}
            className="gap-2"
          >
            <Phone className="size-4" />
            Phone Number
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchMode === 'healthId' ? 'e.g., MT-A7K9B2X' : 'e.g., +233 50 000 0000'}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={searching || !query.trim()} className="bg-primary hover:bg-primary/90">
            <Search className="size-4 mr-2" />
            Search
          </Button>
        </div>

        {searchMode === 'healthId' && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Fingerprint className="size-3" />
            Ask the patient to show their Health ID QR code, or enter the ID manually
          </p>
        )}
      </Card>

      {/* Error */}
      {searched && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Patient Found */}
      {patient && (
        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-full">
              <CheckCircle className="size-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Patient Found</h2>
              <p className="text-sm text-muted-foreground">Identity confirmed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
              <p className="font-medium text-foreground flex items-center gap-2">
                <User className="size-4 text-primary" />
                {patient.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Health ID</p>
              <p className="font-mono font-bold text-foreground">{patient.healthId}</p>
            </div>
            {patient.phone && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                <p className="text-foreground">{patient.phone}</p>
              </div>
            )}
            {patient.bloodType && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Blood Type</p>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Droplets className="size-4 text-red-500" />
                  {patient.bloodType}
                </p>
              </div>
            )}
            {patient.dateOfBirth && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-foreground">{patient.dateOfBirth}</p>
              </div>
            )}
            {patient.allergies && patient.allergies.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Allergies</p>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.filter(Boolean).map((a, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => router.push(`/lab/upload?patientId=${patient.id}&healthId=${patient.healthId}`)}
            >
              <Upload className="size-4" />
              Upload Result
            </Button>
          </div>
        </Card>
      )}

      {!patient && !searched && (
        <Card className="p-12 text-center">
          <Search className="size-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">
            Search for a patient using their Health ID or phone number
          </p>
        </Card>
      )}
    </div>
  )
}
