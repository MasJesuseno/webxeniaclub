"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DbInfo {
  host: string
  database: string
  user: string
}

export function BackupManager({ dbInfo }: { dbInfo: DbInfo }) {
  const router = useRouter()
  const [backupLoading, setBackupLoading] = useState(false)
  const [backupMsg, setBackupMsg] = useState<string | null>(null)
  const [backupErr, setBackupErr] = useState<string | null>(null)

  const [fileName, setFileName] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null)
  const [restoreErr, setRestoreErr] = useState<string | null>(null)

  async function handleBackup() {
    setBackupLoading(true)
    setBackupMsg(null)
    setBackupErr(null)
    try {
      const res = await fetch("/api/admin/backup", { cache: "no-store" })
      if (!res.ok) {
        let msg = `Gagal backup (HTTP ${res.status})`
        try {
          const data = await res.json()
          if (data?.error) msg = data.error
        } catch {}
        throw new Error(msg)
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get("Content-Disposition") || ""
      const match = contentDisposition.match(/filename="?([^"]+)"?/)
      const filename = match?.[1] || `backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.sql`

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      const size = (blob.size / 1024).toFixed(1)
      setBackupMsg(`Backup berhasil — file "${filename}" (${size} KB) diunduh.`)
    } catch (e: any) {
      setBackupErr(e?.message || "Backup gagal")
    }
    setBackupLoading(false)
  }

  async function handleRestore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (confirmText !== "RESTORE") {
      setRestoreErr('Ketik "RESTORE" (huruf besar) untuk mengonfirmasi.')
      return
    }
    const input = (e.currentTarget.elements.namedItem("file") as HTMLInputElement)
    if (!input?.files?.[0]) {
      setRestoreErr("Pilih file backup (.sql) terlebih dahulu.")
      return
    }

    setRestoreLoading(true)
    setRestoreMsg(null)
    setRestoreErr(null)
    try {
      const formData = new FormData()
      formData.append("file", input.files[0])
      formData.append("confirm", confirmText)

      const res = await fetch("/api/admin/restore", { method: "POST", body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || `Restore gagal (HTTP ${res.status})`)
      }
      setRestoreMsg(data?.message || "Restore berhasil.")
      setFileName("")
      setConfirmText("")
      router.refresh()
    } catch (e: any) {
      setRestoreErr(e?.message || "Restore gagal")
    }
    setRestoreLoading(false)
  }

  const cardCls = "bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Backup ── */}
      <div className={cardCls}>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </span>
          <div>
            <h2 className="font-semibold text-gray-900">Backup Database</h2>
            <p className="text-xs text-gray-500">Unduh salinan lengkap database (.sql)</p>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Database</span>
            <span className="font-medium text-gray-800">{dbInfo.database}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Host</span>
            <span className="font-medium text-gray-800">{dbInfo.host}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">User</span>
            <span className="font-medium text-gray-800">{dbInfo.user}</span>
          </div>
        </div>

        {backupMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            {backupMsg}
          </div>
        )}
        {backupErr && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {backupErr}
          </div>
        )}

        <button
          onClick={handleBackup}
          disabled={backupLoading}
          className="w-full dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {backupLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Membuat backup...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Backup Database Sekarang
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-gray-400">
          File backup berisi seluruh tabel, data, stored procedure, dan trigger. Simpan file ini di
          tempat aman — Anda bisa menggunakannya untuk memulihkan database kapan saja.
        </p>
      </div>

      {/* ── Restore ── */}
      <div className={cardCls}>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </span>
          <div>
            <h2 className="font-semibold text-gray-900">Restore Database</h2>
            <p className="text-xs text-gray-500">Pulihkan database dari file backup (.sql)</p>
          </div>
        </div>

        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <strong>Peringatan:</strong> Restore akan <strong>menghapus dan menimpa seluruh data</strong>{" "}
              database saat ini. Sebaiknya lakukan backup terlebih dahulu sebelum restore.
            </span>
          </div>
        </div>

        {restoreMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            {restoreMsg}
          </div>
        )}
        {restoreErr && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {restoreErr}
          </div>
        )}

        <form onSubmit={handleRestore} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">File Backup (.sql)</label>
            <input
              type="file"
              name="file"
              accept=".sql"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              className={`${inputCls} file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-gray-100 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200`}
            />
            {fileName && (
              <p className="mt-1.5 text-xs text-gray-500">File dipilih: {fileName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ketik <span className="font-mono font-bold text-red-600">RESTORE</span> untuk konfirmasi
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESTORE"
              className={inputCls}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={restoreLoading || confirmText !== "RESTORE" || !fileName}
            className="w-full px-6 py-3 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {restoreLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sedang restore...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restore Database
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          Pastikan file backup berasal dari database yang sama (nama database harus sesuai). Restore
          hanya bisa dilakukan oleh pengguna dengan akses menu ini.
        </p>
      </div>
    </div>
  )
}
