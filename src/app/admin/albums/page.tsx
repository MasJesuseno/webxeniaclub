import { prisma } from "@/lib/prisma"
import { AlbumManager } from "./album-manager"

export default async function AdminAlbumsPage() {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Album Galeri</h1>
      <AlbumManager albums={albums} />
    </div>
  )
}
