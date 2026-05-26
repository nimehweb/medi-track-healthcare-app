'use client'

import { useMemo } from 'react'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import { Loader2, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Pharmacy, PharmacyDetails, LocationCoordinates } from '@/lib/maps'

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const containerStyle = { width: '100%', height: '400px', borderRadius: '0.5rem' }

interface PharmacyMapCanvasProps {
  pharmacies: Pharmacy[]
  selectedPharmacy: PharmacyDetails | null
  userLocation: LocationCoordinates | null
  onPharmacySelect?: (placeId: string) => void
}

export function PharmacyMapCanvas({
  pharmacies,
  selectedPharmacy,
  userLocation,
  onPharmacySelect,
}: PharmacyMapCanvasProps) {
  const center = useMemo(() => {
    if (userLocation) return { lat: userLocation.lat, lng: userLocation.lng }
    if (pharmacies.length > 0) return { lat: pharmacies[0].lat, lng: pharmacies[0].lng }
    return { lat: 5.6037, lng: -0.1870 }
  }, [userLocation, pharmacies])

  if (!MAPS_API_KEY) {
    return (
      <Card className="p-8 flex items-center justify-center min-h-[300px] bg-muted/30">
        <div className="text-center">
          <MapPin className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">Map unavailable</p>
          <p className="text-sm text-muted-foreground mt-1">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to see the map
          </p>
        </div>
      </Card>
    )
  }

  return (
    <GoogleMapWrapper center={center} selectedPharmacy={selectedPharmacy}>
      {userLocation && (
        <Marker
          position={{ lat: userLocation.lat, lng: userLocation.lng }}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
        />
      )}
      {selectedPharmacy && (
        <Marker
          position={{ lat: selectedPharmacy.lat, lng: selectedPharmacy.lng }}
          animation={window.google.maps.Animation.DROP}
        />
      )}
      {!selectedPharmacy && pharmacies.map((p) => (
        <Marker
          key={p.placeId}
          position={{ lat: p.lat, lng: p.lng }}
          onClick={() => onPharmacySelect?.(p.placeId)}
        />
      ))}
    </GoogleMapWrapper>
  )
}

function GoogleMapWrapper({
  center,
  selectedPharmacy,
  children,
}: {
  center: { lat: number; lng: number }
  selectedPharmacy: PharmacyDetails | null
  children: React.ReactNode
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY || '',
  })

  if (loadError) {
    return (
      <Card className="p-8 flex items-center justify-center min-h-[300px]">
        <p className="text-destructive">Failed to load Google Maps</p>
      </Card>
    )
  }

  if (!isLoaded) {
    return (
      <Card className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  const zoom = selectedPharmacy ? 16 : 13

  return (
    <Card className="overflow-hidden">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
        {children}
      </GoogleMap>
    </Card>
  )
}
