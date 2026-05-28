'use client'

import { toast } from 'sonner'

// TypeScript Interfaces
export interface Pharmacy {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  distance: number // in km
  rating?: number
  reviewCount?: number
}

export interface Review {
  author: string
  rating: number
  text: string
  time: string
}

export interface PharmacyDetails extends Pharmacy {
  hours?: {
    open: boolean
    periods?: Array<{
      open: { day: number; time: string }
      close: { day: number; time: string }
    }>
    weekdayText?: string[]
  }
  phone?: string
  website?: string
  reviews?: Review[]
}

export interface LocationCoordinates {
  lat: number
  lng: number
}

// Cache management
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
let pharmaciesCache: { data: Pharmacy[]; timestamp: number } | null = null
let detailsCache: Map<string, { data: PharmacyDetails; timestamp: number }> = new Map()

// Mock pharmacy data for fallback
const MOCK_PHARMACIES: Pharmacy[] = [
  {
    placeId: 'mock_1',
    name: 'Central Pharmacy',
    address: '123 Main Street, Downtown',
    lat: 40.7128,
    lng: -74.006,
    distance: 0.5,
    rating: 4.5,
    reviewCount: 124,
  },
  {
    placeId: 'mock_2',
    name: 'Health Plus Pharmacy',
    address: '456 Oak Avenue, Midtown',
    lat: 40.758,
    lng: -73.9855,
    distance: 1.2,
    rating: 4.3,
    reviewCount: 89,
  },
  {
    placeId: 'mock_3',
    name: 'Quick Care Pharmacy',
    address: '789 Elm Road, Uptown',
    lat: 40.7614,
    lng: -73.9776,
    distance: 2.1,
    rating: 4.7,
    reviewCount: 156,
  },
  {
    placeId: 'mock_4',
    name: '24/7 Pharmacy Express',
    address: '321 Pine Street, Westside',
    lat: 40.7282,
    lng: -73.7949,
    distance: 3.5,
    rating: 4.2,
    reviewCount: 67,
  },
]

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Get user's current geolocation
 * @returns Promise with latitude and longitude
 */
export async function getUserLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        console.warn('Geolocation error:', error.message)

        // Handle specific permission errors
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please enable it in settings.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location information is unavailable.')
        } else if (error.code === error.TIMEOUT) {
          toast.error('Location request timed out.')
        }

        // Return default location (Lagos, Nigeria) for demo purposes
        resolve({
          lat: 6.5244,
          lng: 3.3792,
        })
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Get nearby pharmacies using Google Maps Places API
 * @param lat - User's latitude
 * @param lng - User's longitude
 * @param radiusKm - Search radius in kilometers (default: 5)
 * @returns Promise with array of nearby pharmacies
 */
export async function getNearbyPharmacies(
  lat: number,
  lng: number,
  radiusKm: number = 5
): Promise<Pharmacy[]> {
  // Check cache first
  if (pharmaciesCache && Date.now() - pharmaciesCache.timestamp < CACHE_DURATION) {
    return pharmaciesCache.data
  }

  try {
    const response = await fetch(
      `/api/pharmacies/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radiusKm=${encodeURIComponent(radiusKm)}`
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    const pharmacies: Pharmacy[] = (data.results || [])
      .map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity || '',
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
        rating: place.rating,
        reviewCount: place.user_ratings_total,
      }))
      .sort((a: any, b: any) => a.distance - b.distance)

    // Cache the results
    pharmaciesCache = {
      data: pharmacies,
      timestamp: Date.now(),
    }

    return pharmacies
  } catch (error) {
    console.error('Error fetching nearby pharmacies:', error)
    toast.error('Failed to fetch pharmacies. Showing nearby options.')

    // Fallback to mock data
    pharmaciesCache = {
      data: MOCK_PHARMACIES,
      timestamp: Date.now(),
    }
    return MOCK_PHARMACIES
  }
}

/**
 * Get detailed information about a pharmacy
 * @param placeId - Google Places ID
 * @returns Promise with detailed pharmacy information
 */
export async function getPharmacyDetails(placeId: string): Promise<PharmacyDetails> {
  // Check cache first
  const cached = detailsCache.get(placeId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    const response = await fetch(`/api/pharmacies/${encodeURIComponent(placeId)}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    const place = data
    const details: PharmacyDetails = {
      placeId,
      name: place.name,
      address: place.formatted_address || '',
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      distance: 0,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      phone: place.formatted_phone_number,
      website: place.website,
      hours: place.opening_hours
        ? {
            open: place.opening_hours.open_now ?? false,
            weekdayText: place.opening_hours.weekday_text,
          }
        : undefined,
      reviews: (place.reviews || []).map((review: any) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.relative_time_description,
      })),
    }

    // Cache the results
    detailsCache.set(placeId, { data: details, timestamp: Date.now() })

    return details
  } catch (error) {
    console.error('Error fetching pharmacy details:', error)
    toast.error('Failed to load pharmacy details.')

    const mockPharmacy = MOCK_PHARMACIES.find((p) => p.placeId === placeId)
    if (mockPharmacy) {
      const details: PharmacyDetails = {
        ...mockPharmacy,
        phone: '(555) 123-4567',
        website: 'https://example.com',
        hours: {
          open: true,
          weekdayText: [
            'Monday: 9:00 AM – 9:00 PM',
            'Tuesday: 9:00 AM – 9:00 PM',
            'Wednesday: 9:00 AM – 9:00 PM',
            'Thursday: 9:00 AM – 9:00 PM',
            'Friday: 9:00 AM – 10:00 PM',
            'Saturday: 8:00 AM – 10:00 PM',
            'Sunday: 8:00 AM – 8:00 PM',
          ],
        },
        reviews: [
          {
            author: 'John Doe',
            rating: 5,
            text: 'Great service and friendly staff!',
            time: '2 weeks ago',
          },
          {
            author: 'Jane Smith',
            rating: 4,
            text: 'Good pharmacy with reasonable prices.',
            time: '1 month ago',
          },
        ],
      }
      detailsCache.set(placeId, { data: details, timestamp: Date.now() })
      return details
    }

    throw error
  }
}


/**
 * Get Google Maps directions URL for a pharmacy
 * @param pharmacyLat - Pharmacy latitude
 * @param pharmacyLng - Pharmacy longitude
 * @param userLat - Optional user latitude for directions from current location
 * @param userLng - Optional user longitude for directions from current location
 * @returns URL string to open in Google Maps
 */
export function getDirectionsUrl(
  pharmacyLat: number,
  pharmacyLng: number,
  userLat?: number,
  userLng?: number
): string {
  const destination = `${pharmacyLat},${pharmacyLng}`
  const baseUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`

  if (userLat !== undefined && userLng !== undefined) {
    return `${baseUrl}&origin=${userLat},${userLng}`
  }

  return baseUrl
}

/**
 * Clear all caches (useful for testing or forcing refresh)
 */
export function clearPharmacyCache(): void {
  pharmaciesCache = null
  detailsCache.clear()
}
