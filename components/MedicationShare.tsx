'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Share2, Loader2, Check, MessageSquare, FileText } from 'lucide-react'
import { generatePharmacistSummary, isGeminiAvailable } from '@/lib/gemini'
import { toast } from 'sonner'

interface MedicationShareProps {
  medications: Array<{ name: string; dosage: string; frequency: string }>
}

export function MedicationShare({ medications }: MedicationShareProps) {
  const [generating, setGenerating] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  const handleGenerateSummary = async () => {
    if (medications.length === 0) {
      toast.error('No medications to share')
      return
    }

    setGenerating(true)
    try {
      const medNames = medications.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`)
      const result = await generatePharmacistSummary(medNames, [])
      setSummary(result)
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate summary')
    } finally {
      setGenerating(false)
    }
  }

  const handleShareWhatsApp = () => {
    if (!summary) return
    const text = encodeURIComponent(summary)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleCopyText = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary)
    toast.success('Copied to clipboard')
  }

  const handlePrint = () => {
    if (!summary) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Medication Summary</title>
      <style>body{font-family:sans-serif;padding:40px;line-height:1.6}</style>
      </head><body>
      <h1>Medication Summary</h1>
      <pre style="white-space:pre-wrap">${summary}</pre>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="size-5 text-primary" />
        <div>
          <h3 className="font-bold text-foreground">Share Medication Summary</h3>
          <p className="text-sm text-muted-foreground">
            Generate and share a summary with your pharmacist
          </p>
        </div>
      </div>

      {!summary ? (
        <Button
          onClick={handleGenerateSummary}
          disabled={generating || medications.length === 0}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {generating ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="size-4 mr-2" />
              Generate Summary
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-sm text-foreground leading-relaxed max-h-48 overflow-y-auto">
            {summary}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleShareWhatsApp}
              variant="outline"
              className="flex-1 gap-2"
            >
              <MessageSquare className="size-4" />
              WhatsApp
            </Button>
            <Button
              onClick={handleCopyText}
              variant="outline"
              className="flex-1 gap-2"
            >
              <FileText className="size-4" />
              Copy
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 gap-2"
            >
              <FileText className="size-4" />
              Print
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setSummary(null)}
          >
            Regenerate
          </Button>
        </div>
      )}

      {!isGeminiAvailable() && medications.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Set NEXT_PUBLIC_GEMINI_API_KEY for AI-generated summaries
        </p>
      )}
    </Card>
  )
}
