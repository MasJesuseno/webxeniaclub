import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

// GET - Ambil semua pesan group chat "Ngobrol Bareng"
export async function GET() {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Cari atau buat group chat
  let groupChat = await prisma.conversation.findFirst({
    where: { type: "GROUP", name: "Ngobrol Bareng" },
  })

  if (!groupChat) {
    groupChat = await prisma.conversation.create({
      data: { type: "GROUP", name: "Ngobrol Bareng" },
    })
  }

  // Cek apakah sudah jadi partisipan
  const participation = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId: groupChat.id,
      memberId: session.memberId!,
    },
  })

  if (!participation) {
    // Auto-join ke group chat
    await prisma.conversationParticipant.create({
      data: {
        conversationId: groupChat.id,
        memberId: session.memberId!,
      },
    })
  }

  // Ambil pesan
  const messages = await prisma.message.findMany({
    where: { conversationId: groupChat.id },
    orderBy: { createdAt: "asc" },
    take: 100, // ambil 100 pesan terakhir
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

  // Ambil semua member data untuk pesan
  const senderIds = [...new Set(messages.map((m) => m.senderId))]
  const members = await prisma.prospectiveMember.findMany({
    where: { memberId: { in: senderIds } },
    select: {
      memberId: true,
      namaLengkap: true,
      namaPanggilan: true,
      region: true,
    },
  })

  return NextResponse.json({
    conversationId: groupChat.id,
    messages,
    members,
    currentMemberId: session.memberId,
  })
}

// POST - Kirim pesan ke group chat
export async function POST(request: Request) {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { content, imageUrl } = body

  if ((!content || !content.trim()) && !imageUrl) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 })
  }

  // Cari group chat
  let groupChat = await prisma.conversation.findFirst({
    where: { type: "GROUP", name: "Ngobrol Bareng" },
  })

  if (!groupChat) {
    groupChat = await prisma.conversation.create({
      data: { type: "GROUP", name: "Ngobrol Bareng" },
    })
  }

  // Auto-join jika belum
  await prisma.conversationParticipant.upsert({
    where: {
      conversationId_memberId: {
        conversationId: groupChat.id,
        memberId: session.memberId!,
      },
    },
    update: {},
    create: {
      conversationId: groupChat.id,
      memberId: session.memberId!,
    },
  })

  // Kirim pesan
  const message = await prisma.message.create({
    data: {
      conversationId: groupChat.id,
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

  // Update timestamp
  await prisma.conversation.update({
    where: { id: groupChat.id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({ message })
}
