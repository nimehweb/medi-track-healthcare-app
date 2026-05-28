'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { RemindersManager } from '@/components/RemindersManager'
import { MedicationShare } from '@/components/MedicationShare'
import { getMedicationsByPatient } from '@/lib/firestore'
import { Medication } from '@/lib/firestore'

export default function MedicationsPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [medications, setMedications] = useState<Medication[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (user) {
      loadMedications()
    }
    if (!loading) {
      setPageLoading(false)
    }
  }, [loading, isAuthenticated, user, router])

  const loadMedications = async () => {
    if (!user) return
    const { data } = await getMedicationsByPatient(user.uid)
    if (data) setMedications(data)
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Medications</h1>
          <p className="text-muted-foreground">
            Track, manage, and share your medications with your pharmacist
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RemindersManager />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <MedicationShare
                medications={medications.map((m) => ({
                  name: m.name,
                  dosage: m.dosage,
                  frequency: m.frequency,
                }))}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
