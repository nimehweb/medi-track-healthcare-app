'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { explainTestResult, isGeminiAvailable } from '@/lib/gemini'
import { AlertCircle, Zap } from 'lucide-react'

interface TestResultCardProps {
  testName: string
  testDate: any
  results?: Record<string, any>
  normalRanges?: Record<string, any>
  cachedExplanation?: string
  onExplanation?: (explanation: string) => void
}

export function TestResultCard({
  testName,
  testDate,
  results = {},
  normalRanges = {},
  cachedExplanation,
  onExplanation,
}: TestResultCardProps) {
  const [explanation, setExplanation] = useState<string>(cachedExplanation || '')
  const [loading, setLoading] = useState(!cachedExplanation && isGeminiAvailable())
  const [error, setError] = useState<string | null>(null)
  const onExplanationRef = useRef(onExplanation)
  onExplanationRef.current = onExplanation

  useEffect(() => {
    if (cachedExplanation) {
      setLoading(false)
      return
    }

    if (!isGeminiAvailable()) {
      setLoading(false)
      return
    }

    const fetchExplanation = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const numericResults = Object.fromEntries(
          Object.entries(results).map(([key, value]) => [
            key,
            typeof value === 'number' ? value : parseFloat(String(value)) || 0,
          ])
        )

        const result = await explainTestResult(testName, numericResults, normalRanges)
        setExplanation(result)
        onExplanationRef.current?.(result)
      } catch (err: any) {
        console.error('Failed to fetch explanation:', err)
        setError(err.message || 'Failed to load AI explanation')
      } finally {
        setLoading(false)
      }
    }

    fetchExplanation()
  }, [testName, results, normalRanges, cachedExplanation])

  return (
    <>
      {/* Test Values Section */}
      <Card className="p-6">
        <h2 className="text-title font-bold text-foreground mb-4">Test Values</h2>
        {Object.keys(results).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="p-4 border border-border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">{key}</p>
                  <p className="text-2xl font-bold text-primary">{String(value)}</p>
                </div>
                {normalRanges?.[key] && (
                  <p className="text-label text-muted-foreground">
                    Normal range: {String(normalRanges[key])}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-body">No test values available</p>
        )}
      </Card>

      {/* AI Explanation Section */}
      <Card className="p-6 border-l-4 border-l-accent bg-accent/5">
        <div className="flex items-start gap-3 mb-4">
          <Zap className="size-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-title font-bold text-foreground">Understanding Your Results</h2>
            {isGeminiAvailable() && (
              <p className="text-label text-muted-foreground">Powered by Gemini AI</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-6">
            <Spinner className="size-5" />
            <span className="text-body">Loading AI explanation...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-body mb-2">Ask your doctor about these results</p>
              <p className="text-label text-muted-foreground">{error}</p>
            </AlertDescription>
          </Alert>
        ) : explanation ? (
          <p className="text-foreground leading-relaxed text-body">{explanation}</p>
        ) : !isGeminiAvailable() ? (
          <p className="text-foreground leading-relaxed text-body">
            Ask your doctor about these results. AI explanations are not currently available.
          </p>
        ) : (
          <p className="text-foreground leading-relaxed text-body">
            These test results measure various aspects of your health. If you have any concerns
            about specific results, please consult with your healthcare provider for a more
            detailed interpretation.
          </p>
        )}
      </Card>
    </>
  )
}
