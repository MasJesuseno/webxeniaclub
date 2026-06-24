import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDate, truncate, stripHtml } from "@/lib/utils"
import { HomeCarousel } from "./home-carousel"
import { TestimonialCarousel } from "./testimonial-carousel"
import { PartnerCarousel } from "./partner-carousel"

export default async function HomePage() {
  const [profile, featuredPosts, latestPosts, albums, testimonials, partners] = await Promise.all([
    prisma.siteProfile.findFirst(),
    prisma.post.findMany({
      where: { status: "published", featured: true },
      include: { author: { select: { name: true } }, category: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.post.findMany({
      where: { status: "published" },
      include: { author: { select: { name: true } }, category: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
    prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { _count: { select: { items: true } } },
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.partner.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ])

  return (
    <>
      {/* ===== HERO CAROUSEL ===== */}
      <HomeCarousel
        clubName={profile?.shortName || "DXIC"}
        slogan={profile?.slogan || "Xenia Menyatukan Kita"}
        banner={profile?.homeBanner}
        featuredPosts={featuredPosts.map((p) => ({
          title: p.title,
          slug: p.slug,
          image: p.image,
          excerpt: p.excerpt || stripHtml(p.content).substring(0, 150),
        }))}
      />

      {/* ===== TENTANG DXIC ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">Tentang Kami</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                {profile?.shortName || "DXIC"} — {profile?.clubName || "Xenia Club Indonesia"}
              </h2>
              <div className="w-20 h-1 dxic-gradient rounded-full mb-6" />
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {profile?.about || profile?.description || "Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia. Wadah silaturahmi, berbagi pengalaman, dan informasi seputar Daihatsu Xenia."}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-600">{profile?.memberCount || 500}+</div>
                  <div className="text-sm text-gray-500 mt-1">Anggota</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-600">{profile?.cityCount || 30}+</div>
                  <div className="text-sm text-gray-500 mt-1">Kota</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-600">{profile?.establishedYear || "2010"}</div>
                  <div className="text-sm text-gray-500 mt-1">Berdiri</div>
                </div>
              </div>
            </div>

            {/* Visi & Misi */}
            <div className="space-y-6">
              {(profile?.vision || true) && (
                <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border border-red-100">
                  <div className="w-12 h-12 dxic-gradient rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Visi</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {profile?.vision || "Menjadi komunitas Daihatsu Xenia terbesar dan terbaik di Indonesia yang solid, informatif, dan bermanfaat bagi seluruh anggota."}
                  </p>
                </div>
              )}

              {(profile?.mission || true) && (
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Misi</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {profile?.mission || "Mempererat silaturahmi antar sesama pemilik Xenia, berbagi informasi dan tips perawatan, serta mengadakan kegiatan sosial dan kopdar rutin."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BERITA UNGGULAN ===== */}
      {featuredPosts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">Berita</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Berita Unggulan</h2>
              <div className="w-20 h-1 dxic-gradient rounded-full mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
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
                    <p className="text-xs text-gray-500 mb-2">{post.publishedAt ? formatDate(post.publishedAt) : ""}</p>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {post.excerpt || truncate(stripHtml(post.content), 120)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/berita"
                className="inline-flex items-center gap-2 dxic-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Lihat Semua Berita
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== BERITA TERBARU ===== */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">Berita</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Berita Terbaru</h2>
              </div>
              <Link
                href="/berita"
                className="hidden sm:inline-flex items-center gap-1 text-red-600 font-semibold hover:text-red-700 transition-colors"
              >
                Lihat Semua
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/berita/${post.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full dxic-gradient flex items-center justify-center opacity-50">
                        <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                      {post.category && (
                        <>
                          <span>•</span>
                          <span style={{ color: post.category.color }}>{post.category.name}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {post.excerpt || truncate(stripHtml(post.content), 100)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== GALERI FOTO ===== */}
      {albums.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">Galeri</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Album Galeri Foto</h2>
              <div className="w-20 h-1 dxic-gradient rounded-full mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/galeri/${album.slug}`}
                  className="group relative h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full dxic-gradient flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg">{album.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{album._count.items} foto</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/galeri"
                className="inline-flex items-center gap-2 dxic-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Lihat Semua Galeri
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== TESTIMONI ===== */}
      {testimonials.length > 0 && (
        <section className="py-20 dxic-gradient-dark text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">Testimoni</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Mereka Bicara Tentang DXIC</h2>
              <div className="w-20 h-1 bg-red-500 rounded-full mx-auto mt-4" />
            </div>
            <TestimonialCarousel testimonials={testimonials.map((t) => ({
              name: t.name,
              photo: t.photo,
              content: t.content,
              title: t.title,
            }))} />
          </div>
        </section>
      )}

      {/* ===== MITRA KERJA SAMA ===== */}
      <PartnerCarousel partners={partners} />

      {/* ===== CTA ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bergabung dengan {profile?.shortName || "DXIC"}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Jadilah bagian dari komunitas Daihatsu Xenia terbesar di Indonesia. 
            Bersama kita berbagi pengalaman, tips, dan persaudaraan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={profile?.instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="dxic-gradient text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Ikuti Instagram
            </a>
            <Link
              href="/kontak"
              className="bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
