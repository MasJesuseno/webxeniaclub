import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { GalleryGrid } from "./gallery-grid"

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const album = await prisma.album.findUnique({
    where: { slug },
    include: { items: { orderBy: { createdAt: "desc" } } },
  })

  if (!album) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/galeri" className="hover:text-red-600 transition-colors">Galeri</Link>
            <span>/</span>
            <span className="text-gray-900">{album.title}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{album.title}</h1>
            {album.description && (
              <p className="text-gray-500 mt-2">{album.description}</p>
            )}
          </div>
          <p className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
            {album.items.length} foto
          </p>
        </div>

        {/* Gallery Grid */}
        <GalleryGrid images={album.items.map((item) => ({
          id: item.id,
          src: item.image,
          title: item.title,
          description: item.description,
        }))} />
      </div>
    </div>
  )
}
