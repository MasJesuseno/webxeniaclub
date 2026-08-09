"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface BankInfo {
  name: string | null
  account: string | null
  accountName: string | null
}

interface Tagihan {
  id: string
  registrationPeriodId: string
  biaya: number
  memberId: string
  namaMember: string
  tanggalTagihan: string
  tanggalBayar: string
  fotoBukti: string
  status: string
  registrationPeriod: {
    id: string
    period: string
    biaya: number
    tanggalBerlaku: string
    batasAkhir: string
    regisLang: string
  }
}

export default function MemberTagihanPage() {
  const router = useRouter()
  const [tagihan, setTagihan] = useState<Tagihan[]>([])
  const [bank, setBank] = useState<BankInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadMsg, setUploadMsg] = useState<{ id: string; msg: string; error?: boolean } | null>(null)
  const [copiedRek, setCopiedRek] = useState(false)

  const fetchTagihan = useCallback(async () => {
    try {
      const res = await fetch("/api/member/tagihan")
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/member/login")
          return
        }
        throw new Error("Gagal memuat data")
      }
      const data = await res.json()
      setTagihan(data.tagihan)
      setBank(data.bank)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchTagihan()
  }, [fetchTagihan])

  async function handleUpload(
    registrationDataId: string,
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setUploading(registrationDataId)
    setUploadMsg(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get("bukti") as File
    const tanggalBayar = formData.get("tanggalBayar") as string

    if (!file || file.size === 0) {
      setUploadMsg({ id: registrationDataId, msg: "Pilih file bukti transfer", error: true })
      setUploading(null)
      return
    }

    const uploadFormData = new FormData()
    uploadFormData.append("registrationDataId", registrationDataId)
    uploadFormData.append("bukti", file)
    if (tanggalBayar) uploadFormData.append("tanggalBayar", tanggalBayar)

    try {
      const res = await fetch("/api/member/tagihan/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const result = await res.json()

      if (res.ok) {
        setUploadMsg({ id: registrationDataId, msg: "Bukti berhasil diupload! Menunggu verifikasi admin." })
        fetchTagihan()
      } else {
        setUploadMsg({ id: registrationDataId, msg: result.error || "Gagal upload", error: true })
      }
    } catch {
      setUploadMsg({ id: registrationDataId, msg: "Terjadi kesalahan", error: true })
    } finally {
      setUploading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-red-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Memuat tagihan...</p>
        </div>
      </div>
    )
  }

  if (tagihan.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-gray-900">Tagihan Saya</h1>

        {/* Bank Info Card */}
        {bank?.name && bank?.account && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium mb-2">
              Pembayaran Via Transfer
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/80">Bank</span>
                <span className="text-sm font-bold text-white">{bank.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/80">No. Rekening</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wider">{bank.account}</span>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(bank.account || "")
                        setCopiedRek(true)
                        setTimeout(() => setCopiedRek(false), 2000)
                      } catch {}
                    }}
                    className={`p-1.5 rounded-lg transition-all shrink-0 ${copiedRek ? "bg-white/30 text-white" : "bg-white/15 hover:bg-white/25 text-white"}`}
                    title="Salin nomor rekening"
                  >
                    {copiedRek ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {bank.accountName && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/80">Atas Nama</span>
                  <span className="text-sm font-semibold text-white">{bank.accountName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-500">Belum ada tagihan</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Belum": "bg-gray-100 text-gray-600",
      "Menunggu Verifikasi": "bg-amber-100 text-amber-700",
      "Lunas": "bg-green-100 text-green-700",
      "Ditolak": "bg-red-100 text-red-700",
    }
    return styles[status] || "bg-gray-100 text-gray-600"
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Tagihan Saya</h1>

      {/* Bank Info Card */}
      {bank?.name && bank?.account && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium mb-2">
            Pembayaran Via Transfer
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/80">Bank</span>
              <span className="text-sm font-bold text-white">{bank.name}</span>
            </div>            <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/80">No. Rekening</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wider">{bank.account}</span>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(bank.account || "")
                        setCopiedRek(true)
                        setTimeout(() => setCopiedRek(false), 2000)
                      } catch {}
                    }}
                    className={`p-1.5 rounded-lg transition-all shrink-0 ${copiedRek ? "bg-white/30 text-white" : "bg-white/15 hover:bg-white/25 text-white"}`}
                    title="Salin nomor rekening"
                  >
                    {copiedRek ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            {bank.accountName && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/80">Atas Nama</span>
                <span className="text-sm font-semibold text-white">{bank.accountName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {tagihan.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Card Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-gray-900">
                {item.registrationPeriod?.period || "Periode tidak diketahui"}
              </h3>
              {item.tanggalTagihan && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Jatuh tempo: {new Date(item.tanggalTagihan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${getStatusBadge(item.status)}`}>
              {item.status}
            </span>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Biaya</span>
              <span className="text-lg font-bold text-gray-900">
                Rp {((item.biaya || item.registrationPeriod?.biaya || 0)).toLocaleString("id-ID")}
              </span>
            </div>

            {/* Existing proof */}
            {item.fotoBukti && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Bukti Transfer:</p>
                <a
                  href={item.fotoBukti}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-600 hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Lihat Bukti
                </a>
                {item.tanggalBayar && (
                  <p className="text-xs text-gray-400 mt-1">
                    Tanggal bayar: {new Date(item.tanggalBayar).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            )}

            {/* Upload Form (only if not yet paid) */}
            {item.status !== "Lunas" && (
              <form onSubmit={(e) => handleUpload(item.id, e)} className="space-y-3 border-t border-gray-100 pt-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Upload Bukti Transfer</label>
                  <input
                    type="file"
                    name="bukti"
                    accept="image/jpeg,image/png,application/pdf"
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Tanggal Transfer</label>
                  <input
                    type="date"
                    name="tanggalBayar"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                {uploadMsg?.id === item.id && (
                  <p className={`text-xs ${uploadMsg.error ? "text-red-600" : "text-green-600"}`}>
                    {uploadMsg.msg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={uploading === item.id}
                  className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading === item.id ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Mengupload...
                    </>
                  ) : (
                    "Upload Bukti"
                  )}
                </button>
              </form>
            )}

            {/* Card Actions for Lunas — only if RegisLang = Ya */}
            {item.status === "Lunas" && item.registrationPeriod?.regisLang === "Ya" && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                {/* Row 1: Kartu Depan */}
                <div className="flex gap-2">
                  <a
                    href="/member/kartu"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 text-white rounded-xl text-[11px] font-semibold hover:bg-red-700 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Kartu Depan
                  </a>
                  <a
                    href="/member/kartu?download=true"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 text-red-600 rounded-xl text-[11px] font-semibold hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Unduh
                  </a>
                </div>
                {/* Row 2: Kartu Belakang */}
                <div className="flex gap-2">
                  <a
                    href="/member/kartu?side=back"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-800 text-white rounded-xl text-[11px] font-semibold hover:bg-gray-900 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Kartu Belakang
                  </a>
                  <a
                    href="/member/kartu?side=back&download=true"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-[11px] font-semibold hover:bg-gray-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Unduh
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
