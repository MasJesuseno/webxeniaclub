import { getSiteProfile, getActiveFinancialReports } from "@/lib/actions"
import { ReportCardList } from "./report-viewer"

export const dynamic = "force-dynamic"

export default async function MemberDXICPage() {
  const [profile, reports] = await Promise.all([
    getSiteProfile(),
    getActiveFinancialReports(),
  ])

  const parsedReports = JSON.parse(JSON.stringify(reports)) as any[]
  const latestReports = parsedReports.slice(0, 5)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">Tentang {profile.shortName || "DXIC"}</h1>
            <p className="text-xs text-white/70 mt-0.5">{profile.slogan}</p>
          </div>
        </div>
      </div>

      {/* Visi & Misi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Visi & Misi
          </h2>
        </div>
        <div className="p-5 space-y-5">
          {/* Visi */}
          {profile.vision && (
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" clipRule="evenodd" />
                </svg>
                Visi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.vision}</p>
            </div>
          )}

          {/* Misi */}
          {profile.mission && (
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Misi
              </h3>
              <ul className="space-y-2">
                {profile.mission.split("\n").filter((m: string) => m.trim()).map((item: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item.replace(/^\(\d+\)\s*/, "").trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Jingle DXIC */}
      {profile.jingleMp3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Jingle {profile.shortName || "DXIC"}
            </h2>
          </div>
          <div className="p-5">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-red-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-red-500 flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Jingle Resmi {profile.shortName || "DXIC"}</p>
                  <p className="text-xs text-gray-500">Dengarkan jingle club</p>
                </div>
              </div>
              <audio
                controls
                src={profile.jingleMp3}
                className="w-full h-10 rounded-lg"
                preload="metadata"
              >
                Browser tidak mendukung pemutar audio.
              </audio>
            </div>
          </div>
        </div>
      )}

      {/* Momen Song */}
      {profile.momenSong && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Momen Song {profile.shortName || "DXIC"}
            </h2>
          </div>
          <div className="p-5">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Momen Song {profile.shortName || "DXIC"}</p>
                  <p className="text-xs text-gray-500">Dengarkan lagu tema momen spesial</p>
                </div>
              </div>
              <audio
                controls
                src={profile.momenSong}
                className="w-full h-10 rounded-lg"
                preload="metadata"
              >
                Browser tidak mendukung pemutar audio.
              </audio>
            </div>
          </div>
        </div>
      )}

      {/* Struktur Organisasi */}
      {profile.organizationStructure && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Struktur Organisasi
            </h2>
          </div>
          <div className="p-5">
            <div className="relative w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
              <img
                src={profile.organizationStructure}
                alt="Struktur Organisasi"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Laporan Keuangan Terbaru */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Laporan Keuangan Terbaru
          </h2>
        </div>

        <ReportCardList
          reports={latestReports}
          totalCount={parsedReports.length}
        />
      </div>
    </div>
  )
}
