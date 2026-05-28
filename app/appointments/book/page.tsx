'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { createAppointment, getLabs } from '@/lib/firestore'

const TEST_TYPES = [
  'Blood Test',
  'COVID-19 Test',
  'Thyroid Panel',
  'Lipid Profile',
  'Complete Blood Count',
  'Liver Function Test',
  'Kidney Function Test',
]

interface Lab {
  id: string
  name: string
  address?: string
}

export default function BookAppointmentPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [testType, setTestType] = useState('')
  const [selectedLab, setSelectedLab] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [labs, setLabs] = useState<Lab[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user) {
      loadLabs()
    }
  }, [user, loading, isAuthenticated, router])

  const loadLabs = async () => {
    const { data } = await getLabs()
    if (data && data.length > 0) {
      setLabs(data.map((l) => ({ id: l.id!, name: l.name, address: l.address })))
    } else {
      // Use mock labs if none in database
      setLabs([
        { id: '1', name: 'City Lab Center', address: '123 Main St' },
        { id: '2', name: 'Health Plus Lab', address: '456 Oak Ave' },
        { id: '3', name: 'Medical Diagnostics', address: '789 Pine Rd' },
      ])
    }
    setPageLoading(false)
  }

  const handleNext = () => {
    if (step === 1 && !testType) {
      setError('Please select a test type')
      return
    }
    if (step === 2 && !selectedLab) {
      setError('Please select a lab')
      return
    }
    setError('')
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!appointmentDate) {
      setError('Please select a date and time')
      return
    }

    setSubmitting(true)

    const appointmentDateTime = new Date(appointmentDate)
    const { id, error: createError } = await createAppointment({
      patientId: user?.uid,
      testType,
      labId: selectedLab,
      appointmentDate: appointmentDateTime,
      status: 'pending',
      createdBy: 'patient',
    })

    if (createError) {
      setError(createError)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setStep(4)
  }

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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/appointments">
          <Button variant="ghost" className="mb-4">
            &larr; Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Book Appointment
        </h1>
        <p className="text-muted-foreground mb-8">
          {step === 4 ? '' : `Step ${step} of 3 - ${step === 1 ? 'Select Test Type' : step === 2 ? 'Choose Lab' : 'Schedule Date'}`}
        </p>

        <Card className="p-8">
          {/* Step 1: Select Test Type */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                What test do you need?
              </h2>
              <div className="space-y-2 mb-6">
                {TEST_TYPES.map((test) => (
                  <button
                    key={test}
                    onClick={() => setTestType(test)}
                    className={`w-full p-4 border rounded-lg text-left transition ${
                      testType === test
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <p className="font-medium text-foreground">{test}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Lab */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Choose your lab
              </h2>
              <div className="space-y-2 mb-6">
                {labs.map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => setSelectedLab(lab.id)}
                    className={`w-full p-4 border rounded-lg text-left transition ${
                      selectedLab === lab.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <p className="font-medium text-foreground">{lab.name}</p>
                    {lab.address && (
                      <p className="text-sm text-muted-foreground">{lab.address}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Schedule Date */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold text-foreground mb-4">
                When would you like to visit?
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Date and Time
                </label>
                <Input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={(() => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); })()}
                  required
                />
              </div>

              {/* Summary */}
              <Card className="p-4 bg-muted/50 mb-6">
                <h3 className="font-bold text-foreground mb-3">Appointment Summary</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">Test:</span> {testType}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Lab:</span>{' '}
                    {labs.find((l) => l.id === selectedLab)?.name}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Date & Time:</span>{' '}
                    {appointmentDate
                      ? new Date(appointmentDate).toLocaleString()
                      : 'Not selected'}
                  </p>
                </div>
              </Card>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive mb-4">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {submitting ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            </form>
          )}

          {/* Step 4: Success / Approval Notice */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Appointment Request Submitted
              </h2>
              <p className="text-muted-foreground mb-2">
                Your appointment request has been submitted and is pending lab approval
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You will be notified once the lab confirms your appointment
              </p>
              <Button
                onClick={() => router.push('/appointments')}
                className="bg-primary hover:bg-primary/90"
              >
                View My Appointments
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && step !== 3 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4 mt-6">
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={handleNext}
                className="ml-auto bg-primary hover:bg-primary/90"
              >
                Next
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
