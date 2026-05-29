'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile } from '@/lib/firestore'
import { Shield, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!auth || isLoginPage) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login')
        return
      }

      const { data: profile } = await getUserProfile(user.uid)
      if (profile?.role === 'admin') {
        setAuthorized(true)
      } else {
        router.push('/admin/login')
      }
      setLoading(false)
    })

    return () => unsub()
  }, [router, isLoginPage])

  const handleLogout = async () => {
    if (!auth) return
    await firebaseSignOut(auth)
    router.push('/admin/login')
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="size-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-dvh bg-background flex">
      <aside className="w-56 bg-card border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="size-4 text-primary" />
            </div>
            <span className="font-semibold text-sm text-foreground">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <Link
            href="/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === '/admin'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Shield className="size-4" />
            Pending Approvals
          </Link>
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
