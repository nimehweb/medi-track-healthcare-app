'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Copy, Check, Share2, Mail, MessageCircle } from 'lucide-react'
import QRCode from 'qrcode'
import { toast } from 'sonner'

interface HealthIdCardProps {
  healthId: string
  patientName?: string
  className?: string
}

export function HealthIdCard({ healthId, patientName, className = '' }: HealthIdCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

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

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(healthId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Health ID copied to clipboard')
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = healthId
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Health ID copied to clipboard')
    }
  }

  const handleShareCopy = async () => {
    const message = `My MediTrack Health ID: ${healthId}\n\nUse this ID at the hospital to access my medical records.`
    try {
      await navigator.clipboard.writeText(message)
      toast.success('Health ID and message copied')
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = message
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Health ID and message copied')
    }
    setShareOpen(false)
  }

  const handleShareEmail = () => {
    const subject = encodeURIComponent('My MediTrack Health ID')
    const body = encodeURIComponent(
      `Hi,\n\nHere is my MediTrack Health ID: ${healthId}\n\nPlease use this ID to access my medical records.\n\nThank you.`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    setShareOpen(false)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `My MediTrack Health ID: ${healthId} — Use this at the hospital to access my records.`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShareOpen(false)
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
              onClick={handleCopyId}
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
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              Show this QR code at the hospital or share your Health ID
            </p>
            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                  <Share2 className="size-3.5" />
                  <span className="text-xs">Share</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Share Your Health ID</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Share your Health ID with a hospital to receive test results
                  </p>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-lg font-bold font-mono text-foreground">{healthId}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-4"
                      onClick={handleShareCopy}
                    >
                      <Copy className="size-5" />
                      <span className="text-xs">Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-4"
                      onClick={handleShareEmail}
                    >
                      <Mail className="size-5" />
                      <span className="text-xs">Email</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-4"
                      onClick={handleShareWhatsApp}
                    >
                      <MessageCircle className="size-5" />
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  )
}
