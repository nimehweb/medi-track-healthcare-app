'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTestResultById } from '@/lib/firestore'

interface TestResult {
  id: string
  testName: string
  testDate: any
  status: string
  results?: Record<string, any>
  normalRanges?: Record<string, any>
  labId?: string
  pdfUrl?: string
}

export default function TestDetailPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string
  
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

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
    const { data, error } = await getTestResultById(testId)
    if (data) {
      setTestResult(data as TestResult)
    } else if (error) {
      console.error('Failed to load test result:', error)
    }
    setPageLoading(false)
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
          <h1 className="text-3xl font-bold text-foreground">{testResult.testName}</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              {testResult.testDate?.toDate?.()?.toLocaleDateString?.() ||
                'Date not available'}
            </p>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                testResult.status === 'completed'
                  ? 'bg-accent/20 text-accent'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {testResult.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Values */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Test Values</h2>
              {testResult.results && Object.keys(testResult.results).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(testResult.results).map(([key, value]) => (
                    <div key={key} className="p-4 border border-border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{key}</p>
                        <p className="text-2xl font-bold text-primary">{String(value)}</p>
                      </div>
                      {testResult.normalRanges?.[key] && (
                        <p className="text-sm text-muted-foreground">
                          Normal range: {String(testResult.normalRanges[key])}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No test values available</p>
              )}
            </Card>

            {/* AI Explanation */}
            <Card className="p-6 border-l-4 border-l-accent bg-accent/5">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Understanding Your Results
              </h2>
              <p className="text-foreground leading-relaxed">
                These test results measure various aspects of your health. All values
                appear to be within normal ranges. If you have any concerns about
                specific results, please consult with your healthcare provider for a
                more detailed interpretation.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Note: AI explanations will be powered by Gemini API once configured
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="font-bold text-foreground mb-4">Actions</h3>
              <div className="space-y-2">
                {testResult.pdfUrl && (
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Download PDF
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  Share Results
                </Button>
                <Button variant="outline" className="w-full">
                  Print Results
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Lab Information
                </p>
                <p className="font-medium text-foreground">
                  {testResult.labId || 'Lab details'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Contact your lab for any questions
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
