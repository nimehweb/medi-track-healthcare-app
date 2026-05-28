'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, getUserByHealthId, getAppointmentsByLab, createAppointment, approveAppointment, rejectAppointment } from '@/lib/firestore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Check, X, Loader2, AlertCircle, Calendar, User, Clock } from 'lucide-react'

export default function LabAppointmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [labId, setLabId] = useState<string | null>(null)

  // Tab state
  const [tab, setTab] = useState<'pending' | 'schedule'>('pending')

  // Pending appointments
  const [appointments, setAppointments] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [apptError, setApptError] = useState<string | null>(null)

  // Schedule new
  const [patientQuery, setPatientQuery] = useState('')
  const [patient, setPatient] = useState<any>(null)
  const [patientSearching, setPatientSearching] = useState(false)
  const [patientError, setPatientError] = useState<string | null>(null)
  const [testType, setTestType] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [notes, setNotes] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [scheduleResult, setScheduleResult] = useState<{ success: boolean; error?: string } | null>(null)

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/lab/login'); return }
      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') { router.push('/lab/login'); return }
      setLabId(profile.labId || null)
      setAuthorized(true)
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    if (!authorized || !labId) return
    loadAppointments()
  }, [authorized, labId])

  const loadAppointments = async () => {
    if (!labId) return
    const { data } = await getAppointmentsByLab(labId)
    if (data) {
      setAppointments(data)
    }
    setLoading(false)
  }

  const handleApprove = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    setApptError(null)
    const { error } = await approveAppointment(appointmentId)
    if (error) {
      setApptError(error)
    } else {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'confirmed' } : a))
      )
    }
    setActionLoading(null)
  }

  const handleReject = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    setApptError(null)
    const { error } = await rejectAppointment(appointmentId)
    if (error) {
      setApptError(error)
    } else {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'rejected' } : a))
      )
    }
    setActionLoading(null)
  }

  const handlePatientSearch = async () => {
    if (!patientQuery.trim()) return
    setPatientSearching(true)
    setPatientError(null)
    setPatient(null)
    const result = await getUserByHealthId(patientQuery.trim().toUpperCase())
    if (result.data) {
      setPatient(result.data)
    } else {
      setPatientError('Patient not found. Verify the Health ID.')
    }
    setPatientSearching(false)
  }

  const handleSchedule = async () => {
    if (!labId || !patient || !appointmentDate) return

    setScheduling(true)
    setScheduleResult(null)

    const appointmentDateTime = new Date(appointmentDate)
    const { error } = await createAppointment({
      patientId: patient.id,
      patientHealthId: patient.healthId,
      labId,
      testType: testType || 'General Checkup',
      appointmentDate: appointmentDateTime,
      status: 'confirmed',
      createdBy: 'lab',
      notes: notes || 'Scheduled by lab',
    })

    if (error) {
      setScheduleResult({ success: false, error })
    } else {
      setScheduleResult({ success: true })
      setTimeout(() => {
        setPatientQuery('')
        setPatient(null)
        setTestType('')
        setAppointmentDate('')
        setNotes('')
        setScheduleResult(null)
        setTab('pending')
        loadAppointments()
      }, 3000)
    }
    setScheduling(false)
  }

  const pendingAppts = appointments.filter((a) => a.status === 'pending')
  const confirmedAppts = appointments.filter((a) => a.status === 'confirmed')
  const otherAppts = appointments.filter((a) => a.status !== 'pending' && a.status !== 'confirmed')

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground mt-1">Manage patient appointments and approvals</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
            tab === 'pending'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Pending Approval ({pendingAppts.length})
        </button>
        <button
          onClick={() => setTab('schedule')}
          className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
            tab === 'schedule'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Schedule New
        </button>
      </div>

      {apptError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apptError}</AlertDescription>
        </Alert>
      )}

      {/* Tab: Pending Approval */}
      {tab === 'pending' && (
        <div className="space-y-6">
          {/* Pending */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Awaiting Approval</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingAppts.length > 0 ? (
              <div className="space-y-3">
                {pendingAppts.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{apt.testType || 'Appointment'}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {apt.appointmentDate?.toDate?.()?.toLocaleString?.() || 'Date not set'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Patient ID: {apt.patientId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-accent border-accent hover:bg-accent/10"
                        onClick={() => handleApprove(apt.id)}
                        disabled={actionLoading === apt.id}
                      >
                        {actionLoading === apt.id ? (
                          <Loader2 className="size-3 animate-spin mr-1" />
                        ) : (
                          <Check className="size-3 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(apt.id)}
                        disabled={actionLoading === apt.id}
                      >
                        <X className="size-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No pending appointment requests</p>
            )}
          </Card>

          {/* Confirmed */}
          {confirmedAppts.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Confirmed ({confirmedAppts.length})</h2>
              <div className="space-y-3">
                {confirmedAppts.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div>
                      <p className="font-medium text-foreground">{apt.testType || 'Appointment'}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.appointmentDate?.toDate?.()?.toLocaleString?.() || 'Date not set'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">Confirmed</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Rejected / Other */}
          {otherAppts.filter((a) => a.status === 'rejected').length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Rejected</h2>
              <div className="space-y-3">
                {otherAppts.filter((a) => a.status === 'rejected').map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 border border-border rounded-md opacity-70">
                    <div>
                      <p className="font-medium text-foreground">{apt.testType || 'Appointment'}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.appointmentDate?.toDate?.()?.toLocaleString?.() || 'Date not set'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Rejected</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Schedule New */}
      {tab === 'schedule' && (
        <div className="space-y-6">
          {/* Step 1: Find Patient */}
          <Card className="p-6">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              Find Patient by Health ID *
            </h2>

            <div className="flex gap-3">
              <Input
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Enter Patient Health ID (e.g., MT-A7K9B2X)"
                onKeyDown={(e) => e.key === 'Enter' && handlePatientSearch()}
              />
              <Button onClick={handlePatientSearch} disabled={patientSearching || !patientQuery.trim()} variant="outline" className="gap-2">
                {patientSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                Search
              </Button>
            </div>

            {patientError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{patientError}</AlertDescription>
              </Alert>
            )}

            {patient && (
              <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg flex items-center gap-3">
                <Check className="size-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">{patient.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">{patient.healthId}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Step 2: Appointment Details */}
          <Card className="p-6">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              Appointment Details
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Test Type</Label>
                <Input
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  placeholder="e.g., Complete Blood Count, General Checkup"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={(() => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); })()}
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Notes (optional)</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Follow-up appointment for blood work results"
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm min-h-[60px]"
                />
              </div>
            </div>
          </Card>

          {scheduleResult?.success && (
            <Alert className="bg-accent/10 border-accent/20">
              <Check className="h-4 w-4 text-accent" />
              <AlertDescription className="text-accent">
                Appointment scheduled successfully! The patient can view it in their dashboard.
              </AlertDescription>
            </Alert>
          )}

          {scheduleResult?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{scheduleResult.error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSchedule}
            disabled={!patient || !appointmentDate || scheduling || scheduleResult?.success}
            className="w-full bg-primary hover:bg-primary/90 py-6 text-lg gap-3"
          >
            {scheduling ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="size-5" />
                Schedule Appointment
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
