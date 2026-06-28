import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { CommentForm } from "@/components/comment-form"
import { getCommentsByPost } from "@/lib/actions"

export default async function BeritaDetailPage({
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

  const comments = await getCommentsByPost(post.id)

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
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/berita" className="hover:text-red-600 transition-colors">Berita</Link>
            <span>/</span>
            <span className="text-gray-900 truncate">{post.title}</span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
              style={{ backgroundColor: post.category.color || "#DC2626" }}
            >
              {post.category.name}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {post.author.name}
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none editor-content bg-white p-8 rounded-2xl shadow-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Comments Section */}
        <section className="mt-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Komentar ({comments.length})
            </h3>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4 mb-8">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <span className="text-red-600 font-bold text-sm">
                        {comment.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{comment.name}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 mb-6">
                <p className="text-gray-400 text-sm">Belum ada komentar. Jadilah yang pertama!</p>
              </div>
            )}

            {/* Comment Form */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Tinggalkan Komentar</h4>
              <CommentForm postId={post.id} />
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Berita Terkait</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/berita/${rp.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="h-40 overflow-hidden bg-gray-100">
                    {rp.image ? (
                      <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full dxic-gradient flex items-center justify-center opacity-50" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{rp.publishedAt ? formatDate(rp.publishedAt) : ""}</p>
                    <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {rp.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
