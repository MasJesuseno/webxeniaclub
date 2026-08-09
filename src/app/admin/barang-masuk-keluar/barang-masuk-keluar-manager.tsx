"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
  createBarangTransaksi,
  updateBarangTransaksi,
  deleteBarangTransaksi,
  exportBarangTransaksis,
} from "@/lib/actions"

interface Barang {
  id: string
  nama: string
  stok: number
}

interface Transaksi {
  id: string
  barangId: string
  tanggal: Date
  jenis: string
  jumlah: number
  keterangan: string | null
  barang: { nama: string }
}

function todayStr() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function toDateInputValue(d: Date | string) {
  const date = new Date(d)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function formatTanggal(d: Date | string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"

export function BarangMasukKeluarManager({
  barangs,
  transaksis,
  totalCount,
  page,
  totalPages,
  filterJenis,
  filterBarangId,
  filterDari,
  filterSampai,
  totalMasuk,
  totalKeluar,
}: {
  barangs: Barang[]
  transaksis: Transaksi[]
  totalCount: number
  page: number
  totalPages: number
  filterJenis: string
  filterBarangId: string
  filterDari: string
  filterSampai: string
  totalMasuk: number
  totalKeluar: number
}) {
  const router = useRouter()
  const [jenis, setJenis] = useState("Masuk")
  const [createError, setCreateError] = useState<string | null>(null)
  const [createPending, setCreatePending] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editPending, setEditPending] = useState(false)

  const editItem = editingId ? transaksis.find((t) => t.id === editingId) : null

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreatePending(true)
    setCreateError(null)
    const form = new FormData(e.currentTarget)
    const res = await createBarangTransaksi(null, form)
    if (res?.error) {
      setCreateError(res.error)
    } else {
      setJenis("Masuk")
      e.currentTarget.reset()
      // reset() mengosongkan hidden input jenis — isi ulang agar transaksi berikutnya tetap valid.
      const hiddenJenis = e.currentTarget.querySelector<HTMLInputElement>('input[name="jenis"]')
      if (hiddenJenis) hiddenJenis.value = "Masuk"
      router.refresh()
    }
    setCreatePending(false)
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    if (!editingId) return
    e.preventDefault()
    setEditPending(true)
    setEditError(null)
    const form = new FormData(e.currentTarget)
    const res = await updateBarangTransaksi(editingId, form)
    if (res?.error) {
      setEditError(res.error)
    } else {
      setEditingId(null)
      router.refresh()
    }
    setEditPending(false)
  }

  async function handleDelete(item: Transaksi) {
    const label = item.jenis === "Masuk" ? "masuk" : "keluar"
    if (!confirm(`Hapus transaksi ${label} "${item.barang.nama}" (${item.jumlah} pcs)? Stok akan dikembalikan.`)) return
    await deleteBarangTransaksi(item.id)
    router.refresh()
  }

  const totalStok = barangs.reduce((s, b) => s + b.stok, 0)
  const hasFilter = Boolean(filterJenis || filterBarangId || filterDari || filterSampai)

  // Bangun URL dengan filter tertentu (dipakai pagination & tombol Terapkan)
  function buildUrl(p: number, f: { jenis?: string; barangId?: string; dari?: string; sampai?: string }) {
    const params = new URLSearchParams()
    if (f.jenis) params.set("jenis", f.jenis)
    if (f.barangId) params.set("barangId", f.barangId)
    if (f.dari) params.set("dari", f.dari)
    if (f.sampai) params.set("sampai", f.sampai)
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return `/admin/barang-masuk-keluar${qs ? `?${qs}` : ""}`
  }

  const filterHref = (p: number) =>
    buildUrl(p, { jenis: filterJenis, barangId: filterBarangId, dari: filterDari, sampai: filterSampai })

  // Terapkan filter (kembali ke halaman 1)
  function handleApplyFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    router.push(
      buildUrl(1, {
        jenis: (form.get("jenis") as string) || "",
        barangId: (form.get("barangId") as string) || "",
        dari: (form.get("dari") as string) || "",
        sampai: (form.get("sampai") as string) || "",
      })
    )
  }

  const filterInputCls =
    "px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"

  // Export SEMUA transaksi yang cocok dengan filter aktif (tanpa pagination)
  async function handleExport() {
    setExporting(true)
    try {
      const form = new FormData()
      if (filterJenis) form.set("jenis", filterJenis)
      if (filterBarangId) form.set("barangId", filterBarangId)
      if (filterDari) form.set("dari", filterDari)
      if (filterSampai) form.set("sampai", filterSampai)

      const result = await exportBarangTransaksis(form)
      if (!Array.isArray(result)) {
        alert(result?.error || "Gagal mengekspor data")
        return
      }
      if (result.length === 0) {
        alert("Tidak ada data yang cocok dengan filter saat ini untuk diekspor.")
        return
      }

      const data = result.map((r) => ({
        "Nama Barang": r.nama,
        Tanggal: r.tanggal,
        Jenis: r.jenis,
        Jumlah: r.jenis === "Masuk" ? r.jumlah : -r.jumlah,
        Keterangan: r.keterangan,
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Riwayat Barang")
      ws["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 40 }]
      XLSX.writeFile(wb, `Riwayat_Barang_DXIC_${new Date().toISOString().split("T")[0]}.xlsx`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Jenis Barang</p>
          <p className="text-2xl font-bold text-gray-900">{barangs.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Stok</p>
          <p className="text-2xl font-bold text-gray-900">{totalStok}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-1">
            Total Masuk
            {hasFilter && <span className="ml-1 text-[10px] font-normal normal-case text-gray-400">(sesuai filter)</span>}
          </p>
          <p className="text-2xl font-bold text-emerald-700">+{totalMasuk}</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">
            Total Keluar
            {hasFilter && <span className="ml-1 text-[10px] font-normal normal-case text-gray-400">(sesuai filter)</span>}
          </p>
          <p className="text-2xl font-bold text-red-600">-{totalKeluar}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add transaction form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Catat Pergerakan Stok</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang *</label>
                <select name="barangId" required defaultValue="" className={inputCls}>
                  <option value="" disabled>
                    — Pilih barang —
                  </option>
                  {barangs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama} (stok: {b.stok})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal *</label>
                <input type="date" name="tanggal" required defaultValue={todayStr()} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah *</label>
                <input type="number" name="jumlah" min="1" required className={inputCls} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Transaksi *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setJenis("Masuk")}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    jenis === "Masuk"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-200"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setJenis("Keluar")}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    jenis === "Keluar"
                      ? "bg-red-50 border-red-300 text-red-700 ring-2 ring-red-200"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Keluar
                </button>
                <input type="hidden" name="jenis" value={jenis} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
              <input type="text" name="keterangan" className={inputCls} placeholder="Contoh: Pembelian stok, Penjualan saat kopdar, dll." />
            </div>
            {createError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{createError}</div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createPending}
                className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {createPending ? "Menyimpan..." : "Simpan Transaksi"}
              </button>
            </div>
          </form>
        </div>

        {/* Current stock overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Stok Saat Ini</h3>
            <Link href="/admin/barang" className="text-xs font-medium text-red-600 hover:underline">
              Kelola Barang →
            </Link>
          </div>
          {barangs.length === 0 ? (
            <p className="text-sm text-gray-400">
              Belum ada barang. Tambahkan di{" "}
              <Link href="/admin/barang" className="text-red-600 font-medium hover:underline">
                Master Barang
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {barangs.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50"
                >
                  <span className="text-sm font-medium text-gray-700 truncate">{b.nama}</span>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      b.stok <= 0
                        ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                        : b.stok <= 5
                        ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                        : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                    }`}
                  >
                    {b.stok} pcs
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-gray-900">Riwayat Masuk / Keluar</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400">
              {totalCount} transaksi
              {hasFilter ? " · hasil filter" : ""}
            </span>
            <button
              onClick={handleExport}
              disabled={exporting || totalCount === 0}
              title={hasFilter ? "Export sesuai filter aktif" : "Export semua riwayat"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? "Menyiapkan..." : "Export Excel"}
            </button>
          </div>
        </div>

        {/* Filter bar — key agar nilai input ikut reset saat filter di URL berubah (mis. klik Reset) */}
        <form
          key={[filterJenis, filterBarangId, filterDari, filterSampai].join("|")}
          onSubmit={handleApplyFilter}
          className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Jenis</label>
            <select name="jenis" defaultValue={filterJenis} className={filterInputCls}>
              <option value="">Semua</option>
              <option value="Masuk">Masuk</option>
              <option value="Keluar">Keluar</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Barang</label>
            <select name="barangId" defaultValue={filterBarangId} className={filterInputCls}>
              <option value="">Semua Barang</option>
              {barangs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Dari Tanggal</label>
            <input type="date" name="dari" defaultValue={filterDari} className={filterInputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Sampai Tanggal</label>
            <input type="date" name="sampai" defaultValue={filterSampai} className={filterInputCls} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="dxic-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Terapkan
            </button>
            <Link
              href="/admin/barang-masuk-keluar"
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Reset
            </Link>
          </div>
        </form>

        {transaksis.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">
            {hasFilter
              ? "Tidak ada transaksi yang cocok dengan filter. Ubah filter atau tekan Reset."
              : "Belum ada transaksi. Catat pergerakan stok pertama Anda."}
          </p>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Nama Barang</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden sm:table-cell">Tanggal</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Jenis</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Jumlah</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Keterangan</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transaksis.map((item) => {
                  const isMasuk = item.jenis === "Masuk"
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isMasuk ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={isMasuk ? "M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" : "M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"}
                              />
                            </svg>
                          </span>
                          {item.barang.nama}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{formatTanggal(item.tanggal)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            isMasuk ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-red-50 text-red-600 ring-1 ring-red-100"
                          }`}
                        >
                          {isMasuk ? "Masuk" : "Keluar"}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-bold ${isMasuk ? "text-emerald-600" : "text-red-600"}`}>
                        {isMasuk ? "+" : "-"}
                        {item.jumlah}
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{item.keterangan || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingId(item.id)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
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
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              Halaman <span className="font-semibold text-gray-700">{page}</span> dari{" "}
              <span className="font-semibold text-gray-700">{totalPages}</span>
              {hasFilter && (
                <>
                  {" "}· <button onClick={() => router.push("/admin/barang-masuk-keluar")} className="text-red-600 font-medium hover:underline">lihat semua</button>
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={filterHref(page - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Sebelumnya
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-300 cursor-not-allowed inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Sebelumnya
                </span>
              )}
              {page < totalPages ? (
                <Link
                  href={filterHref(page + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all inline-flex items-center gap-1.5"
                >
                  Berikutnya
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-300 cursor-not-allowed inline-flex items-center gap-1.5">
                  Berikutnya
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>
          </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setEditingId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Edit Transaksi</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang *</label>
                <select name="barangId" required defaultValue={editItem.barangId} className={inputCls}>
                  {barangs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama} (stok: {b.stok})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal *</label>
                  <input type="date" name="tanggal" required defaultValue={toDateInputValue(editItem.tanggal)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah *</label>
                  <input type="number" name="jumlah" min="1" required defaultValue={editItem.jumlah} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Transaksi *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      editItem.jenis === "Masuk"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-200"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <input type="radio" name="jenis" value="Masuk" defaultChecked={editItem.jenis === "Masuk"} className="sr-only" />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Masuk
                  </label>
                  <label
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      editItem.jenis === "Keluar"
                        ? "bg-red-50 border-red-300 text-red-700 ring-2 ring-red-200"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <input type="radio" name="jenis" value="Keluar" defaultChecked={editItem.jenis === "Keluar"} className="sr-only" />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Keluar
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
                <input type="text" name="keterangan" defaultValue={editItem.keterangan || ""} className={inputCls} />
              </div>
              {editError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{editError}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editPending}
                  className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {editPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
