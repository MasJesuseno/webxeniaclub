import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (status !== "Open" && status !== "Close") {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })
  }

  const sos = await prisma.sosMessage.findUnique({ where: { id } })
  if (!sos) {
    return NextResponse.json({ error: "Data SOS tidak ditemukan" }, { status: 404 })
  }

  // Hanya pemilik (memberId cocok) yang bisa edit status
  if (sos.memberId !== session.memberId) {
    return NextResponse.json({ error: "Anda tidak memiliki izin untuk mengubah status SOS ini" }, { status: 403 })
  }

  await prisma.sosMessage.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ success: true })
}
