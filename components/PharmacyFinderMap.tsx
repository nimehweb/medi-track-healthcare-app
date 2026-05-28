'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Star, Clock, Phone, Globe, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDirectionsUrl } from '@/lib/maps'
import { usePharmacyFinder } from '@/hooks/usePharmacyFinder'
import { PharmacyMapCanvas } from '@/components/PharmacyMapCanvas'
import { toast } from 'sonner'

interface PharmacyFinderMapProps {
  onPharmacySelect?: (placeId: string) => void
  defaultRadius?: number
  showHeader?: boolean
}

/**
 * PharmacyFinderMap Component
 * Interactive map component showing nearby pharmacies with search and filter capabilities
 */
export function PharmacyFinderMap({
  onPharmacySelect,
  defaultRadius = 5,
  showHeader = true,
}: PharmacyFinderMapProps) {
  const [radius, setRadius] = useState(defaultRadius)
  const [filterRating, setFilterRating] = useState(0)
  const { pharmacies, selectedPharmacy, userLocation, loading, error, getUserLocationAndSearch, selectPharmacy, clearSelection, retry } =
    usePharmacyFinder()

  // Auto-load pharmacies on component mount
  useEffect(() => {
    getUserLocationAndSearch(radius)
  }, [])

  const handleSearchClick = async () => {
    if (userLocation) {
      await getUserLocationAndSearch(radius)
    } else {
      toast.info('Enabling location access...')
      await getUserLocationAndSearch(radius)
    }
  }

  const handlePharmacyClick = async (placeId: string) => {
    await selectPharmacy(placeId)
    onPharmacySelect?.(placeId)
  }

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    if (filterRating > 0 && (!pharmacy.rating || pharmacy.rating < filterRating)) {
      return false
    }
    return true
  })

  const openDirections = (lat: number, lng: number) => {
    const directionsUrl = getDirectionsUrl(lat, lng, userLocation?.lat, userLocation?.lng)
    window.open(directionsUrl, '_blank')
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      {showHeader && (
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pharmacy Finder</h2>
          <p className="text-muted-foreground mt-2">
            Find nearby pharmacies and get directions in seconds
          </p>
        </div>
      )}

      {/* Search Controls */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Search Nearby Pharmacies</CardTitle>
          <CardDescription>Set your search radius and filter preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Radius Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Radius (km)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Rating</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="0">All Ratings</option>
                <option value="3">3+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={handleSearchClick}
                disabled={loading}
                className="w-full"
                size="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Search Pharmacies
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="mt-2 text-destructive hover:text-destructive"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div className="w-full">
        <PharmacyMapCanvas
          pharmacies={filteredPharmacies}
          selectedPharmacy={selectedPharmacy}
          userLocation={userLocation}
          onPharmacySelect={handlePharmacyClick}
        />
      </div>

      {/* Results Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pharmacies List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Found {filteredPharmacies.length} Pharmacies
              </CardTitle>
              <CardDescription>
                {pharmacies.length > 0 && `Total: ${pharmacies.length}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && pharmacies.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredPharmacies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pharmacies found.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredPharmacies.map((pharmacy) => (
                    <button
                      key={pharmacy.placeId}
                      onClick={() => handlePharmacyClick(pharmacy.placeId)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPharmacy?.placeId === pharmacy.placeId
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm line-clamp-1">{pharmacy.name}</p>
                        <p className="text-xs text-muted-foreground">{pharmacy.distance.toFixed(1)} km away</p>
                        {pharmacy.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{pharmacy.rating.toFixed(1)}</span>
                            {pharmacy.reviewCount && (
                              <span className="text-xs text-muted-foreground">
                                ({pharmacy.reviewCount})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pharmacy Details */}
        <div className="lg:col-span-2">
          {selectedPharmacy ? (
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{selectedPharmacy.name}</CardTitle>
                    {selectedPharmacy.rating && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(selectedPharmacy.rating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{selectedPharmacy.rating.toFixed(1)}</span>
                        {selectedPharmacy.reviewCount && (
                          <span className="text-muted-foreground text-sm">
                            {selectedPharmacy.reviewCount} reviews
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="text-muted-foreground"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address */}
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedPharmacy.address}</p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="secondary">
                      {selectedPharmacy.distance.toFixed(1)} km away
                    </Badge>
                  </div>
                  <Button
                    onClick={() =>
                      openDirections(selectedPharmacy.lat, selectedPharmacy.lng)
                    }
                    className="mt-3 w-full"
                    size="sm"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                </div>

                {/* Hours */}
                {selectedPharmacy.hours && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hours
                    </h3>
                    <div className="space-y-1">
                      {selectedPharmacy.hours.weekdayText ? (
                        selectedPharmacy.hours.weekdayText.map((day, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {day}
                          </p>
                        ))
                      ) : (
                        <Badge variant={selectedPharmacy.hours.open ? 'default' : 'secondary'}>
                          {selectedPharmacy.hours.open ? 'Open Now' : 'Closed'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-3">
                  {selectedPharmacy.phone && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </h3>
                      <a
                        href={`tel:${selectedPharmacy.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {selectedPharmacy.phone}
                      </a>
                    </div>
                  )}
                  {selectedPharmacy.website && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </h3>
                      <a
                        href={selectedPharmacy.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {selectedPharmacy.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                {selectedPharmacy.reviews && selectedPharmacy.reviews.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Recent Reviews</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedPharmacy.reviews.slice(0, 3).map((review, i) => (
                        <div key={i} className="p-2 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{review.author}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className={`h-3 w-3 ${
                                    j < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {review.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{review.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-96">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Select a pharmacy from the list to view details
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
