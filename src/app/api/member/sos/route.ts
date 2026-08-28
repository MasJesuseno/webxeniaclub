import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

export async function GET() {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const messages = await prisma.sosMessage.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      memberId: true,
      nama: true,
      region: true,
      hp: true,
      latitude: true,
      longitude: true,
      kebutuhan: true,
      status: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    messages,
    currentMemberId: session.memberId,
  })
}

export async function POST(request: Request) {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { kebutuhan, latitude, longitude } = body

  if (!kebutuhan || !kebutuhan.trim()) {
    return NextResponse.json({ error: "Kebutuhan harus diisi" }, { status: 400 })
  }

  await prisma.sosMessage.create({
    data: {
      memberId: session.memberId,
      nama: session.namaLengkap,
      region: session.region,
      hp: session.noWa,
      latitude: latitude || null,
      longitude: longitude || null,
      kebutuhan: kebutuhan.trim(),
      status: "Open",
    },
  })

  return NextResponse.json({ success: true })
}
