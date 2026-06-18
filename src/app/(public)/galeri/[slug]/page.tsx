import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { GalleryImage } from "@/components/gallery-image";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await prisma.album.findUnique({ where: { slug } });
  if (!album) return { title: "Album Tidak Ditemukan" };
  return {
    title: album.title,
    description: album.description || album.title,
  };
}

export default async function AlbumDetailPage({ params }: Props) {
  const { slug } = await params;

  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { order: "asc" } },
    },
  });

  if (!album) notFound();

  return (
    <div className="min-h-screen">
      <Breadcrumb items={[{ href: "/galeri", label: "Galeri" }, { label: album.title }]} />
      {/* Hero */}
      <section className="bg-gradient-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-1 text-primary-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Galeri
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-primary-200 text-lg max-w-2xl mx-auto">
              {album.description}
            </p>
          )}
          <p className="text-primary-300 text-sm mt-2">
            {album.items.length} foto
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {album.items.length > 0 ? (
              album.items.map((item) => (
                <a
                  key={item.id}
                  href={item.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                >
                  <GalleryImage
                    src={item.image}
                    alt={item.title || album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                    </div>
                  )}
                </a>
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-gray-400">
                <p>Belum ada foto di album ini</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
