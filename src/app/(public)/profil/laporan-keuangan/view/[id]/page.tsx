import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PdfViewer } from "@/components/pdf-viewer"

export default async function ViewLaporanKeuanganPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const report = await prisma.financialReport.findUnique({
    where: { id, isActive: true },
  })

  if (!report) notFound()

  const isPDF = report.file?.match(/\.(pdf)$/i)
  const isImage = report.file?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="dxic-gradient py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/profil" className="hover:text-white transition-colors">Profil</Link>
            <span>/</span>
            <Link href="/profil/laporan-keuangan" className="hover:text-white transition-colors">Laporan Keuangan</Link>
            <span>/</span>
            <span className="text-white">Lihat</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{report.period}</h1>
          {report.description && (
            <p className="text-white/80 mt-1 text-sm">{report.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isPDF ? (
          <PdfViewer url={report.file} title={report.period} />
        ) : isImage ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <img
              src={report.file}
              alt={report.period}
              className="w-full h-auto"
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400">Dokumen hanya dapat dilihat</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">Tipe file tidak didukung untuk ditampilkan.</p>
            <a
              href={report.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Buka File
            </a>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/profil/laporan-keuangan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all bg-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Kembali ke Laporan Keuangan
          </Link>
        </div>
      </div>
    </div>
  )
}
