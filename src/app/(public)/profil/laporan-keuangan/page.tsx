import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ProfilSubnav } from "@/components/profil-subnav"

export default async function LaporanKeuanganPage() {
  const reports = await prisma.financialReport.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })

  const profile = await prisma.siteProfile.findFirst()

  const isPDF = (url: string) => url?.match(/\.(pdf)$/i)
  const isImage = (url: string) => url?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="dxic-gradient py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/profil" className="hover:text-white transition-colors">Profil</Link>
            <span>/</span>
            <span className="text-white">Laporan Keuangan</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Laporan Keuangan</h1>
          <p className="text-white/80 mt-2">
            {profile?.clubName || "Xenia Club Indonesia"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Sub Navigation */}
        <ProfilSubnav active="laporan" />

        {reports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">Belum ada laporan keuangan yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Preview Area */}
                <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                  {isImage(report.file) ? (
                    <img
                      src={report.file}
                      alt={report.period}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-400">
                        {isPDF(report.file) ? "Dokumen PDF" : "File"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{report.period}</h3>
                  {report.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{report.description}</p>
                  )}

                  <Link
                    href={`/profil/laporan-keuangan/view/${report.id}`}
                    className="inline-flex items-center gap-2 dxic-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all group-hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
