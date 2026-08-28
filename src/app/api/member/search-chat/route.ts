import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

// GET - Cari member by ID atau nama (untuk fitur chat)
export async function GET(request: Request) {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ members: [] })
  }

  // Cari by memberId exact match ATAU nama LIKE
  // Filter sama dengan public API: exclude Black List, include Diterima/Aktif
  const members = await prisma.prospectiveMember.findMany({
    where: {
      AND: [
        { statusMember: { not: "Black List" } },
        { OR: [{ status: "Diterima" }, { statusMember: "Aktif" }] },
        {
          OR: [
            { memberId: q },
            { namaLengkap: { contains: q } },
            { namaPanggilan: { contains: q } },
          ],
        },
      ],
    },
    select: {
      memberId: true,
      namaLengkap: true,
      namaPanggilan: true,
      region: true,
      isOnline: true,
      noWa: true,
    },
    take: 10,
    orderBy: { namaLengkap: "asc" },
  })

  return NextResponse.json({ members })
}
