'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, getTestResultsByLab, getLabById, getAppointmentsByLab, approveAppointment, rejectAppointment } from '@/lib/firestore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Search, Clock, Activity, ArrowUpRight, Calendar, Check, X, AlertCircle, Loader2 } from 'lucide-react'

export default function LabDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, ready: 0, recent: [] as any[] })
  const [labName, setLabName] = useState('')
  const [labId, setLabId] = useState<string | null>(null)
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/lab/login'); return }
      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') { router.push('/lab/login'); return }

      setLabName(profile.name || 'Lab')

      if (profile.labId) {
        setLabId(profile.labId)
        const { data: results } = await getTestResultsByLab(profile.labId)
        if (results) {
          setStats({
            total: results.length,
            pending: results.filter((r) => r.status === 'pending').length,
            ready: results.filter((r) => r.status === 'ready').length,
            recent: results.sort((a, b) => b.uploadedAt?.toMillis?.() - a.uploadedAt?.toMillis?.()).slice(0, 5),
          })
        }
        const { data: appointments } = await getAppointmentsByLab(profile.labId)
        if (appointments) {
          setPendingAppointments(appointments.filter((a: any) => a.status === 'pending'))
        }
      }
      setLoading(false)
    })
    return () => unsub()
  }, [router])

  const handleApprove = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    setActionError(null)
    const { error } = await approveAppointment(appointmentId)
    if (error) {
      setActionError(error)
    } else {
      setPendingAppointments((prev) => prev.filter((a) => a.id !== appointmentId))
    }
    setActionLoading(null)
  }

  const handleReject = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    setActionError(null)
    const { error } = await rejectAppointment(appointmentId)
    if (error) {
      setActionError(error)
    } else {
      setPendingAppointments((prev) => prev.filter((a) => a.id !== appointmentId))
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {labName}</h1>
        <p className="text-muted-foreground mt-1">Manage patient test results and hospital operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Uploads</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <Activity className="size-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Test Results Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <Clock className="size-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ready for Patients</p>
              <p className="text-3xl font-bold text-accent mt-1">{stats.ready}</p>
            </div>
            <Upload className="size-8 text-accent" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{pendingAppointments.length}</p>
            </div>
            <Calendar className="size-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/lab/upload">
          <Card className="p-6 hover:shadow-md transition cursor-pointer border-primary/20 hover:border-primary">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Upload className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Upload Test Result</h3>
                <p className="text-sm text-muted-foreground">Send results to patients instantly</p>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground ml-auto" />
            </div>
          </Card>
        </Link>
        <Link href="/lab/patients">
          <Card className="p-6 hover:shadow-md transition cursor-pointer border-primary/20 hover:border-primary">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Search className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Find Patient</h3>
                <p className="text-sm text-muted-foreground">Search by Health ID or phone number</p>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground ml-auto" />
            </div>
          </Card>
        </Link>
        <Link href="/lab/appointments">
          <Card className="p-6 hover:shadow-md transition cursor-pointer border-primary/20 hover:border-primary">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Schedule Appointment</h3>
                <p className="text-sm text-muted-foreground">Create or manage patient appointments</p>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground ml-auto" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Pending Approvals */}
      {actionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {pendingAppointments.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Pending Appointment Approvals</h2>
            <Link href="/lab/appointments">
              <Button variant="ghost" size="sm">Manage All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pendingAppointments.slice(0, 5).map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{apt.testType || 'Appointment'}</p>
                  <p className="text-xs text-muted-foreground">
                    {apt.appointmentDate?.toDate?.()?.toLocaleString?.() || 'Date not set'}
                  </p>
                  <p className="text-xs text-muted-foreground">Patient: {apt.patientId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-accent border-accent hover:bg-accent/10"
                    onClick={() => handleApprove(apt.id)}
                    disabled={actionLoading === apt.id}
                  >
                    {actionLoading === apt.id ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => handleReject(apt.id)}
                    disabled={actionLoading === apt.id}
                  >
                    <X className="size-3" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Uploads */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Uploads</h2>
          <Link href="/lab/history">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {stats.recent.length > 0 ? (
          <div className="space-y-3">
            {stats.recent.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div>
                  <p className="font-medium text-foreground">{r.testName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.uploadedAt?.toDate?.()?.toLocaleString?.() || 'Recently'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  r.status === 'ready' ? 'bg-accent/20 text-accent' : 'bg-yellow-100 text-yellow-700'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="size-8 mx-auto mb-2 opacity-50" />
            <p>No uploads yet. Upload your first test result.</p>
            <Link href="/lab/upload">
              <Button variant="outline" className="mt-4">Upload Result</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
