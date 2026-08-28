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
            select: { id: true, createdAt: true },
          },
        },
      },
    },
  })

  let unreadCount = 0
  let unreadConversations = 0

  for (const p of participations) {
    const unreadMessages = p.conversation.messages.filter(
      (msg) => !p.lastReadAt || msg.createdAt > p.lastReadAt
    )
    if (unreadMessages.length > 0) {
      unreadCount += unreadMessages.length
      unreadConversations++
    }
  }

  return NextResponse.json({ unreadCount, unreadConversations })
}
