import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMemberSession } from "@/lib/member-auth"

// GET - Hitung jumlah pesan belum dibaca
export async function GET() {
  const session = await getMemberSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Ambil semua partisipasi member ini
  const participations = await prisma.conversationParticipant.findMany({
    where: { memberId: session.memberId! },
    include: {
      conversation: {
        include: {
          messages: {
            where: {
              senderId: { not: session.memberId! },
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, senderId: true, createdAt: true, conversationId: true },
          },
        },
      },
    },
  })

  let unreadCount = 0
  let unreadConversations = 0
  let latestMessage: { senderName: string; conversationId: string } | null = null
  let latestTime: Date | null = null

  for (const p of participations) {
    // Hitung unread messages
    const allUnread = await prisma.message.findMany({
      where: {
        conversationId: p.conversationId,
        senderId: { not: session.memberId! },
        createdAt: p.lastReadAt ? { gt: p.lastReadAt } : undefined,
      },
      select: { id: true, createdAt: true },
    })

    if (allUnread.length > 0) {
      unreadCount += allUnread.length
      unreadConversations++

      // Cek apakah ini pesan terbaru
      const latest = p.conversation.messages[0]
      if (latest && (!latestTime || latest.createdAt > latestTime)) {
        latestTime = latest.createdAt
        // Ambil nama pengirim
        const sender = await prisma.prospectiveMember.findFirst({
          where: { memberId: latest.senderId },
          select: { namaLengkap: true, namaPanggilan: true },
        })
        latestMessage = {
          senderName: sender?.namaPanggilan || sender?.namaLengkap || "Member",
          conversationId: latest.conversationId,
        }
      }
    }
  }

  return NextResponse.json({ unreadCount, unreadConversations, latestMessage })
}
