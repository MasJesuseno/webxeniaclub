"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { updateFinancialReport } from "@/lib/actions"
import { FileUpload } from "@/components/file-upload"

interface FinancialReport {
  id: string
  period: string
  description: string | null
  file: string
  isActive: boolean
}

export function EditReportForm({ report }: { report: FinancialReport }) {
  const router = useRouter()
  const [file, setFile] = useState(report.file || "")
  const updateWithId = updateFinancialReport.bind(null, report.id)
  const [state, formAction, pending] = useActionState(updateWithId, null)

  return (
    <form action={formAction} className="max-w-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
            <h3 className="font-semibold text-gray-900 text-lg">Informasi Laporan</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Periode</label>
              <input
                type="text"
                name="period"
                required
                defaultValue={report.period}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                placeholder="Contoh: Januari 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={report.description || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
                placeholder="Deskripsi singkat tentang laporan..."
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <input type="hidden" name="file" value={file} />
            <FileUpload
              value={file}
              onChange={setFile}
              label="File Laporan"
              hint="Upload file PDF, DOC, XLS, atau gambar laporan keuangan"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Pengaturan</h3>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={report.isActive}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Tampilkan di halaman publik</span>
              </label>
            </div>
          </div>

          {state?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={pending}
              className="w-full dxic-gradient text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
            <a
              href="/admin/financial-reports"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Batal
            </a>
          </div>
        </div>
      </div>
    </form>
  )
}
