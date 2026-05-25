'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Navbar() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (!isAuthenticated) return null

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-primary-foreground rounded flex items-center justify-center">
              <span className="text-primary text-sm font-bold">M</span>
            </div>
            MediTrack
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="hover:opacity-80 transition">
              Dashboard
            </Link>
            <Link href="/test-results" className="hover:opacity-80 transition">
              Tests
            </Link>
            <Link href="/appointments" className="hover:opacity-80 transition">
              Appointments
            </Link>
            <Link href="/pharmacy-finder" className="hover:opacity-80 transition">
              Pharmacy
            </Link>
            <Link href="/profile" className="hover:opacity-80 transition">
              Profile
            </Link>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-primary-foreground text-primary px-3 py-2 rounded hover:opacity-80"
            >
              <span className="text-sm">{user?.email?.split('@')[0]}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-card-foreground hover:bg-muted"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
