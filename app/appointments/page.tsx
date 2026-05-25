'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getAppointments, deleteAppointment } from '@/lib/firestore'

interface Appointment {
  id: string
  testType: string
  appointmentDate: any
  status: string
  labId?: string
}

export default function AppointmentsPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    setDeletingId(appointmentId)
    const { error } = await deleteAppointment(appointmentId)
    setDeletingId(null)

    if (!error) {
      setAppointments(appointments.filter((a) => a.id !== appointmentId))
    }
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
              Manage your lab appointments and test bookings
            </p>
          </div>
          <Link href="/appointments/book">
            <Button className="bg-primary hover:bg-primary/90">
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Upcoming Appointments
          </h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
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
                      <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-medium">
                        {apt.status}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(apt.id)}
                        disabled={deletingId === apt.id}
                      >
                        {deletingId === apt.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
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
    </div>
  )
}
