'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { getTestResults, getLabById } from '@/lib/firestore'
import { Waypoints, List, Search, Building2 } from 'lucide-react'

interface TestResult {
  id: string
  testName: string
  testDate?: any
  uploadedAt?: any
  status: string
  labId?: string
  labName?: string
  notes?: string
}

export default function TestResultsPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user) {
      loadTestResults()
    }
  }, [user, loading, isAuthenticated, router])

  const loadTestResults = async () => {
    if (!user) return

    const { data, error } = await getTestResults(user.uid)
    if (data) {
      const results = data as unknown as TestResult[]
      const labIds = [...new Set(results.map((r) => r.labId).filter(Boolean) as string[])]
      const labCache: Record<string, string> = {}
      await Promise.all(
        labIds.map(async (id) => {
          if (id === 'manual-upload') return
          const { data: lab } = await getLabById(id)
          if (lab) labCache[id] = lab.name
        })
      )
      setTestResults(results.map((r) => ({ ...r, labName: r.labId ? labCache[r.labId] : undefined })))
    }
    setPageLoading(false)
  }

  const formatDate = (test: TestResult) => {
    return test.testDate?.toDate?.()?.toLocaleDateString?.() ||
      test.uploadedAt?.toDate?.()?.toLocaleDateString?.() ||
      ''
  }

  const filteredResults = testResults.filter((test) => {
    if (filter !== 'all' && test.status !== filter) return false
    if (searchQuery && !test.testName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const sortedResults = [...filteredResults].sort((a, b) => {
    const dateA = a.testDate?.toDate?.() || a.uploadedAt?.toDate?.() || new Date(0)
    const dateB = b.testDate?.toDate?.() || b.uploadedAt?.toDate?.() || new Date(0)
    return dateB - dateA
  })

  const statusColors: Record<string, string> = {
    ready: 'bg-accent/20 text-accent',
    pending: 'bg-yellow-100 text-yellow-700',
    viewed: 'bg-blue-100 text-blue-700',
    completed: 'bg-accent/20 text-accent',
  }

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Test Results</h1>
            <p className="text-muted-foreground">
              View your medical test results from your lab
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === 'ready' ? 'default' : 'outline'}
                onClick={() => setFilter('ready')}
                size="sm"
              >
                Ready
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filter === 'viewed' ? 'default' : 'outline'}
                onClick={() => setFilter('viewed')}
                size="sm"
              >
                Viewed
              </Button>
            </div>

            <div className="flex gap-2 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-full sm:w-48"
                />
              </div>
              <div className="flex border border-border rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <List className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 ${viewMode === 'timeline' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <Waypoints className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {sortedResults.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedResults.map((test) => (
                <Link key={test.id} href={`/test-results/${test.id}`}>
                  <Card className="p-6 hover:shadow-lg transition h-full cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-foreground truncate">
                          {test.testName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(test)}
                        </p>
                        {test.labName && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Building2 className="size-3" />
                            {test.labName}
                          </p>
                        )}
                        {test.notes?.startsWith('Uploaded from:') && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {test.notes.replace('Uploaded from: ', '')}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ml-3 flex-shrink-0 ${statusColors[test.status] || 'bg-muted text-muted-foreground'}`}>
                        {test.status}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => e.preventDefault()}
                    >
                      View Results
                    </Button>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-8">
                {sortedResults.map((test, idx) => (
                  <Link key={test.id} href={`/test-results/${test.id}`}>
                    <div className="relative pl-16 cursor-pointer group">
                      <div className={`absolute left-3.5 w-5 h-5 rounded-full border-2 border-background ${
                        test.status === 'ready' || test.status === 'completed'
                          ? 'bg-accent'
                          : test.status === 'pending'
                          ? 'bg-yellow-400'
                          : 'bg-muted'
                      }`} />
                      <Card className="p-5 group-hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-foreground">{test.testName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(test)}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[test.status] || 'bg-muted text-muted-foreground'}`}>
                            {test.status}
                          </span>
                        </div>
                      </Card>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
            </div>
            <p className="text-foreground text-lg font-medium mb-2">
              No test results yet
            </p>
            <p className="text-muted-foreground mb-6">
              Your lab will upload your test results here once they are ready
            </p>
          </Card>
        )}
      </main>
    </div>
  )
}
