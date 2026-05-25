'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Page() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Check if Firebase is configured
      const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

      if (!hasFirebaseConfig) {
        router.push('/setup')
      } else if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
