import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) return { title: "Postingan Tidak Ditemukan" };

  return {
    title: post.title,
    description: post.excerpt || post.title,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, status: "published" },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  const relatedPosts = await prisma.post.findMany({
    where: {
      status: "published",
      categoryId: post.categoryId,
      id: { not: post.id },
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      {/* Article */}
      <article className="py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/berita" className="hover:text-primary-600 transition-colors">
              Berita
            </Link>
            <span>/</span>
            <span className="text-gray-400 truncate max-w-[200px]">
              {post.title}
            </span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <span
                className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4"
                style={{
                  backgroundColor: post.category.color + "20",
                  color: post.category.color,
                }}
              >
                {post.category.name}
              </span>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {post.author.name[0]}
              </div>
              <span>{post.author.name}</span>
              <span>&middot;</span>
              <span>
                {post.publishedAt
                  ? formatDate(post.publishedAt)
                  : formatDate(post.createdAt)}
              </span>
            </div>
          </header>

          {/* Cover Image */}
          {post.image && (
            <div className="aspect-[2/1] rounded-2xl overflow-hidden mb-8 bg-gray-100">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-primary-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
              {post.tags.map((pt) => (
                <span
                  key={pt.tag.id}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg"
                >
                  #{pt.tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Berita Terkait
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/berita/${rp.slug}`}
                  className="card group"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
