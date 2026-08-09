import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function MemberBeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug, status: "published" },
    include: {
      author: { select: { name: true } },
      category: true,
    },
  })

  if (!post) notFound()

  const relatedPosts = await prisma.post.findMany({
    where: {
      status: "published",
      id: { not: post.id },
      ...(post.categoryId ? { categoryId: post.categoryId } : {}),
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  })

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link
        href="/member/berita"
        className="inline-flex items-center gap-1 text-xs text-red-600 font-medium hover:underline"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Berita
      </Link>

      {/* Article */}
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Featured Image */}
        {post.image && (
          <div className="w-full h-48 overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <header className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {post.category && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: post.category.color || "#DC2626" }}
                >
                  {post.category.name}
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-gray-900 leading-snug">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {post.author.name}
              </span>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-sm max-w-none editor-content text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Berita Terkait</h3>
          <div className="space-y-2">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                href={`/member/berita/${rp.slug}`}
                className="block bg-white rounded-xl p-3 border border-gray-100 hover:shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex gap-3">
                  {rp.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <img src={rp.image} alt={rp.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-gray-900 line-clamp-2 leading-snug">
                      {rp.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {rp.publishedAt ? formatDate(rp.publishedAt) : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
