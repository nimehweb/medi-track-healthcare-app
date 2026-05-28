'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, getTestResultsByLab } from '@/lib/firestore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Clock, Download, Eye } from 'lucide-react'
import Link from 'next/link'

export default function LabHistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/lab/login'); return }
      const { data: profile } = await getUserProfile(user.uid)
      if (!profile || profile.role !== 'lab_staff') { router.push('/lab/login'); return }

      if (profile.labId) {
        const { data } = await getTestResultsByLab(profile.labId)
        if (data) setResults(data.sort((a, b) => b.uploadedAt?.toMillis?.() - a.uploadedAt?.toMillis?.()))
      }
      setAuthorized(true)
      setLoading(false)
    })
    return () => unsub()
  }, [router])

  const filtered = results.filter((r) =>
    !searchQuery || r.testName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patientHealthId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload History</h1>
        <p className="text-muted-foreground mt-1">View all test results you've uploaded</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by test name or Health ID..."
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Test Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Health ID</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any) => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4 font-medium text-foreground">{r.testName}</td>
                    <td className="p-4 font-mono text-sm text-muted-foreground">{r.patientHealthId || '—'}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {r.uploadedAt?.toDate?.()?.toLocaleDateString?.() || '—'}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        r.status === 'ready' ? 'bg-accent/20 text-accent' : 'bg-yellow-100 text-yellow-700'
                      }`}>{r.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {r.pdfUrl && (
                          <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Download className="size-4" />
                            </Button>
                          </a>
                        )}
                        <Link href={`/test-results/${r.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <Clock className="size-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">
            {results.length === 0 ? 'No uploads yet.' : 'No results match your search.'}
          </p>
        </Card>
      )}
    </div>
  )
}
