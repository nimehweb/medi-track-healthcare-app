'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import QRCode from 'qrcode'

interface HealthIdCardProps {
  healthId: string
  patientName?: string
  className?: string
}

export function HealthIdCard({ healthId, patientName, className = '' }: HealthIdCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
          <p className="text-xl font-bold font-mono text-foreground tracking-wider">
            {healthId}
          </p>
          {patientName && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {patientName}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Show this QR code at the lab to retrieve your records
          </p>
        </div>
      </div>
    </Card>
  )
}
