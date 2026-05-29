'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, subscribeToLabDocument } from '@/lib/firestore'
import { Hospital, Clock, CheckCircle, XCircle } from 'lucide-react'

type PendingStatus = 'loading' | 'inactive' | 'active' | 'rejected' | 'unauthorized'

export default function LabPendingPage() {
  const router = useRouter()
  const [status, setStatus] = useState<PendingStatus>('loading')
  const [hospitalName, setHospitalName] = useState('')

  useEffect(() => {
    if (!auth) {
      setStatus('unauthorized')
      return
    }

    let unsubLab: (() => void) | null = null

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/lab/login')
        return
      }

      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') {
        setStatus('unauthorized')
        return
      }

      if (!profile.labId) {
        setStatus('unauthorized')
        return
      }

      // Subscribe to the lab document for real-time status changes
      unsubLab = subscribeToLabDocument(profile.labId, (labData) => {
        if (!labData) {
          setStatus('rejected')
          return
        }

        setHospitalName(labData.name || 'Your Hospital')

        switch (labData.status) {
          case 'active':
            setStatus('active')
            setTimeout(() => router.push('/lab/dashboard'), 800)
            break
          case 'rejected':
            setStatus('rejected')
            break
          default:
            setStatus('inactive')
        }
      })
    })

    return () => {
      unsubAuth()
      if (unsubLab) unsubLab()
    }
  }, [router])

  const handleSignOut = async () => {
    if (!auth) return
    await signOut(auth)
    router.push('/lab/login')
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm mx-auto text-center">
        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Checking your registration...</p>
          </div>
        )}

        {/* Unauthorized */}
        {status === 'unauthorized' && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="size-7 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">Access Denied</h1>
              <p className="text-sm text-muted-foreground">
                You do not have a pending hospital registration.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => router.push('/lab/login')}
                className="text-sm text-primary underline underline-offset-2 hover:opacity-80 transition"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/lab/register')}
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition"
              >
                Register a hospital
              </button>
            </div>
          </div>
        )}

        {/* Pending */}
        {status === 'inactive' && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="relative">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="size-7 text-primary" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 size-3.5">
                <span className="animate-ping absolute inset-0 rounded-full bg-primary/40" />
                <span className="relative block size-3.5 rounded-full bg-primary" />
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Registration Received
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                {hospitalName} is being reviewed by our team.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl px-5 py-3.5 w-full">
              <p className="text-sm text-muted-foreground leading-relaxed">
                We will notify you here once your account is activated. You don&apos;t need to refresh this page.
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition"
            >
              Sign out
            </button>
          </div>
        )}

        {/* Approved */}
        {status === 'active' && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="size-14 rounded-full bg-accent/15 flex items-center justify-center">
              <CheckCircle className="size-7 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Account Activated
              </h1>
              <p className="text-base text-muted-foreground">
                {hospitalName} has been approved. Taking you to your dashboard...
              </p>
            </div>
            <div className="size-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        )}

        {/* Rejected */}
        {status === 'rejected' && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="size-7 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                Registration Not Approved
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your hospital registration was not approved. If you believe this is an error, please contact support.
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition font-medium"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
