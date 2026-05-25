'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface Pharmacy {
  id: string
  name: string
  address: string
  distance: number
  phone: string
  hours: string
  rating: number
  latitude: number
  longitude: number
}

// Mock pharmacy data
const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: '1',
    name: 'HealthCare Plus Pharmacy',
    address: '123 Main Street, Downtown',
    distance: 0.5,
    phone: '(555) 123-4567',
    hours: '8:00 AM - 10:00 PM',
    rating: 4.8,
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: '2',
    name: 'Wellness Pharmacy Network',
    address: '456 Oak Avenue, Midtown',
    distance: 1.2,
    phone: '(555) 234-5678',
    hours: '7:00 AM - 11:00 PM',
    rating: 4.6,
    latitude: 40.758,
    longitude: -73.9855,
  },
  {
    id: '3',
    name: 'Community Health Pharmacy',
    address: '789 Pine Road, Uptown',
    distance: 2.1,
    phone: '(555) 345-6789',
    hours: '9:00 AM - 9:00 PM',
    rating: 4.5,
    latitude: 40.7614,
    longitude: -73.9776,
  },
  {
    id: '4',
    name: 'Express Pharmacy',
    address: '321 Elm Street, Harbor',
    distance: 1.8,
    phone: '(555) 456-7890',
    hours: '6:00 AM - 12:00 AM',
    rating: 4.7,
    latitude: 40.7489,
    longitude: -73.968,
  },
  {
    id: '5',
    name: 'Elite Medical Pharmacy',
    address: '654 Maple Drive, Heights',
    distance: 3.2,
    phone: '(555) 567-8901',
    hours: '8:00 AM - 8:00 PM',
    rating: 4.4,
    latitude: 40.7282,
    longitude: -73.7949,
  },
]

export default function PharmacyFinderPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(MOCK_PHARMACIES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null)
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance')
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    setPageLoading(false)
  }, [loading, isAuthenticated, router])

  const filteredPharmacies = pharmacies
    .filter((pharmacy) =>
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance
      } else {
        return b.rating - a.rating
      }
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Find a Pharmacy
          </h1>
          <p className="text-muted-foreground">
            Locate nearby pharmacies and check their availability
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <Card className="p-6 lg:col-span-1 h-fit sticky top-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search Pharmacy
                </label>
                <Input
                  type="text"
                  placeholder="Name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sort By
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSortBy('distance')}
                    className={`w-full p-2 rounded border text-left ${
                      sortBy === 'distance'
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <p className="text-sm font-medium">Nearest</p>
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`w-full p-2 rounded border text-left ${
                      sortBy === 'rating'
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <p className="text-sm font-medium">Highest Rated</p>
                  </button>
                </div>
              </div>

              {selectedPharmacy && (
                <Card className="p-4 bg-primary/5 border border-primary/20">
                  <h3 className="font-bold text-foreground mb-2">
                    {selectedPharmacy.name}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{selectedPharmacy.address}</p>
                    <p>{selectedPharmacy.phone}</p>
                    <p>{selectedPharmacy.hours}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${selectedPharmacy.latitude},${selectedPharmacy.longitude}`,
                        '_blank'
                      )
                    }
                  >
                    Get Directions
                  </Button>
                </Card>
              )}
            </div>
          </Card>

          {/* Pharmacy List */}
          <div className="lg:col-span-2">
            {filteredPharmacies.length > 0 ? (
              <div className="space-y-4">
                {filteredPharmacies.map((pharmacy) => (
                  <Card
                    key={pharmacy.id}
                    className={`p-6 cursor-pointer transition ${
                      selectedPharmacy?.id === pharmacy.id
                        ? 'border-primary border-2 bg-primary/5'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">
                          {pharmacy.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-medium text-foreground">
                              {pharmacy.rating}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({pharmacy.distance} km away)
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {pharmacy.distance < 1 ? 'Very Close' : 'Nearby'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground flex items-center gap-2">
                        {pharmacy.address}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        {pharmacy.phone}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        {pharmacy.hours}
                      </p>
                    </div>

                    <Button
                      className="w-full mt-4 bg-primary hover:bg-primary/90"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`,
                          '_blank'
                        )
                      }
                    >
                      View on Map
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-foreground text-lg font-medium mb-2">
                  No pharmacies found
                </p>
                <p className="text-muted-foreground">
                  Try searching with different keywords
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Note about Maps */}
        <Card className="p-4 bg-accent/5 border border-accent/20 mt-8">
          <p className="text-sm text-muted-foreground">
            Note: Pharmacies displayed are mock data for demonstration. Once you
            add your Google Maps API key, this will show real pharmacy locations
            near you.
          </p>
        </Card>
      </main>
    </div>
  )
}


