'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile } from '@/lib/firestore'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Search, Upload, Clock, LogOut, Hospital, ChevronLeft, Calendar } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/lab/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lab/patients', label: 'Find Patient', icon: Search },
  { href: '/lab/upload', label: 'Upload Result', icon: Upload },
  { href: '/lab/appointments', label: 'Appointments', icon: Calendar },
  { href: '/lab/history', label: 'History', icon: Clock },
]

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [labName, setLabName] = useState('')
  const [isPublicPage, setIsPublicPage] = useState(
    pathname === '/lab/login' || pathname === '/lab/register'
  )

  useEffect(() => {
    setIsPublicPage(pathname === '/lab/login' || pathname === '/lab/register')
  }, [pathname])

  useEffect(() => {
    if (!auth || isPublicPage) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/lab/login')
        return
      }

      const { data } = await getUserProfile(user.uid)
      if (data?.role === 'lab_staff') {
        setAuthorized(true)
        setLabName(data.name || 'Lab Staff')
      } else {
        router.push('/lab/login')
      }
      setLoading(false)
    })

    return () => unsub()
  }, [router, isPublicPage])

  const handleLogout = async () => {
    await signOut()
    router.push('/lab/login')
  }

  if (isPublicPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          <Link href="/lab/dashboard" className="flex items-center gap-2">
            <Hospital className="size-5 text-primary" />
            <span className="font-bold text-foreground">MediTrack Lab</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1 truncate">{labName}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                pathname === href
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Patient App
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
