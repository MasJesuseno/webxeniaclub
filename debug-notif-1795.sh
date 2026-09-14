#!/bin/bash
# ============================================================
# DEBUG: Cek notifikasi member 1795
# Jalankan di server production via PuTTY/SSH
# ============================================================

cd /home/ubuntu/xeniaclub

echo "=========================================="
echo "  DEBUG NOTIFIKASI MEMBER 1795"
echo "=========================================="

# Jalankan script Node.js untuk query database
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const memberId = '1795';
  
  console.log('\n📋 Semua ConversationParticipant untuk member 1795:\n');
  
  const participations = await prisma.conversationParticipant.findMany({
    where: { memberId },
    include: {
      conversation: {
        select: { id: true, type: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (participations.length === 0) {
    console.log('  ❌ Tidak ada partisipasi percakapan untuk member ini');
    return;
  }
  
  for (const p of participations) {
    const conv = p.conversation;
    console.log('─'.repeat(60));
    console.log('  Conversation: ' + conv.id);
    console.log('  Type: ' + conv.type + (conv.name ? ' (' + conv.name + ')' : ''));
    console.log('  lastReadAt: ' + (p.lastReadAt ? p.lastReadAt.toISOString() : 'NULL (belum pernah dibaca!)'));
    
    // Hitung unread
    const unread = await prisma.message.findMany({
      where: {
        conversationId: conv.id,
        senderId: { not: memberId },
        isDeleted: false,
        createdAt: p.lastReadAt ? { gt: p.lastReadAt } : undefined,
      },
      select: { id: true, senderId: true, content: true, createdAt: true }
    });
    
    if (unread.length > 0) {
      console.log('  ⚠️  UNREAD: ' + unread.length + ' pesan');
      for (const msg of unread) {
        console.log('     - [' + msg.createdAt.toISOString() + '] dari ' + msg.senderId + ': ' + (msg.content || '').substring(0, 50));
      }
    } else {
      console.log('  ✅ Tidak ada unread');
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  
  // Hitung total unread
  let totalUnread = 0;
  for (const p of participations) {
    const count = await prisma.message.count({
      where: {
        conversationId: p.conversationId,
        senderId: { not: memberId },
        isDeleted: false,
        createdAt: p.lastReadAt ? { gt: p.lastReadAt } : undefined,
      }
    });
    totalUnread += count;
  }
  console.log('\n📊 Total unread untuk member 1795: ' + totalUnread + ' pesan\n');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.\$disconnect());
"
