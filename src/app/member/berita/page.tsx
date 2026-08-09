import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDate, truncate, stripHtml } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function MemberBeritaPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  const posts = await prisma.post.findMany({
    where: { status: "published" },
    include: {
      author: { select: { name: true } },
      category: true,
    },
    orderBy: { publishedAt: "desc" },
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Berita</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Informasi dan berita terbaru seputar DXIC
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-red-600 text-white shadow-sm">
          Semua
        </span>
        {categories.map((cat) => (
          <span
            key={cat.id}
            className="px-3 py-1 rounded-full text-[10px] font-medium bg-white text-gray-600 border border-gray-200"
          >
            {cat.name}
          </span>
        ))}
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/member/berita/${post.slug}`}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full dxic-gradient flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {post.category && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-semibold text-white"
                        style={{ backgroundColor: post.category.color || "#DC2626" }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {post.publishedAt ? formatDate(post.publishedAt) : ""}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                    {post.excerpt || truncate(stripHtml(post.content), 100)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {post.author.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-sm text-gray-500">Belum ada berita</p>
        </div>
      )}
    </div>
  )
}
