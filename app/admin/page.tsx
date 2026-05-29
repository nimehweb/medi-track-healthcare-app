'use client'

import { useEffect, useState } from 'react'
import { getLabs, getLabById } from '@/lib/firestore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Check, X, AlertCircle, Loader2, ExternalLink, Shield, Clock } from 'lucide-react'

interface LabEntry {
  id: string
  name: string
  address: string
  licenseNumber: string
  licenseDocumentUrl?: string
  phone?: string
  email?: string
  status: string
  createdAt?: any
}

export default function AdminDashboard() {
  const [labs, setLabs] = useState<LabEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadLabs()
  }, [])

  const loadLabs = async () => {
    setLoading(true)
    const { data } = await getLabs()
    if (data) {
      const inactive = data
        .filter((l) => l.status === 'inactive')
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0
          const bTime = b.createdAt?.toMillis?.() || 0
          return bTime - aTime
        })
      setLabs(inactive as LabEntry[])
    }
    setLoading(false)
  }

  const handleApprove = async (lab: LabEntry) => {
    setActionLoading(lab.id!)
    setActionError(null)

    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labId: lab.id, userEmail: lab.email }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Approval failed')
      }
      setLabs((prev) => prev.filter((l) => l.id !== lab.id))
    } catch (err: any) {
      setActionError(err.message)
    }
    setActionLoading(null)
  }

  const handleReject = async (lab: LabEntry) => {
    setActionLoading(lab.id!)
    setActionError(null)

    try {
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labId: lab.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Rejection failed')
      }
      setLabs((prev) => prev.filter((l) => l.id !== lab.id))
    } catch (err: any) {
      setActionError(err.message)
    }
    setActionLoading(null)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently'
    const date = timestamp.toDate?.()
    if (!date) return 'Recently'
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pending Registrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve hospital registration requests
        </p>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {labs.length > 0 ? (
        <div className="space-y-4">
          {labs.map((lab) => (
            <Card key={lab.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="size-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{lab.name}</h3>
                      <p className="text-xs text-muted-foreground">{lab.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">License</p>
                      <p className="text-sm font-mono text-foreground">{lab.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                      <p className="text-sm text-foreground truncate">{lab.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Phone</p>
                      <p className="text-sm text-foreground">{lab.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Registered</p>
                      <p className="text-sm text-foreground">{formatDate(lab.createdAt)}</p>
                    </div>
                  </div>

                  {lab.licenseDocumentUrl && (
                    <a
                      href={lab.licenseDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary underline underline-offset-2 hover:opacity-80 transition"
                    >
                      <ExternalLink className="size-3" />
                      View License Document
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-accent border-accent hover:bg-accent/10"
                    onClick={() => handleApprove(lab)}
                    disabled={actionLoading === lab.id}
                  >
                    {actionLoading === lab.id ? (
                      <Loader2 className="size-3.5 animate-spin mr-1" />
                    ) : (
                      <Check className="size-3.5 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => handleReject(lab)}
                    disabled={actionLoading === lab.id}
                  >
                    <X className="size-3.5 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Shield className="size-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-1">No Pending Registrations</p>
          <p className="text-sm text-muted-foreground">
            All hospital registration requests have been reviewed.
          </p>
        </Card>
      )}
    </div>
  )
}
