import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

// POST - Kirim pesan
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Cek apakah member ini partisipan
  const participation = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId: id,
      memberId: session.memberId!,
    },
  })

  if (!participation) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 })
  }

  const body = await request.json()
  const { content, imageUrl } = body

  if ((!content || !content.trim()) && !imageUrl) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: session.memberId!,
      content: content?.trim() || "",
      imageUrl: imageUrl || null,
    },
    select: {
      id: true,
      senderId: true,
      content: true,
      imageUrl: true,
      isEdited: true,
      isDeleted: true,
      createdAt: true,
    },
  })

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({ message })
}
