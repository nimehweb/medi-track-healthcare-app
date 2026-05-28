import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Google Maps API key' }, { status: 500 })
  }

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=name,formatted_address,geometry,rating,user_ratings_total,opening_hours,formatted_phone_number,website,reviews` +
    `&key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to load pharmacy details' }, { status: 502 })
  }

  if (data.status !== 'OK') {
    return NextResponse.json({ error: data.status || 'Places API error' }, { status: 502 })
  }

  return NextResponse.json(data.result)
}