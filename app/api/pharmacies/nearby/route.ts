import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Google Maps API key' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radiusKm = searchParams.get('radiusKm') ?? '5'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 })
  }

  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${encodeURIComponent(lat)},${encodeURIComponent(lng)}` +
    `&radius=${encodeURIComponent(Number(radiusKm) * 1000)}` +
    `&type=pharmacy&key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to load nearby pharmacies' }, { status: 502 })
  }

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return NextResponse.json({ error: data.status || 'Places API error' }, { status: 502 })
  }

  return NextResponse.json(data)
}
