import { prisma } from "@/lib/prisma"
import { GalleryManager } from "./gallery-manager"

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { album: { select: { title: true, slug: true } } },
  })

  const albums = await prisma.album.findMany({
    orderBy: { title: "asc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Galeri Foto</h1>
      <GalleryManager items={items} albums={albums} />
    </div>
  )
}
