"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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

interface MapViewProps {
  members: NearbyMember[]
  myLocation: { lat: number; lng: number; label?: string } | null
}

export default function MemberMapView({ members, myLocation }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Cleanup previous map
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Fix Leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    })

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(
      [myLocation?.lat || -6.2088, myLocation?.lng || 106.8456],
      12
    )

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    // Add user marker
    if (myLocation) {
      L.circleMarker([myLocation.lat, myLocation.lng], {
        radius: 10,
        fillColor: "#DC2626",
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup("<b>Lokasi Saya</b>")
    }

    // Add member markers
    members.forEach((member) => {
      const color =
        member.distance < 10
          ? "#16A34A"
          : member.distance < 25
          ? "#2563EB"
          : "#9333EA"

      L.circleMarker([member.lastLatitude, member.lastLongitude], {
        radius: 7,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;padding:4px;">
            <b>${member.namaLengkap}</b><br/>
            ID: ${member.memberId}<br/>
            ${member.distance} km dari Anda<br/>
            ${member.lastLocationLabel || ""}
          </div>`
        )
    })

    // Fit bounds to show all markers
    const allPoints: [number, number][] = members.map((m) => [
      m.lastLatitude,
      m.lastLongitude,
    ])
    if (myLocation) {
      allPoints.push([myLocation.lat, myLocation.lng])
    }
    if (allPoints.length > 1) {
      map.fitBounds(allPoints, { padding: [50, 50] })
    }

    mapRef.current = map

    // Cleanup on unmount
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [members, myLocation])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200"
      style={{ zIndex: 1 }}
    />
  )
}
