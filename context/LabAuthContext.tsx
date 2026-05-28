'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile } from '@/lib/firestore'
import { User } from '@/lib/firestore'

type LabAuthContextType = {
  user: FirebaseUser | null
  profile: User | null
  loading: boolean
  isAuthenticated: boolean
  isLabStaff: boolean
}

const LabAuthContext = createContext<LabAuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isLabStaff: false,
})

export const LabAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser)
        
        if (currentUser) {
          const { data, error } = await getUserProfile(currentUser.uid)
          if (data && data.role === 'lab_staff') {
            setProfile(data)
          } else {
            setUser(null)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Lab auth state change error:', error)
      setLoading(false)
    }
  }, [])

  const value: LabAuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: !!user && !!profile,
    isLabStaff: profile?.role === 'lab_staff',
  }

  return <LabAuthContext.Provider value={value}>{children}</LabAuthContext.Provider>
}

export const useLabAuth = () => {
  const context = useContext(LabAuthContext)
  if (!context) {
    throw new Error('useLabAuth must be used within LabAuthProvider')
  }
  return context
}
