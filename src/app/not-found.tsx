import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HeroNav } from "@/components/hero-nav";
import { Footer } from "@/components/footer";

export default async function NotFound() {
  const profile = await prisma.siteProfile.findFirst({ where: { id: 1 } });
  const schoolName = profile?.shortName || "SMA Annajah";

  return (
    <>
      <HeroNav
        logo={profile?.logo}
        schoolName={schoolName}
        slogan={profile?.slogan}
      />
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          {/* 404 Icon */}
          <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
            <svg className="w-14 h-14 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-7xl lg:text-8xl font-bold text-primary-900 mb-2">
            404
          </h1>
          <p className="text-xl text-gray-600 font-medium mb-2">
            Halaman Tidak Ditemukan
          </p>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            Periksa kembali URL atau kembali ke halaman utama.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 bg-primary-900 text-white font-medium rounded-xl hover:bg-primary-800 transition-all shadow-md"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/kontak"
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
