"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

const PdfViewer = dynamic(
  () => import("@/components/pdf-viewer").then((mod) => ({ default: mod.PdfViewer })),
  { ssr: false }
)

function isImage(url: string) {
  return url?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
}

interface Report {
  id: string
  period: string
  description: string | null
  file: string
  createdAt: string
}

function ReportCard({ report }: { report: Report }) {
  const [showViewer, setShowViewer] = useState(false)
  const isPDF = report.file?.match(/\.(pdf)$/i)
  const isImg = isImage(report.file)

  return (
    <div className={isPDF || isImg ? "" : ""}>
      <div className="p-4 flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
          {isImg ? (
            <img src={report.file} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900">{report.period}</h3>
          {report.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{report.description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-400">
              {new Date(report.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>

            {(isPDF || isImg) && (
              <button
                onClick={() => setShowViewer(!showViewer)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {showViewer ? "Tutup" : "Lihat"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Viewer */}
      {showViewer && (
        <div className="px-4 pb-4">
          {isPDF ? (
            <div className="rounded-xl overflow-hidden">
              <PdfViewer url={report.file} title={report.period} />
            </div>
          ) : isImg ? (
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={report.file}
                alt={report.period}
                className="w-full h-auto object-contain"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

interface ReportCardListProps {
  reports: Report[]
  totalCount: number
}

export function ReportCardList({ reports, totalCount }: ReportCardListProps) {
  const hasMore = totalCount > reports.length

  if (reports.length === 0) {
    return (
      <div className="p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-500">Belum ada laporan keuangan</p>
      </div>
    )
  }

  return (
    <>
      <div className="divide-y divide-gray-50">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
          />
        ))}
      </div>

      {hasMore && (
        <div className="px-5 py-3 border-t border-gray-50 text-center">
          <span className="text-xs text-gray-400">
            Menampilkan {reports.length} dari {totalCount} laporan
          </span>
        </div>
      )}
    </>
  )
}
