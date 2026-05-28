'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import QRCode from 'qrcode'

interface HealthIdCardProps {
  healthId: string
  patientName?: string
  className?: string
}

export function HealthIdCard({ healthId, patientName, className = '' }: HealthIdCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (canvasRef.current && healthId) {
      QRCode.toCanvas(
        canvasRef.current,
        healthId,
        {
          width: 120,
          margin: 2,
          color: { dark: '#1a1a2e', light: '#ffffff' },
        },
      )
    }
  }, [healthId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(healthId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = healthId
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0">
          <canvas ref={canvasRef} className="rounded-md" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Patient Health ID
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold font-mono text-foreground tracking-wider">
              {healthId}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
              title="Copy Health ID"
            >
              {copied ? (
                <Check className="size-4 text-accent" />
              ) : (
                <Copy className="size-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {patientName && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {patientName}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Show this QR code at the lab or share your Health ID to receive results
          </p>
        </div>
      </div>
    </Card>
  )
}
