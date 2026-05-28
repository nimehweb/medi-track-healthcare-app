'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'
import { getAppointments, rescheduleAppointment } from '@/lib/firestore'

interface Appointment {
  id: string
  testType: string
  appointmentDate: any
  status: string
  labId?: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Awaiting Approval', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', className: 'bg-accent/20 text-accent' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
}

export default function AppointmentsPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [reschedulingId, setReschedulingId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')
  const [resubmitting, setResubmitting] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user) {
      loadAppointments()
    }
  }, [user, loading, isAuthenticated, router])

  const loadAppointments = async () => {
    if (!user) return

    const { data } = await getAppointments(user.uid)
    if (data) {
      setAppointments(data)
    }
    setPageLoading(false)
  }

  const handleReschedule = async () => {
    if (!reschedulingId || !newDate) return

    setResubmitting(true)
    setRescheduleError(null)

    const { error } = await rescheduleAppointment(reschedulingId, new Date(newDate))

    if (error) {
      setRescheduleError(error)
      setResubmitting(false)
      return
    }

    setResubmitting(false)
    setRescheduleOpen(false)
    setReschedulingId(null)
    setNewDate('')
    loadAppointments()
  }

  const openReschedule = (apt: Appointment) => {
    setReschedulingId(apt.id)
    const date = apt.appointmentDate?.toDate?.()
    if (date) {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      setNewDate(local.toISOString().slice(0, 16))
    } else {
      setNewDate('')
    }
    setRescheduleError(null)
    setRescheduleOpen(true)
  }

  const upcomingAppointments = appointments.filter((apt) => {
    const date = apt.appointmentDate?.toDate?.()
    if (!date) return false
    return date > new Date()
  })
  const pastAppointments = appointments.filter((apt) => {
    const date = apt.appointmentDate?.toDate?.()
    if (!date) return false
    return date <= new Date()
  })

  const canReschedule = (status: string) => status === 'pending' || status === 'confirmed'

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Appointments
            </h1>
            <p className="text-muted-foreground">
              View your lab appointments and requests
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Upcoming Appointments
          </h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => {
                const statusCfg = STATUS_CONFIG[apt.status] || { label: apt.status, className: 'bg-muted text-muted-foreground' }
                return (
                  <Card key={apt.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">
                          {apt.testType}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {apt.appointmentDate?.toDate?.()?.toLocaleDateString?.() ||
                            'Date not available'}{' '}
                          at{' '}
                          {apt.appointmentDate?.toDate?.()?.toLocaleTimeString?.() ||
                            'Time not available'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Lab: {apt.labId || 'Lab details'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                        {canReschedule(apt.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReschedule(apt)}
                          >
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-foreground mb-4">No upcoming appointments</p>
              <Link href="/appointments/book">
                <Button className="bg-primary hover:bg-primary/90">
                  Book Your First Appointment
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              Past Appointments
            </h2>
            <div className="space-y-4">
              {pastAppointments.map((apt) => (
                <Card key={apt.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {apt.testType}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {apt.appointmentDate?.toDate?.()?.toLocaleDateString?.() ||
                          'Date not available'}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                      Completed
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {reschedulingId && appointments.find(a => a.id === reschedulingId)?.status === 'confirmed'
                ? 'Rescheduling will move this appointment back to pending for lab approval.'
                : 'Select a new date and time for your appointment.'}
            </p>
            <label className="block text-sm font-medium text-foreground">
              New Date & Time
            </label>
            <Input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={(() => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); })()}
              required
            />
            {rescheduleError && (
              <p className="text-sm text-destructive">{rescheduleError}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={!newDate || resubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {resubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
