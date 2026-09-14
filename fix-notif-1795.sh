#!/bin/bash
# ============================================================
# FIX: Reset lastReadAt member 1795 di Ngobrol Bareng
# Jalankan di server via PuTTY
# ============================================================

cd /home/ubuntu/xeniaclub

node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const memberId = '1795';
  
  // Cari partisipasi di Ngobrol Bareng
  const participation = await prisma.conversationParticipant.findFirst({
    where: {
      memberId,
      conversation: { type: 'GROUP', name: 'Ngobrol Bareng' }
    }
  });

  if (!participation) {
    console.log('Partisipasi Ngobrol Bareng tidak ditemukan untuk member 1795');
    return;
  }

  console.log('Sebelum fix:');
  console.log('  lastReadAt:', participation.lastReadAt);

  // Update lastReadAt ke waktu sekarang
  await prisma.conversationParticipant.update({
    where: { id: participation.id },
    data: { lastReadAt: new Date() }
  });

  const updated = await prisma.conversationParticipant.findUnique({
    where: { id: participation.id }
  });

  console.log('Sesudah fix:');
  console.log('  lastReadAt:', updated.lastReadAt);
  console.log('');
  console.log('✅ lastReadAt berhasil diupdate!');
  console.log('   Sekarang coba refresh halaman member area di browser.');
  console.log('   Badge notifikasi seharusnya sudah hilang.');
}

main().catch(e => console.error(e)).finally(() => prisma.\$disconnect());
"
