import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDate, truncate, stripHtml } from "@/lib/utils"

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>
}) {
  const { kategori } = await searchParams
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  const where: any = { status: "published" }
  if (kategori) {
    const cat = categories.find((c) => c.slug === kategori)
    if (cat) where.categoryId = cat.id
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { name: true } },
      category: true,
    },
    orderBy: { publishedAt: "desc" },
  })

  const activeCategory = kategori
    ? categories.find((c) => c.slug === kategori)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="dxic-gradient py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">Berita</h1>
          <p className="text-white/80 mt-2">Informasi terbaru seputar {process.env.CLUB_NAME || "DXIC"}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <Link
            href="/berita"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !kategori
                ? "bg-red-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
            }`}
          >
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/berita?kategori=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory?.id === cat.id
                  ? "text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
              }`}
              style={activeCategory?.id === cat.id ? { backgroundColor: cat.color || "#DC2626" } : {}}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/berita/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full dxic-gradient flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  {post.category && (
                    <span
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: post.category.color || "#DC2626" }}
                    >
                      {post.category.name}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 mb-2">
                    {post.publishedAt ? formatDate(post.publishedAt) : ""}
                  </p>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {post.excerpt || truncate(stripHtml(post.content), 150)}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Oleh: {post.author.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada berita</h3>
            <p className="text-gray-400">Belum ada berita yang dipublikasikan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
