'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, getTestResultById, updateTestResult } from '@/lib/firestore'
import { uploadTestFile, validateTestFile, deleteTestFile } from '@/lib/storage'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, AlertCircle, Check, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LabEditResultPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [authorized, setAuthorized] = useState(false)
  const [labId, setLabId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [testName, setTestName] = useState('')
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | undefined>()
  const [file, setFile] = useState<File | null>(null)
  const [patientId, setPatientId] = useState<string>('')

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/lab/login'); return }
      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') { router.push('/lab/login'); return }
      setLabId(profile.labId || null)

      const { data: result } = await getTestResultById(testId)
      if (result) {
        const r = result as any
        setTestName(r.testName || '')
        setOriginalPdfUrl(r.pdfUrl)
        setPatientId(r.patientId || '')
      }
      setAuthorized(true)
      setLoading(false)
    })
    return () => unsub()
  }, [router, testId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const err = validateTestFile(selected)
    if (err) { setError(err); setFile(null); return }
    setFile(selected)
    setError(null)
  }

  const handleSave = async () => {
    if (!testName) { setError('Test name is required'); return }
    setSaving(true)
    setError(null)

    try {
      let pdfUrl = originalPdfUrl

      if (file) {
        const { url, error: uploadError } = await uploadTestFile(patientId, file)
        if (uploadError || !url) {
          setError(uploadError || 'File upload failed')
          setSaving(false)
          return
        }
        if (originalPdfUrl) {
          await deleteTestFile(originalPdfUrl).catch(() => {})
        }
        pdfUrl = url
      }

      const updateData: Record<string, any> = { testName }
      if (pdfUrl) updateData.pdfUrl = pdfUrl

      const { success: ok, error: saveError } = await updateTestResult(testId, updateData)
      if (saveError) {
        setError(saveError)
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/lab/history'), 2000)
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred')
    }
    setSaving(false)
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
      <div>
        <Link href="/lab/history" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
          <ArrowLeft className="size-4" />
          Back to History
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Edit Test Result</h1>
        <p className="text-muted-foreground mt-1">Update test details or replace the uploaded file</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Test Name *</Label>
            <Input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g., Complete Blood Count" />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Upload New File {originalPdfUrl ? '(leave empty to keep current)' : ''}
            </Label>
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
                  <p className="text-sm text-muted-foreground">
                    {originalPdfUrl ? 'Click to replace current file' : 'Upload result PDF or image'}
                  </p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} className="hidden" />
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
              <AlertDescription className="text-accent">Test result updated! Returning to history...</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => router.push('/lab/history')} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || success} className="gap-2">
              {saving ? (
                <><Loader2 className="size-4 animate-spin" /> Saving...</>
              ) : (
                <><Check className="size-4" /> Save Changes</>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
