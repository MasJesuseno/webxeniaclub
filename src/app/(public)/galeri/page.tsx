import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { GalleryImage } from "@/components/gallery-image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto dan video kegiatan SMA Annajah",
};

export default async function GaleriPage() {
  const albums = await prisma.album.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  const latestItems = await prisma.galleryItem.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
    include: { album: true },
  });

  return (
    <div className="min-h-screen">
      <Breadcrumb items={[{ label: "Galeri" }]} />
      {/* Hero */}
      <section className="bg-gradient-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Galeri
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Dokumentasi kegiatan dan momen berharga di SMA Annajah
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Albums */}
          {albums.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Album Galeri
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/galeri/${album.slug}`}
                    className="group relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200"
                  >
                    {album.coverImage ? (
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-20 h-20 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white font-semibold text-lg">
                          {album.title}
                        </h3>
                        <p className="text-white/70 text-sm mt-1">
                          {album._count.items} foto
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Latest Photos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Foto Terbaru
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {latestItems.length > 0 ? (
                latestItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                  >
                    <GalleryImage
                      src={item.image}
                      alt={item.title || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {item.album && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur rounded-lg text-white text-xs">
                        {item.album.title}
                      </div>
                    )}
                  </a>
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Belum ada foto di galeri</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
