import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PengurusSection } from "./pengurus-section"

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Special: struktur-organisasi render dari tabel pengurus
  if (slug === "struktur-organisasi") {
    const pengurus = await prisma.pengurus.findMany({
      where: { isActive: true },
      orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
    })

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="dxic-gradient py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              <span>/</span>
              <span className="text-white">Struktur Organisasi</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Struktur Organisasi</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <PengurusSection pengurus={pengurus} />
        </div>
      </div>
    )
  }

  const page = await prisma.page.findUnique({
    where: { slug, status: "published" },
  })

  if (!page) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="dxic-gradient py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white">{page.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{page.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div
          className="editor-content bg-white p-8 rounded-2xl shadow-sm"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}
