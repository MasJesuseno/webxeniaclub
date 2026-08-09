"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createFinancialReport, deleteFinancialReport, toggleFinancialReportActive } from "@/lib/actions"
import { FileUpload } from "@/components/file-upload"

interface FinancialReport {
  id: string
  period: string
  description: string | null
  file: string
  isActive: boolean
  createdAt: Date
}

export function ReportManager({ reports }: { reports: FinancialReport[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [createFile, setCreateFile] = useState("")
  const [createState, createAction, createPending] = useActionState(createFinancialReport, null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Close create form on success
  useEffect(() => {
    if (createState?.success) {
      setCreateOpen(false)
      setCreateFile("")
      router.refresh()
    }
  }, [createState])

  async function handleDelete(id: string) {
    if (!confirm("Hapus laporan keuangan ini?")) return
    await deleteFinancialReport(id)
    router.refresh()
  }

  async function handleToggle(id: string) {
    setTogglingId(id)
    await toggleFinancialReportActive(id)
    setTogglingId(null)
    router.refresh()
  }

  const isPDF = (url: string) => url?.match(/\.(pdf)$/i)

  return (
    <div className="space-y-6">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Total {reports.length} laporan
          </p>
        </div>
        {!createOpen ? (
          <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Laporan
          </button>
        ) : null}
      </div>

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Laporan Keuangan Baru</h3>
            <button onClick={() => { setCreateOpen(false); setCreateFile(""); }} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Periode</label>
                <input type="text" name="period" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Januari 2026" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi (opsional)</label>
              <textarea name="description" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" placeholder="Deskripsi singkat tentang laporan..." />
            </div>
            <div>
              <input type="hidden" name="file" value={createFile} />
              <FileUpload
                value={createFile}
                onChange={setCreateFile}
                label="File Laporan"
                hint="Upload file PDF, DOC, XLS, atau gambar laporan keuangan"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />
            </div>

            {createState?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{createState.error}</div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={createPending} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2">
                {createPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Laporan"
                )}
              </button>
              <button type="button" onClick={() => { setCreateOpen(false); setCreateFile(""); }} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-4">Belum ada laporan keuangan</p>
          <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Laporan Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Periode</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Deskripsi</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden sm:table-cell">File</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Tampil</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className={`hover:bg-gray-50/50 transition-colors ${!report.isActive ? "opacity-60" : ""}`}>
                    {/* Periode */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{report.period}</div>
                    </td>
                    {/* Deskripsi */}
                    <td className="py-3 px-4 text-gray-500 hidden md:table-cell">
                      <span className="line-clamp-2 max-w-xs">{report.description || "-"}</span>
                    </td>
                    {/* File */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <a
                        href={report.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {isPDF(report.file) ? "PDF" : "File"}
                      </a>
                    </td>
                    {/* Tampil (Ya/Tidak) */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(report.id)}
                        disabled={togglingId === report.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          report.isActive ? "bg-red-600" : "bg-gray-300"
                        }`}
                        title={report.isActive ? "Klik untuk sembunyikan" : "Klik untuk tampilkan"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            report.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div className="text-xs mt-1 font-medium">
                        {report.isActive ? (
                          <span className="text-emerald-600">Ya</span>
                        ) : (
                          <span className="text-gray-400">Tidak</span>
                        )}
                      </div>
                    </td>
                    {/* Aksi */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/financial-reports/${report.id}/edit`}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
