'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { RemindersManager } from '@/components/RemindersManager'

export default function RemindersPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (!loading) {
      setPageLoading(false)
    }
  }, [loading, isAuthenticated, router])

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
        <RemindersManager />
      </main>
    </div>
  )
}
