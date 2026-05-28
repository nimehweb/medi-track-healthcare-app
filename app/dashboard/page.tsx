'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HealthIdCard } from '@/components/HealthIdCard'
import Link from 'next/link'
import { Droplets, BarChart3, Calendar, Check, Bell } from 'lucide-react'
import { subscribeToTestResults, subscribeToAppointments, getUserProfile } from '@/lib/firestore'

interface UserProfile {
  name?: string
  healthId?: string
  bloodType?: string
  email?: string
}

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [testResults, setTestResults] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (!user) return

    const unsubTestResults = subscribeToTestResults(user.uid, (results) => {
      setTestResults(results.slice(0, 3))
    })
    const unsubAppointments = subscribeToAppointments(user.uid, (appointments) => {
      setAppointments(appointments.slice(0, 3))
    })

    getUserProfile(user.uid).then(({ data }) => {
      if (data) {
        setProfile(data as UserProfile)
      }
    }).finally(() => {
      setPageLoading(false)
    })

    return () => {
      unsubTestResults()
      unsubAppointments()
    }
  }, [user, loading, isAuthenticated, router])

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {profile?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            View your health records, test results, and find nearby pharmacies
          </p>
        </div>

        {/* Health ID Card */}
        {profile?.healthId && (
          <HealthIdCard
            healthId={profile.healthId}
            patientName={profile.name}
            className="mb-8"
          />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Blood Type</p>
                <p className="text-2xl font-bold text-foreground">
                  {profile?.bloodType || '—'}
                </p>
              </div>
              <Droplets className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Recent Tests</p>
                <p className="text-2xl font-bold text-foreground">{testResults.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Appointments</p>
                <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Health Status</p>
                <p className="text-2xl font-bold text-accent">Good</p>
              </div>
              <Check className="w-8 h-8 text-accent" />
            </div>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Test Results */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Recent Test Results</h2>
              <Link href="/test-results">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {testResults.length > 0 ? (
              <div className="space-y-3">
                {testResults.map((test) => (
                  <Link key={test.id} href={`/test-results/${test.id}`}>
                    <div className="p-3 border border-border rounded hover:bg-muted transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{test.testName}</p>
                          <p className="text-sm text-muted-foreground">
                            {test.testDate?.toDate?.()?.toLocaleDateString?.() ||
                              test.uploadedAt?.toDate?.()?.toLocaleDateString?.() ||
                              'Date not available'}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            test.status === 'completed'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {test.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">
                No test results yet. Book a test to get started.
              </p>
            )}
          </Card>

          {/* Upcoming Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Upcoming Appointments</h2>
              <Link href="/appointments">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-3 border border-border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{apt.testType}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.appointmentDate?.toDate?.()?.toLocaleDateString?.() ||
                            'Date not available'}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          apt.status === 'confirmed'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">
                No upcoming appointments. Book one now!
              </p>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link href="/test-results">
              <Button variant="outline" className="w-full">
                Test Results
              </Button>
            </Link>
            <Link href="/medications">
              <Button variant="outline" className="w-full">
                Medications
              </Button>
            </Link>
            <Link href="/reminders">
              <Button variant="outline" className="w-full">
                <Bell className="size-4 mr-2" />
                Reminders
              </Button>
            </Link>
            <Link href="/pharmacy-finder">
              <Button variant="outline" className="w-full">
                Find Pharmacy
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
