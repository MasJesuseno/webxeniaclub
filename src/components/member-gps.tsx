"use client"

import { useState, useCallback } from "react"

interface GPSData {
  latitude: number
  longitude: number
  accuracy: number
  label?: string
}

interface MemberGPSProps {
  onLocationCapture: (location: GPSData) => void
  buttonLabel?: string
  showLabel?: boolean
}

export function MemberGPS({
  onLocationCapture,
  buttonLabel = "Dapatkan Lokasi Saya",
  showLabel = true,
}: MemberGPSProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [location, setLocation] = useState<GPSData | null>(null)

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung GPS")
      return
    }

    setLoading(true)
    setError("")

    try {
      const pos = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        }
      )

      const gpsData: GPSData = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
      }

      // Try reverse geocoding with Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${gpsData.latitude}&lon=${gpsData.longitude}&accept-language=id`,
          {
            headers: {
              "User-Agent": "DXIC-Member-App/1.0",
            },
          }
        )
        if (res.ok) {
          const data = await res.json()
          if (data.display_name) {
            gpsData.label = formatLocation(data.address)
          }
        }
      } catch {
        // Reverse geocoding failed, continue without label
      }

      setLocation(gpsData)
      onLocationCapture(gpsData)
    } catch (err: any) {
      if (err.code === 1) {
        setError("Izin lokasi ditolak. Silakan izinkan akses lokasi.")
      } else if (err.code === 2) {
        setError("Tidak dapat mendeteksi lokasi. Coba di luar ruangan.")
      } else {
        setError("Gagal mendapatkan lokasi: " + err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [onLocationCapture])

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Mendapatkan lokasi...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {buttonLabel}
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {showLabel && location && location.label && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
          <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Lokasi terdeteksi
          </div>
          <p className="text-green-600 text-xs">{location.label}</p>
          {location.accuracy > 0 && (
            <p className="text-green-500 text-xs mt-1">
              Akurasi: ~{location.accuracy}m
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function formatLocation(address: any): string {
  const parts: string[] = []
  if (address.village || address.suburb || address.neighbourhood) {
    parts.push(address.village || address.suburb || address.neighbourhood)
  }
  if (address.city_district || address.district || address.county) {
    parts.push(address.city_district || address.district || address.county)
  }
  if (address.city || address.town || address.municipality) {
    parts.push(address.city || address.town || address.municipality)
  }
  if (address.state) parts.push(address.state)
  if (address.country) parts.push(address.country)

  return parts.join(", ")
}
