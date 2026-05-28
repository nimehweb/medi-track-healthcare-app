'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { getDrugInfo, isGeminiAvailable } from '@/lib/gemini'
import { AlertCircle, Pill } from 'lucide-react'

interface MedicationInfoCardProps {
  name: string
  dosage: string
  frequency: string
  prescribedBy?: string
  cachedInfo?: string
}

export function MedicationInfoCard({
  name,
  dosage,
  frequency,
  prescribedBy,
  cachedInfo,
}: MedicationInfoCardProps) {
  const [info, setInfo] = useState<string>(cachedInfo || '')
  const [loading, setLoading] = useState(!cachedInfo && isGeminiAvailable())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedInfo || !isGeminiAvailable()) {
      setLoading(false)
      return
    }

    const fetchDrugInfo = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getDrugInfo(name)
        setInfo(result)
      } catch (err: any) {
        console.error('Failed to fetch drug info:', err)
        setError(err.message || 'Failed to load medication information')
      } finally {
        setLoading(false)
      }
    }

    fetchDrugInfo()
  }, [name, cachedInfo])

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <Pill className="size-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-title font-bold text-foreground">{name}</h3>
          <p className="text-label text-muted-foreground">
            {dosage} • {frequency}
          </p>
          {prescribedBy && (
            <p className="text-label text-muted-foreground mt-1">
              Prescribed by: {prescribedBy}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Spinner className="size-5" />
            <span className="text-body">Loading medication information...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-label">Could not load medication details</p>
              <p className="text-label text-muted-foreground mt-1">
                Please consult with your pharmacist
              </p>
            </AlertDescription>
          </Alert>
        ) : info ? (
          <div className="space-y-3 text-body text-foreground">
            {info.split('\n').filter(Boolean).map((line, idx) => (
              <p key={idx} className="leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-body text-muted-foreground">
            Please consult with your pharmacist for detailed medication information.
          </p>
        )}
      </div>
    </Card>
  )
}
