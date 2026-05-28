'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, getTestResultsByLab, getLabById } from '@/lib/firestore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Search, Clock, Activity, ArrowUpRight } from 'lucide-react'

export default function LabDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, ready: 0, recent: [] as any[] })
  const [labName, setLabName] = useState('')

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/lab/login'); return }
      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') { router.push('/lab/login'); return }

      setLabName(profile.name || 'Lab')

      if (profile.labId) {
        const { data: results } = await getTestResultsByLab(profile.labId)
        if (results) {
          setStats({
            total: results.length,
            pending: results.filter((r) => r.status === 'pending').length,
            ready: results.filter((r) => r.status === 'ready').length,
            recent: results.sort((a, b) => b.uploadedAt?.toMillis?.() - a.uploadedAt?.toMillis?.()).slice(0, 5),
          })
        }
      }
      setLoading(false)
    })
    return () => unsub()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {labName}</h1>
        <p className="text-muted-foreground mt-1">Manage patient test results and lab operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Uploads</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <Activity className="size-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <Clock className="size-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ready for Patients</p>
              <p className="text-3xl font-bold text-accent mt-1">{stats.ready}</p>
            </div>
            <Upload className="size-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/lab/upload">
          <Card className="p-6 hover:shadow-md transition cursor-pointer border-primary/20 hover:border-primary">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Upload className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Upload Test Result</h3>
                <p className="text-sm text-muted-foreground">Send results to patients instantly</p>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground ml-auto" />
            </div>
          </Card>
        </Link>
        <Link href="/lab/patients">
          <Card className="p-6 hover:shadow-md transition cursor-pointer border-primary/20 hover:border-primary">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Search className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Find Patient</h3>
                <p className="text-sm text-muted-foreground">Search by Health ID or phone number</p>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground ml-auto" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Uploads */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Uploads</h2>
          <Link href="/lab/history">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {stats.recent.length > 0 ? (
          <div className="space-y-3">
            {stats.recent.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div>
                  <p className="font-medium text-foreground">{r.testName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.uploadedAt?.toDate?.()?.toLocaleString?.() || 'Recently'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  r.status === 'ready' ? 'bg-accent/20 text-accent' : 'bg-yellow-100 text-yellow-700'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="size-8 mx-auto mb-2 opacity-50" />
            <p>No uploads yet. Upload your first test result.</p>
            <Link href="/lab/upload">
              <Button variant="outline" className="mt-4">Upload Result</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
