'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, createTestResult } from '@/lib/firestore'
import { getUserByHealthId } from '@/lib/firestore'
import { uploadTestFile, validateTestFile } from '@/lib/storage'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Search, AlertCircle, Check, Loader2, FileText, User } from 'lucide-react'
const TEST_TYPES = [
  'Complete Blood Count',
  'Lipid Profile',
  'Liver Function Test',
  'Kidney Function Test',
  'Thyroid Panel',
  'Blood Glucose',
  'Hemoglobin A1C',
  'Vitamin D Test',
  'Iron Studies',
  'Urinalysis',
  'COVID-19 Test',
  'Malaria Test',
  'Typhoid Test',
  'Pregnancy Test',
  'HIV Test',
  'Other',
]

export default function LabUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [authorized, setAuthorized] = useState(false)
  const [labId, setLabId] = useState<string | null>(null)

  const [patientQuery, setPatientQuery] = useState(searchParams.get('healthId') || '')
  const [patient, setPatient] = useState<any>(null)
  const [patientSearching, setPatientSearching] = useState(false)
  const [patientError, setPatientError] = useState<string | null>(null)

  const [testName, setTestName] = useState('')
  const [testType, setTestType] = useState('')
  const [resultValues, setResultValues] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/lab/login'); return }
      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') { router.push('/lab/login'); return }
      setLabId(profile.labId || null)
      setAuthorized(true)
    })
    return () => unsub()
  }, [router])

  const handlePatientSearch = async () => {
    if (!patientQuery.trim()) return
    setPatientSearching(true)
    setPatientError(null)
    setPatient(null)

    const result = await getUserByHealthId(patientQuery.trim().toUpperCase())

    if (result.data) {
      setPatient(result.data)
    } else {
      setPatientError('Patient not found. Verify the Health ID.')
    }
    setPatientSearching(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const err = validateTestFile(selected)
    if (err) { setPatientError(err); setFile(null); return }
    setFile(selected)
    setPatientError(null)
  }

  const handleSend = async () => {
    if (!labId || !patient || (!testName && !testType)) return

    setSending(true)
    setResult(null)

    let pdfUrl: string | undefined

    if (file) {
      const { url, error: uploadError } = await uploadTestFile(patient.id, file)
      if (uploadError || !url) {
        setResult({ success: false, error: uploadError || 'Upload failed' })
        setSending(false)
        return
      }
      pdfUrl = url
    }

    const { id, error: createError } = await createTestResult({
      patientId: patient.id,
      patientHealthId: patient.healthId,
      labId,
      testName: testName || testType,
      testType,
      status: 'ready',
      results: resultValues ? { value: resultValues } : undefined,
      pdfUrl,
    })

    if (createError) {
      setResult({ success: false, error: createError })
    } else {
      setResult({ success: true })

      // Reset form
      setTimeout(() => {
        setTestName('')
        setTestType('')
        setResultValues('')
        setFile(null)
        setResult(null)
        setPatient(null)
        setPatientQuery('')
      }, 3000)
    }
    setSending(false)
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
        <h1 className="text-3xl font-bold text-foreground">Upload Test Result</h1>
        <p className="text-muted-foreground mt-1">Send test results to a patient instantly</p>
      </div>

      {/* Step 1: Find Patient */}
      <Card className="p-6">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
          Find Patient
        </h2>

        <div className="flex gap-3">
          <Input
            value={patientQuery}
            onChange={(e) => setPatientQuery(e.target.value)}
            placeholder="Enter Patient Health ID (e.g., MT-A7K9B2X)"
            onKeyDown={(e) => e.key === 'Enter' && handlePatientSearch()}
          />
          <Button onClick={handlePatientSearch} disabled={patientSearching} variant="outline" className="gap-2">
            {patientSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            Search
          </Button>
        </div>

        {patientError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{patientError}</AlertDescription>
          </Alert>
        )}

        {patient && (
          <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg flex items-center gap-3">
            <Check className="size-5 text-accent" />
            <div>
              <p className="font-medium text-foreground">{patient.name}</p>
              <p className="text-sm text-muted-foreground font-mono">{patient.healthId}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Step 2: Test Details */}
      <Card className="p-6">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
          Test Details
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Test Type</Label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
            >
              <option value="">Select test type...</option>
              {TEST_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Test Name (if different)</Label>
            <Input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g., Fasting Blood Sugar"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Result Values (optional)</Label>
            <textarea
              value={resultValues}
              onChange={(e) => setResultValues(e.target.value)}
              placeholder="e.g., Glucose: 95 mg/dL, Cholesterol: 180 mg/dL"
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm min-h-[80px]"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Upload PDF (optional)</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition"
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="size-5 text-primary" />
                  <span className="text-sm text-foreground">{file.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="size-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload result PDF or image</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
          </div>
        </div>
      </Card>

      {/* Send */}
      {result?.success && (
        <Alert className="bg-accent/10 border-accent/20">
          <Check className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent">Result sent to patient successfully!</AlertDescription>
        </Alert>
      )}

      {result?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleSend}
        disabled={!patient || (!testName && !testType) || sending || result?.success}
        className="w-full bg-primary hover:bg-primary/90 py-6 text-lg gap-3"
      >
        {sending ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Sending to Patient...
          </>
        ) : (
          <>
            <Upload className="size-5" />
            Send to Patient
          </>
        )}
      </Button>
    </div>
  )
}
