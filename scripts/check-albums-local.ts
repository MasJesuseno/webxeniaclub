import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const albums = await prisma.album.findMany({
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Total albums: ${albums.length}`);
  for (const a of albums) {
    console.log(`\n📁 Album: ${a.title} (${a.id})`);
    console.log(`   Slug: ${a.slug}`);
    console.log(`   Cover: ${a.coverImage || "(none)"}`);
    console.log(`   Description: ${(a.description || "").slice(0, 100)}`);
    console.log(`   Items: ${a.items.length}`);
    for (const gi of a.items) {
      console.log(`   🖼️  ${gi.title || "(no title)"} - ${gi.image}`);
    }
  }

  // Also check total gallery items count
  const totalItems = await prisma.galleryItem.count();
  console.log(`\n📊 Total gallery items: ${totalItems}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
