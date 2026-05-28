'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Pill, AlertCircle, Loader2, Share2 } from 'lucide-react'
import { getDrugInfo, isGeminiAvailable, generatePharmacistSummary } from '@/lib/gemini'
import { toast } from 'sonner'

export default function DrugSearchPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [drugInfo, setDrugInfo] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedDrugs, setSavedDrugs] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  const handleSearch = async () => {
    if (!query.trim()) return

    setSearching(true)
    setError(null)
    setDrugInfo(null)

    try {
      const info = await getDrugInfo(query.trim())
      setDrugInfo(info)
    } catch (err: any) {
      setError(err.message || 'Failed to get drug information')
    } finally {
      setSearching(false)
    }
  }

  const handleSave = () => {
    if (drugInfo && !savedDrugs.includes(query)) {
      setSavedDrugs([...savedDrugs, query])
      toast.success(`${query} added to saved drugs`)
    }
  }

  const handleShare = async () => {
    if (!drugInfo) return

    const summary = await generatePharmacistSummary(
      [query],
      [drugInfo]
    )

    const text = `Medication: ${query}\n\n${summary}`

    if (navigator.share) {
      try {
        await navigator.share({ title: `${query} - Drug Information`, text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    }
  }

  if (loading) {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Drug Information</h1>
          <p className="text-muted-foreground">
            Search for medications and get plain-language information powered by Gemini AI
          </p>
        </div>

        {/* Search */}
        <Card className="p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Aspirin, Metformin, Amoxicillin..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Search
            </Button>
          </div>

          {!isGeminiAvailable() && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Gemini API key not configured. Set NEXT_PUBLIC_GEMINI_API_KEY in .env.local for AI-powered results.
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Results */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {searching && (
          <Card className="p-12 text-center">
            <Loader2 className="size-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Looking up {query}...</p>
          </Card>
        )}

        {drugInfo && !searching && (
          <Card className="p-6 border-l-4 border-l-accent">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Pill className="size-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">{query}</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="size-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
            <div className="space-y-3 text-foreground leading-relaxed">
              {drugInfo.split('\n').filter(Boolean).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              This information is for educational purposes only. Always consult your doctor or pharmacist.
            </p>
          </Card>
        )}

        {/* Saved Drugs */}
        {savedDrugs.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="font-bold text-foreground mb-3">Saved Medications</h3>
            <div className="flex flex-wrap gap-2">
              {savedDrugs.map((drug) => (
                <Button
                  key={drug}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery(drug)
                    setDrugInfo(null)
                  }}
                >
                  <Pill className="size-3 mr-1" />
                  {drug}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
