import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita",
  description: "Berita terbaru dari SMA Annajah",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BeritaPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    include: { author: true, category: true },
  });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="min-h-screen">
      <Breadcrumb items={[{ label: "Berita" }]} />
      {/* Hero */}
      <section className="bg-gradient-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Berita
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Informasi dan berita terbaru dari SMA Annajah
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Kategori</h3>
                  <div className="space-y-2">
                    <Link
                      href="/berita"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                    >
                      <span>Semua</span>
                      <span className="text-xs text-gray-400">{posts.length}</span>
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/berita?kategori=${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-gray-400">{cat._count.posts}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/berita/${post.slug}`}
                      className="card group"
                    >
                      <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        {post.category && (
                          <span
                            className="inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-2"
                            style={{
                              backgroundColor: post.category.color + "20",
                              color: post.category.color,
                            }}
                          >
                            {post.category.name}
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{post.author.name}</span>
                          <span>&middot;</span>
                          <span>{post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <p className="text-gray-400 text-lg">Belum ada berita</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
