#!/bin/bash
# ============================================================
# FIX: Reset lastReadAt SEMUA member di Ngobrol Bareng
# Jalankan di server via PuTTY
# ============================================================

cd /home/ubuntu/xeniaclub

node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Cari group chat Ngobrol Bareng
  const groupChat = await prisma.conversation.findFirst({
    where: { type: 'GROUP', name: 'Ngobrol Bareng' }
  });

  if (!groupChat) {
    console.log('Group chat Ngobrol Bareng tidak ditemukan');
    return;
  }

  // Ambil semua pesan terakhir di group chat
  const lastMessage = await prisma.message.findFirst({
    where: { conversationId: groupChat.id, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  });

  const now = new Date();
  console.log('Waktu sekarang:', now.toISOString());
  console.log('Pesan terakhir:', lastMessage ? lastMessage.createdAt.toISOString() : '-');
  console.log('');

  // Ambil semua participant
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId: groupChat.id }
  });

  console.log('Total participant: ' + participants.length);
  console.log('');

  let updated = 0;
  let skipped = 0;

  for (const p of participants) {
    // Cek apakah ada pesan baru setelah lastReadAt
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: groupChat.id,
        senderId: { not: p.memberId },
        isDeleted: false,
        createdAt: p.lastReadAt ? { gt: p.lastReadAt } : undefined,
      }
    });

    if (unreadCount > 0) {
      await prisma.conversationParticipant.update({
        where: { id: p.id },
        data: { lastReadAt: now }
      });
      console.log('✅ ' + p.memberId + ' | unread: ' + unreadCount + ' → RESET');
      updated++;
    } else {
      skipped++;
    }
  }

  console.log('');
  console.log('==========================================');
  console.log('  SELESAI!');
  console.log('  Reset: ' + updated + ' member');
  console.log('  Skip (sudah OK): ' + skipped + ' member');
  console.log('==========================================');
}

main().catch(e => console.error(e)).finally(() => prisma.\$disconnect());
"
