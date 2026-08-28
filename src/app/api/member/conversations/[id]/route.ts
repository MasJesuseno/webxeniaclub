import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

// GET - Ambil detail percakapan + semua pesan
export async function GET(
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

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        select: { memberId: true },
      },
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: "Conversation tidak ditemukan" }, { status: 404 })
  }

  // Ambil pesan
  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
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

  // Ambil data member untuk semua partisipan
  const memberIds = conversation.participants.map((p) => p.memberId)
  const members = await prisma.prospectiveMember.findMany({
    where: { memberId: { in: memberIds } },
    select: {
      memberId: true,
      namaLengkap: true,
      namaPanggilan: true,
      region: true,
      isOnline: true,
    },
  })

  // Update lastReadAt
  await prisma.conversationParticipant.update({
    where: { id: participation.id },
    data: { lastReadAt: new Date() },
  })

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
    },
    members,
    messages,
  })
}
