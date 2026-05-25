'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTestResults } from '@/lib/firestore'

interface TestResult {
  id: string
  testName: string
  testDate: any
  status: string
}

export default function TestResultsPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

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
      setTestResults(data)
    }
    setPageLoading(false)
  }

  const filteredResults = testResults.filter((test) => {
    if (filter === 'all') return true
    return test.status === filter
  })

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Test Results</h1>
          <p className="text-muted-foreground">
            View and track all your medical test results
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-primary' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'bg-primary' : ''}
            >
              Completed
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'bg-primary' : ''}
            >
              Pending
            </Button>
          </div>
        </Card>

        {/* Results Grid */}
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((test) => (
              <Link key={test.id} href={`/test-results/${test.id}`}>
                <Card className="p-6 hover:shadow-lg transition h-full cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {test.testName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {test.testDate?.toDate?.()?.toLocaleDateString?.() ||
                          'Date not available'}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        test.status === 'completed'
                          ? 'bg-accent/20 text-accent'
                          : test.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  <p className="text-foreground text-sm mb-4">
                    Click to view detailed results and interpretation
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    View Results
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
            </div>
            <p className="text-foreground text-lg font-medium mb-2">
              No test results yet
            </p>
            <p className="text-muted-foreground mb-6">
              Book an appointment to get your first test done
            </p>
            <Link href="/appointments/book">
              <Button className="bg-primary hover:bg-primary/90">
                Book Appointment
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  )
}
