import { getMemberSession } from "@/lib/member-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const member = await getMemberSession()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get("lat") || "0")
    const lng = parseFloat(searchParams.get("lng") || "0")
    const radius = parseFloat(searchParams.get("radius") || "50") // km

    // Hanya tampilkan member yang update GPS hari ini (WIB)
    const startOfToday = startOfTodayWIB()

    // Get online members with location data updated today
    const onlineMembers = await prisma.prospectiveMember.findMany({
      where: {
        isOnline: true,
        lastLatitude: { not: null },
        lastLongitude: { not: null },
        memberId: { not: null },
        status: "Diterima",
        lastLocationAt: { gte: startOfToday },
      },
      select: {
        id: true,
        memberId: true,
        namaLengkap: true,
        noWa: true,
        provinsi: true,
        kotaKabupaten: true,
        region: true,
        foto: true,
        lastLatitude: true,
        lastLongitude: true,
        lastLocationLabel: true,
        lastLocationAt: true,
        jenisMobil: true,
        noPolisi: true,
        warna: true,
      },
    })

    // Calculate distances using Haversine formula
    const results = onlineMembers
      .map((m) => {
        const distance = haversineDistance(
          lat,
          lng,
          m.lastLatitude!,
          m.lastLongitude!
        )
        return { ...m, distance: Math.round(distance * 10) / 10 }
      })
      .filter((m) => m.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    // Count members who updated GPS today
    const onlineCount = await prisma.prospectiveMember.count({
      where: {
        isOnline: true,
        status: "Diterima",
        lastLocationAt: { gte: startOfToday },
      },
    })

    return NextResponse.json({
      results,
      onlineCount,
      yourLocation: {
        lat,
        lng,
        label: member.lastLocationLabel,
      },
    })
  } catch (error) {
    console.error("Near me error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

/**
 * Awal hari ini dalam zona waktu WIB (UTC+7) sebagai objek Date (UTC).
 * Member yang terakhir update GPS sebelum waktu ini tidak dihitung "hari ini".
 */
function startOfTodayWIB(): Date {
  // getTime() sudah absolut (epoch ms), jadi tinggal geser +7 jam agar
  // komponen tanggal (UTC) mencerminkan jam WIB, lalu hitung awal hari.
  const wibNow = new Date(Date.now() + 7 * 3600000)
  const startOfDayWibMs = Date.UTC(
    wibNow.getUTCFullYear(),
    wibNow.getUTCMonth(),
    wibNow.getUTCDate()
  )
  // Kembalikan ke representasi UTC (awal hari WIB)
  return new Date(startOfDayWibMs - 7 * 3600000)
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
