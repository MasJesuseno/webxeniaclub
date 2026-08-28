import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

// GET - List semua percakapan member ini
export async function GET() {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const participations = await prisma.conversationParticipant.findMany({
    where: {
      memberId: session.memberId!,
      conversation: { type: "DM" },
    },
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              senderId: true,
              imageUrl: true,
              createdAt: true,
              isDeleted: true,
            },
          },
          participants: {
            select: { memberId: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Ambil data member untuk setiap partisipan
  const conversations = await Promise.all(
    participations.map(async (p) => {
      const otherMemberIds = p.conversation.participants
        .filter((pt) => pt.memberId !== session.memberId)
        .map((pt) => pt.memberId)

      const otherMembers = otherMemberIds.length > 0
        ? await prisma.prospectiveMember.findMany({
            where: { memberId: { in: otherMemberIds } },
            select: {
              memberId: true,
              namaLengkap: true,
              namaPanggilan: true,
              region: true,
              isOnline: true,
            },
          })
        : []

      const lastMessage = p.conversation.messages[0] || null
      const isGroup = p.conversation.type === "GROUP"

      return {
        id: p.conversation.id,
        type: p.conversation.type,
        name: p.conversation.name,
        otherMembers,
        lastMessage: lastMessage
          ? {
              ...lastMessage,
              content: lastMessage.isDeleted ? "Pesan已被hapus" : lastMessage.content,
            }
          : null,
        createdAt: p.conversation.createdAt,
      }
    })
  )

  return NextResponse.json({ conversations })
}

// POST - Buat atau ambil percakapan DM dengan member lain
export async function POST(request: Request) {
  try {
    const session = await getMemberSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { targetMemberId } = body

    console.log("[Chat POST] session.memberId:", session.memberId, "target:", targetMemberId)

    if (!targetMemberId) {
      return NextResponse.json({ error: "Target member harus diisi" }, { status: 400 })
    }

    if (!session.memberId) {
      return NextResponse.json({ error: "Session tidak valid, memberId kosong" }, { status: 400 })
    }

    // Cek target member exists
    const targetMember = await prisma.prospectiveMember.findFirst({
      where: { memberId: targetMemberId },
    })
    if (!targetMember) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 })
    }

    // Cek sudah ada DM conversation?
    const existingParticipations = await prisma.conversationParticipant.findMany({
      where: { memberId: { in: [session.memberId, targetMemberId] } },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    })

    for (const p of existingParticipations) {
      if (p.conversation.type === "DM") {
        const participantMemberIds = p.conversation.participants.map((pt) => pt.memberId)
        if (
          participantMemberIds.includes(session.memberId) &&
          participantMemberIds.includes(targetMemberId)
        ) {
          console.log("[Chat POST] returning existing conversation:", p.conversation.id)
          return NextResponse.json({ conversationId: p.conversation.id })
        }
      }
    }

    // Buat DM baru
    console.log("[Chat POST] creating new conversation")
    const conversation = await prisma.conversation.create({
      data: {
        type: "DM",
        participants: {
          create: [
            { memberId: session.memberId },
            { memberId: targetMemberId },
          ],
        },
      },
    })

    console.log("[Chat POST] created:", conversation.id)
    return NextResponse.json({ conversationId: conversation.id })
  } catch (error) {
    console.error("[Chat POST] Error:", error)
    return NextResponse.json({ error: "Gagal membuat percakapan: " + (error as Error).message }, { status: 500 })
  }
}
