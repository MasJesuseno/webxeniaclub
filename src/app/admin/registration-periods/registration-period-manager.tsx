"use client"

import { useState, useActionState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createRegistrationPeriod, updateRegistrationPeriod, deleteRegistrationPeriod } from "@/lib/actions"

interface RegistrationPeriod {
  id: string
  period: string
  biaya: number | null
  tanggalBerlaku: Date | null
  batasAkhir: Date | null
  status: string
  regisLang: string
  createdAt: Date
}

export function RegistrationPeriodManager({ periods }: { periods: RegistrationPeriod[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterPeriod, setFilterPeriod] = useState("")
  const [createState, createAction, createPending] = useActionState(createRegistrationPeriod, null)
  const [updatePending, setUpdatePending] = useState(false)

  // Filter data
  const filteredPeriods = useMemo(() => {
    if (!filterPeriod.trim()) return periods
    const q = filterPeriod.toLowerCase()
    return periods.filter((p) => p.period.toLowerCase().includes(q))
  }, [periods, filterPeriod])

  // Close create form on success
  useEffect(() => {
    if (createState?.success) {
      setCreateOpen(false)
      router.refresh()
    }
  }, [createState])

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    if (!editingId) return
    e.preventDefault()
    setUpdatePending(true)
    const form = new FormData(e.currentTarget)
    const res = await updateRegistrationPeriod(editingId, null, form)
    if (res?.error) {
      alert(res.error)
      setUpdatePending(false)
    } else {
      setEditingId(null)
      setUpdatePending(false)
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus periode register ini?")) return
    await deleteRegistrationPeriod(id)
    router.refresh()
  }

  function formatDate(date: Date | null) {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function formatCurrency(val: number | null) {
    if (val === null || val === undefined) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  function getInputDateValue(date: Date | null) {
    if (!date) return ""
    return new Date(date).toISOString().split("T")[0]
  }

  return (
    <div className="space-y-6">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-gray-500">
            Total {periods.length} periode
          </p>
          {/* Filter */}
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              placeholder="Cari periode..."
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm w-56"
            />
          </div>
        </div>
        {!createOpen && !editingId ? (
          <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Periode
          </button>
        ) : null}
      </div>

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Periode Register Baru</h3>
            <button onClick={() => { setCreateOpen(false); }} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Periode Register</label>
                <input type="text" name="period" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Gelombang 1 - 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Biaya (Rp)</label>
                <input type="number" name="biaya" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Berlaku</label>
                <input type="date" name="tanggalBerlaku" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Batas Akhir</label>
                <input type="date" name="batasAkhir" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
                <option value="Belum">Belum</option>
                <option value="Proses">Proses</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Registrasi Langganan</label>
              <select name="regisLang" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Ya = periode ini digunakan untuk registrasi langganan (kartu member aktif)</p>
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
                  "Simpan Periode"
                )}
              </button>
              <button type="button" onClick={() => setCreateOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Periods Table */}
      {filteredPeriods.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-4">
            {filterPeriod ? "Tidak ada periode yang cocok dengan filter" : "Belum ada periode register"}
          </p>
          {!filterPeriod && (
            <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Periode Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Periode Register</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden sm:table-cell">Biaya</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden sm:table-cell">Tgl Berlaku</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden sm:table-cell">Batas Akhir</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">RegisLang</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-28">Status</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPeriods.map((period) => (
                  <tr key={period.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{period.period}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Dibuat: {formatDate(period.createdAt)}
                      </div>
                    </td>
                    {/* Biaya */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="font-medium text-gray-700">{formatCurrency(period.biaya)}</span>
                    </td>
                    {/* Tgl Berlaku */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="text-gray-600">{formatDate(period.tanggalBerlaku)}</span>
                    </td>
                    {/* Batas Akhir */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="text-gray-600">{formatDate(period.batasAkhir)}</span>
                    </td>
                    {/* RegisLang */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        period.regisLang === "Ya"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {period.regisLang}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        period.status === "Proses"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          period.status === "Proses" ? "bg-emerald-500" : "bg-yellow-500"
                        }`} />
                        {period.status}
                      </span>
                    </td>
                    {/* Aksi */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingId(period.id)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(period.id)}
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

      {/* Edit Modal */}
      {editingId && (() => {
        const period = periods.find((p) => p.id === editingId)
        if (!period) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEditingId(null)}>
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Edit Periode Register</h3>
                <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Periode Register</label>
                    <input type="text" name="period" required defaultValue={period.period} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Biaya (Rp)</label>
                    <input type="number" name="biaya" defaultValue={period.biaya ?? ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Berlaku</label>
                    <input type="date" name="tanggalBerlaku" defaultValue={getInputDateValue(period.tanggalBerlaku)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Batas Akhir</label>
                    <input type="date" name="batasAkhir" defaultValue={getInputDateValue(period.batasAkhir)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select name="status" defaultValue={period.status} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
                      <option value="Belum">Belum</option>
                      <option value="Proses">Proses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Registrasi Langganan</label>
                    <select name="regisLang" defaultValue={period.regisLang} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
                      <option value="Tidak">Tidak</option>
                      <option value="Ya">Ya</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Ya = periode ini digunakan untuk registrasi langganan (kartu member aktif)</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={updatePending} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2">
                    {updatePending ? (
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
                  <button type="button" onClick={() => setEditingId(null)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
