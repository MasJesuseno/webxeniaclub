import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function GaleriPage() {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: { take: 1, orderBy: { createdAt: "desc" } },
    },
  })

  const latestPhotos = await prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="dxic-gradient py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">Galeri Foto</h1>
          <p className="text-white/80 mt-2">Dokumentasi kegiatan dan momen kebersamaan DXIC</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* All Photos Grid */}
        {latestPhotos.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Foto Terbaru</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {latestPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => window.open(photo.image, "_blank")}
                >
                  <img
                    src={photo.image}
                    alt={photo.title || "Foto galeri"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                  {photo.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Album Foto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/galeri/${album.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden">
                    {album.coverImage ? (
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : album.items[0] ? (
                      <img
                        src={album.items[0].image}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full dxic-gradient flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      {album._count.items} foto
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{album.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada galeri</h3>
            <p className="text-gray-400">Belum ada album galeri yang tersedia.</p>
          </div>
        )}
      </div>
    </div>
  )
}
