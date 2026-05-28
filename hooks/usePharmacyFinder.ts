'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  getNearbyPharmacies,
  getPharmacyDetails,
  getUserLocation,
  type Pharmacy,
  type PharmacyDetails,
  type LocationCoordinates,
} from '@/lib/maps'

interface UsePharmacyFinderReturn {
  pharmacies: Pharmacy[]
  selectedPharmacy: PharmacyDetails | null
  userLocation: LocationCoordinates | null
  loading: boolean
  error: string | null
  searchNearby: (lat: number, lng: number, radiusKm?: number) => Promise<void>
  selectPharmacy: (placeId: string) => Promise<void>
  getUserLocationAndSearch: (radiusKm?: number) => Promise<void>
  clearSelection: () => void
  retry: () => Promise<void>
}

/**
 * Custom hook for pharmacy finder functionality
 * @returns Object with pharmacies list, selection state, and helper methods
 */
export function usePharmacyFinder(): UsePharmacyFinderReturn {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyDetails | null>(null)
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSearchParams, setLastSearchParams] = useState<{
    lat: number
    lng: number
    radiusKm: number
  } | null>(null)

  /**
   * Search for nearby pharmacies
   */
  const searchNearby = useCallback(
    async (lat: number, lng: number, radiusKm: number = 5) => {
      setLoading(true)
      setError(null)
      try {
        const results = await getNearbyPharmacies(lat, lng, radiusKm)
        setPharmacies(results)
        setLastSearchParams({ lat, lng, radiusKm })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search pharmacies'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Select a pharmacy and fetch its details
   */
  const selectPharmacy = useCallback(async (placeId: string) => {
    setLoading(true)
    setError(null)
    try {
      const details = await getPharmacyDetails(placeId)
      setSelectedPharmacy(details)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load pharmacy details'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get user location and search nearby pharmacies
   */
  const getUserLocationAndSearch = useCallback(async (radiusKm: number = 5) => {
    setLoading(true)
    setError(null)
    try {
      const location = await getUserLocation()
      setUserLocation(location)
      await searchNearby(location.lat, location.lng, radiusKm)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [searchNearby])

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedPharmacy(null)
  }, [])

  /**
   * Retry last search
   */
  const retry = useCallback(async () => {
    if (lastSearchParams) {
      await searchNearby(lastSearchParams.lat, lastSearchParams.lng, lastSearchParams.radiusKm)
    } else {
      await getUserLocationAndSearch()
    }
  }, [lastSearchParams, searchNearby, getUserLocationAndSearch])

  return {
    pharmacies,
    selectedPharmacy,
    userLocation,
    loading,
    error,
    searchNearby,
    selectPharmacy,
    getUserLocationAndSearch,
    clearSelection,
    retry,
  }
}

interface UseUserLocationReturn {
  location: LocationCoordinates | null
  loading: boolean
  error: string | null
  getLocation: () => Promise<void>
  hasPermission: boolean | null
}

/**
 * Custom hook for managing user location
 * @returns Object with location state and helper methods
 */
export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<LocationCoordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  /**
   * Get current user location
   */
  const getLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const loc = await getUserLocation()
      setLocation(loc)
      setHasPermission(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location'
      setError(message)
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    location,
    loading,
    error,
    getLocation,
    hasPermission,
  }
}
