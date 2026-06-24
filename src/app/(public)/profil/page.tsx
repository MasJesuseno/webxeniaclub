import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ProfilPage() {
  const profile = await prisma.siteProfile.findFirst()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="dxic-gradient py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">Profil {profile?.shortName || "DXIC"}</h1>
          <p className="text-white/80 mt-2">{profile?.clubName || "Xenia Club Indonesia"}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* About */}
          <div className="space-y-8">
            <div>
              <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">Tentang</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Siapa Kami?</h2>
              <div className="w-16 h-1 dxic-gradient rounded-full mt-3 mb-6" />
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {profile?.about || profile?.description || "Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia (DXIC). Wadah silaturahmi, berbagi pengalaman, dan informasi seputar Daihatsu Xenia."}
                </p>
                {profile?.history && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Sejarah</h3>
                    <p className="text-gray-600 leading-relaxed">{profile.history}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600">{profile?.memberCount || 500}+</div>
                <div className="text-sm text-gray-500 mt-1">Anggota</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600">{profile?.cityCount || 30}+</div>
                <div className="text-sm text-gray-500 mt-1">Kota</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600">{profile?.establishedYear || "2010"}</div>
                <div className="text-sm text-gray-500 mt-1">Berdiri</div>
              </div>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-2xl border border-red-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 dxic-gradient rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                Visi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {profile?.vision || "Menjadi komunitas Daihatsu Xenia terbesar dan terbaik di Indonesia yang solid, informatif, dan bermanfaat bagi seluruh anggota."}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                Misi
              </h3>
              <ul className="space-y-3">
                {(profile?.mission ? profile.mission.split("\n") : [
                  "Mempererat silaturahmi antar sesama pemilik Xenia",
                  "Berbagi informasi dan tips perawatan Xenia",
                  "Mengadakan kegiatan sosial dan kopdar rutin",
                  "Menjadi wadah informasi terpercaya seputar Xenia",
                ]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item.replace(/^[-\s]*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
