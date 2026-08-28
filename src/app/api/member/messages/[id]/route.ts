import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

// PUT - Edit pesan (hanya pengirim)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const message = await prisma.message.findUnique({ where: { id } })
  if (!message) {
    return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 })
  }
  if (message.senderId !== session.memberId) {
    return NextResponse.json({ error: "Hanya pengirim yang bisa edit" }, { status: 403 })
  }

  const body = await request.json()
  const { content } = body

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 })
  }

  const updated = await prisma.message.update({
    where: { id },
    data: {
      content: content.trim(),
      isEdited: true,
    },
    select: {
      id: true,
      senderId: true,
      content: true,
      imageUrl: true,
      isEdited: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ message: updated })
}

// DELETE - Hapus pesan (soft delete, hanya pengirim)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const message = await prisma.message.findUnique({ where: { id } })
  if (!message) {
    return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 })
  }
  if (message.senderId !== session.memberId) {
    return NextResponse.json({ error: "Hanya pengirim yang bisa hapus" }, { status: 403 })
  }

  await prisma.message.update({
    where: { id },
    data: {
      content: "",
      isDeleted: true,
    },
  })

  return NextResponse.json({ success: true })
}
