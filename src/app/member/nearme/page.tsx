"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamically import Leaflet to avoid loading Leaflet CSS on list view
const MapView = dynamic(() => import("@/components/member-map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-gray-100 flex items-center justify-center">
      <p className="text-sm text-gray-400">Memuat peta...</p>
    </div>
  ),
})

interface NearbyMember {
  id: string
  memberId: string
  namaLengkap: string
  noWa: string
  provinsi: string
  kotaKabupaten: string
  region: string
  foto: string
  lastLatitude: number
  lastLongitude: number
  lastLocationLabel: string
  lastLocationAt: string
  jenisMobil: string
  noPolisi: string
  warna: string
  distance: number
}

export default function MemberNearMePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [members, setMembers] = useState<NearbyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [onlineCount, setOnlineCount] = useState(0)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number; label?: string } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [radius, setRadius] = useState(100)
  // Refs agar fetchNearby/getCurrentPosition tidak bergantung pada state radius/lokasi
  const radiusRef = useRef(100)
  const locationRef = useRef<{ lat: number; lng: number } | null>(null)
  const requestSeqRef = useRef(0) // guard: hanya respons terbaru yang dipakai

  const fetchNearby = useCallback(
    async (lat: number, lng: number) => {
      const seq = ++requestSeqRef.current
      setLoading(true)
      setError("")
      try {
        const res = await fetch(
          `/api/member/nearme?lat=${lat}&lng=${lng}&radius=${radiusRef.current}`
        )
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/member/login")
            return
          }
          throw new Error("Gagal memuat data")
        }
        const data = await res.json()
        if (seq !== requestSeqRef.current) return // abaikan respons kedaluwarsa
        setMembers(data.results)
        setOnlineCount(data.onlineCount)
        setMyLocation(data.yourLocation)
      } catch (err: any) {
        if (seq !== requestSeqRef.current) return
        setError(err.message)
      } finally {
        if (seq === requestSeqRef.current) setLoading(false)
      }
    },
    [router]
  )

  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung GPS")
      setGpsLoading(false)
      return
    }

    setGpsLoading(true)
    try {
      const pos = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          })
        }
      )

      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      locationRef.current = { lat, lng }
      setMyLocation({ lat, lng })
      await fetchNearby(lat, lng)
    } catch (err: any) {
      if (err.code === 1) {
        setError("Izin lokasi ditolak. Gunakan lokasi default.")
      } else {
        setError("Gagal mendapatkan lokasi. Menggunakan lokasi default.")
      }
      // Default location: Jakarta
      locationRef.current = { lat: -6.2088, lng: 106.8456 }
      await fetchNearby(-6.2088, 106.8456)
    } finally {
      setGpsLoading(false)
    }
  }, [fetchNearby])

  useEffect(() => {
    getCurrentPosition()
  }, [getCurrentPosition])

  // No map initialization here - handled by the dynamic MapView component

  async function handleRefreshLocation() {
    await getCurrentPosition()
  }

  function handleRadiusChange(r: number) {
    setRadius(r)
    radiusRef.current = r
    // Re-fetch dengan lokasi terakhir yang diketahui (tanpa minta izin GPS ulang)
    if (locationRef.current) {
      fetchNearby(locationRef.current.lat, locationRef.current.lng)
    }
  }

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-red-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Mencari member di sekitar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Member Near Me</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {onlineCount} member update GPS hari ini · {members.length} di sekitar Anda (radius {radius} km)
          </p>
        </div>
        <button
          onClick={handleRefreshLocation}
          disabled={gpsLoading}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Refresh lokasi"
        >
          <svg
            className={`w-5 h-5 ${gpsLoading ? "animate-spin" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Radius Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-500 shrink-0">Radius</span>
        <div className="flex flex-1 bg-gray-100 rounded-xl p-1 gap-1">
          {[10, 25, 50, 100].map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusChange(r)}
              disabled={loading}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                radius === r
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            viewMode === "list" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Daftar
          </div>
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            viewMode === "map" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Peta
          </div>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && myLocation && (
        <MapView members={members} myLocation={myLocation} />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-2">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <p className="text-sm text-gray-500">Belum ada member dalam radius {radius} km</p>
              <p className="text-xs text-gray-400 mt-1">
                Hanya member yang update GPS hari ini yang ditampilkan. Coba perbesar radius atau pastikan member lain juga update lokasinya.
              </p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {member.namaLengkap.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-gray-900">
                        {member.namaLengkap}
                      </h3>
                      <span className="text-xs font-bold text-red-600">
                        {member.distance} km
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      ID: {member.memberId}
                    </p>
                    {member.lastLocationLabel && (
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {member.lastLocationLabel}
                      </p>
                    )}
                    {member.lastLocationAt && (
                      <p className="text-[10px] text-green-600 mt-0.5">
                        Update GPS:{" "}
                        {new Date(member.lastLocationAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {member.region && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-[10px] font-medium">
                          {member.region}
                        </span>
                      )}
                      {member.jenisMobil && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">
                          {member.jenisMobil} · {member.noPolisi}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (member.noWa) {
                        window.open(
                          `https://wa.me/${member.noWa.replace(/^0/, "62").replace(/[^0-9]/g, "")}`,
                          "_blank"
                        )
                      }
                    }}
                    className="shrink-0 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Hubungi via WhatsApp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
