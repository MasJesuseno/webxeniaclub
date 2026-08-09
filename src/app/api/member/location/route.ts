import { getMemberSession } from "@/lib/member-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const member = await getMemberSession()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { latitude, longitude, locationLabel } = body

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Latitude dan longitude harus diisi" },
        { status: 400 }
      )
    }

    await prisma.prospectiveMember.update({
      where: { id: member.id },
      data: {
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastLocationAt: new Date(),
        lastLocationLabel: locationLabel || null,
        isOnline: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update location error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
