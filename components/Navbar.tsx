'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { signOut } from '@/lib/auth'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/test-results', label: 'Tests' },
  { href: '/drug-search', label: 'Drugs' },
  { href: '/medications', label: 'Medications' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/reminders', label: 'Reminders' },
  { href: '/pharmacy-finder', label: 'Pharmacy' },
  { href: '/profile', label: 'Profile' },
]

export default function Navbar() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const closeMobileNav = () => setMobileNavOpen(false)

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
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:opacity-80 transition">
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 hover:opacity-80"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-primary-foreground text-primary px-3 py-2 rounded hover:opacity-80"
              >
                <span className="text-sm max-w-[100px] truncate">{user?.email?.split('@')[0]}</span>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-card-foreground hover:bg-muted"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {mobileNavOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/20">
          <div className="max-w-7xl mx-auto px-4 pb-4 pt-2 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMobileNav}
                className="block px-3 py-3 rounded hover:bg-primary-foreground/10 transition"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
