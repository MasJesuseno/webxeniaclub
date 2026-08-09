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
    const query = searchParams.get("q") || ""
    const byId = searchParams.get("byId") === "true"
    const byPlat = searchParams.get("byPlat") === "true"

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const select = {
      id: true,
      memberId: true,
      namaLengkap: true,
      namaPanggilan: true,
      noWa: true,
      provinsi: true,
      kotaKabupaten: true,
      region: true,
      foto: true,
      jenisMobil: true,
      tipeMobil: true,
      noPolisi: true,
      warna: true,
    } as const

    const where = byId
      ? { memberId: { contains: query } } // Search by member ID
      : byPlat
        ? { noPolisi: { contains: query } } // Search by license plate
        : { namaLengkap: { contains: query } } // Search by name

    const results = await prisma.prospectiveMember.findMany({
      where: {
        ...where,
        status: "Diterima",
      },
      select,
      take: 20,
      orderBy: { namaLengkap: "asc" },
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search members error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
