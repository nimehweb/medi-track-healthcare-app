'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { getTestResultById, updateTestResult, getLabById } from '@/lib/firestore'
import { TestResultCard } from '@/components/TestResultCard'
import { MedicationInfoCard } from '@/components/MedicationInfoCard'
import { FileText, Share2, Printer, AlertCircle, FileImage, Building2, Phone, MapPin } from 'lucide-react'

interface TestResult {
  id: string
  testName: string
  testDate?: any
  uploadedAt?: any
  status: string
  results?: Record<string, any>
  normalRanges?: Record<string, any>
  labId?: string
  pdfUrl?: string
  explanation?: string
  medications?: Array<{
    id?: string
    name: string
    dosage: string
    frequency: string
    prescribedBy?: string
    drugInfo?: string
  }>
}

export default function TestDetailPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string
  
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingExplanation, setSavingExplanation] = useState(false)
  const [labInfo, setLabInfo] = useState<{ name: string; address?: string; phone?: string; email?: string } | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && testId) {
      loadTestResult()
    }
  }, [user, loading, isAuthenticated, testId, router])

  const loadTestResult = async () => {
    try {
      setPageLoading(true)
      setError(null)
      const { data, error: loadError } = await getTestResultById(testId)
      if (data) {
        setTestResult(data as unknown as TestResult)
        const labId = (data as any).labId
        if (labId && labId !== 'manual-upload') {
          const { data: lab } = await getLabById(labId)
          if (lab) {
            setLabInfo({ name: lab.name, address: lab.address, phone: lab.phone, email: lab.email })
          }
        }
      } else if (loadError) {
        console.error('Failed to load test result:', loadError)
        setError(loadError)
      }
    } catch (err: any) {
      console.error('Error loading test result:', err)
      setError('Failed to load test result')
    } finally {
      setPageLoading(false)
    }
  }

  const handlePrintPDF = () => {
    if (testResult?.pdfUrl) {
      window.open(testResult.pdfUrl, '_blank')
    } else {
      // Fallback: print the page
      window.print()
    }
  }

  const handleShareResults = async () => {
    if (navigator.share) {
      try {
        const shareUrl = `${window.location.origin}/test-results/${testId}`
        await navigator.share({
          title: `${testResult?.testName} Results`,
          text: `View my test results from ${testResult?.testDate?.toDate?.()?.toLocaleDateString?.() || 'today'}`,
          url: shareUrl,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      const shareUrl = `${window.location.origin}/test-results/${testId}`
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  const cacheExplanation = async (explanation: string) => {
    try {
      setSavingExplanation(true)
      await updateTestResult(testId, { explanation })
      setTestResult((prev) => (prev ? { ...prev, explanation } : null))
    } catch (err) {
      console.error('Failed to cache explanation:', err)
    } finally {
      setSavingExplanation(false)
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!testResult) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <p className="text-foreground text-lg font-medium">
              Test result not found
            </p>
            <Link href="/test-results">
              <Button variant="outline" className="mt-4">
                Back to Results
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/test-results">
            <Button variant="ghost" className="mb-4">
              &larr; Back to Results
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">{testResult.testName}</h1>
          <div className="flex items-center gap-4 mt-3">
            <p className="text-label text-muted-foreground">
              {testResult.testDate?.toDate?.()?.toLocaleDateString?.() ||
                'Date not available'}
            </p>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                testResult.status === 'viewed' || testResult.status === 'ready'
                  ? 'bg-accent/20 text-accent'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {testResult.status === 'viewed' ? 'Viewed' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TestResultCard
              testName={testResult.testName}
              testDate={testResult.testDate}
              results={testResult.results}
              normalRanges={testResult.normalRanges}
              cachedExplanation={testResult.explanation}
              onExplanation={cacheExplanation}
            />

            {/* File Viewer - PDF or Image */}
            {testResult.pdfUrl && (
              <FileViewer url={testResult.pdfUrl} />
            )}

            {/* Medications Section */}
            {testResult.medications && testResult.medications.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-title font-bold text-foreground">Recommended Medications</h2>
                {testResult.medications.map((med, idx) => (
                  <MedicationInfoCard
                    key={med.id || idx}
                    name={med.name}
                    dosage={med.dosage}
                    frequency={med.frequency}
                    prescribedBy={med.prescribedBy}
                    cachedInfo={med.drugInfo}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-title font-bold text-foreground mb-4">Actions</h3>
              <div className="space-y-2">
                {testResult.pdfUrl && (
                  <Button
                    onClick={handlePrintPDF}
                    className="w-full bg-primary hover:bg-primary/90 gap-2"
                  >
                    <FileText className="size-4" />
                    Download PDF
                  </Button>
                )}
                <Button variant="outline" className="w-full gap-2" onClick={handleShareResults}>
                  <Share2 className="size-4" />
                  Share Results
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handlePrintPDF}>
                  <Printer className="size-4" />
                  Print Results
                </Button>
              </div>

              {/* Lab Information */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-label text-muted-foreground mb-3">Lab Information</p>
                {labInfo ? (
                  <div className="space-y-2">
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground shrink-0" />
                      {labInfo.name}
                    </p>
                    {labInfo.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        {labInfo.address}
                      </p>
                    )}
                    {labInfo.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="size-4 shrink-0" />
                        {labInfo.phone}
                      </p>
                    )}
                  </div>
                ) : testResult.labId && testResult.labId !== 'manual-upload' ? (
                  <p className="text-sm text-muted-foreground">Loading lab details...</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Manually uploaded by patient</p>
                )}
                <p className="text-label text-muted-foreground mt-3">
                  Contact your lab for any questions about these results
                </p>
              </div>

              {/* Tips Section */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-label font-medium text-foreground mb-3">Tips</p>
                <ul className="space-y-2 text-label text-muted-foreground">
                  <li>• Review results with your doctor</li>
                  <li>• Keep a copy for your records</li>
                  <li>• Ask about follow-up tests if needed</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function FileViewer({ url }: { url: string }) {
  const pathname = new URL(url).pathname.toLowerCase()
  const isPdf = pathname.endsWith('.pdf')
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(pathname)

  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)

  return (
    <Card className="p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        {isImage ? (
          <FileImage className="size-5 text-primary" />
        ) : (
          <FileText className="size-5 text-primary" />
        )}
        <h2 className="text-title font-bold text-foreground">Uploaded Report</h2>
      </div>

      {loading && !loadError && (
        <div className="w-full h-[300px] flex items-center justify-center bg-muted rounded border border-border animate-pulse">
          <p className="text-muted-foreground text-body">Loading report...</p>
        </div>
      )}

      {loadError ? (
        <div className="text-center py-8">
          <AlertCircle className="size-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-body text-muted-foreground mb-2">Could not load the report file</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline text-sm"
          >
            Open directly in browser instead
          </a>
        </div>
      ) : isPdf ? (
        <iframe
          src={url}
          className="w-full h-[500px] rounded border border-border"
          title="Test Result PDF"
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => setLoading(false)}
          onError={() => { setLoadError(true); setLoading(false) }}
          style={loading ? { display: 'none' } : undefined}
        />
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt="Test Result"
            className="w-full rounded border border-border cursor-pointer hover:opacity-90 transition"
            loading="lazy"
            onLoad={() => setLoading(false)}
            onError={() => { setLoadError(true); setLoading(false) }}
            style={loading ? { display: 'none' } : undefined}
          />
        </a>
      )}

      {!loadError && (
        <p className="text-label text-muted-foreground mt-2 text-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Open in new tab
          </a>
        </p>
      )}
    </Card>
  )
}
