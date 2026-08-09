"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBarang, updateBarang, deleteBarang } from "@/lib/actions"

interface Barang {
  id: string
  nama: string
  hargaBeli: number | null
  hargaJual: number | null
  stok: number
  lokasi: string | null
  _count?: { transaksis: number }
}

const rupiah = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(v)

function stokBadge(stok: number) {
  if (stok <= 0)
    return "bg-red-50 text-red-600 ring-1 ring-red-100"
  if (stok <= 5)
    return "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
  return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
}

export function BarangManager({ barangs }: { barangs: Barang[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createPending, setCreatePending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editPending, setEditPending] = useState(false)

  const editItem = editingId ? barangs.find((b) => b.id === editingId) : null

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreatePending(true)
    setCreateError(null)
    const form = new FormData(e.currentTarget)
    const res = await createBarang(null, form)
    if (res?.error) {
      setCreateError(res.error)
    } else {
      setCreateOpen(false)
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
    const res = await updateBarang(editingId, form)
    if (res?.error) {
      setEditError(res.error)
    } else {
      setEditingId(null)
      router.refresh()
    }
    setEditPending(false)
  }

  async function handleDelete(item: Barang) {
    if (!confirm(`Hapus barang "${item.nama}"? Riwayat transaksi barang ini juga akan terhapus.`)) return
    await deleteBarang(item.id)
    router.refresh()
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
  const totalStok = barangs.reduce((sum, b) => sum + b.stok, 0)

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Jenis Barang</p>
          <p className="text-2xl font-bold text-gray-900">{barangs.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Stok</p>
          <p className="text-2xl font-bold text-gray-900">{totalStok}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Stok Menipis (≤ 5)</p>
          <p className={`text-2xl font-bold ${barangs.some((b) => b.stok > 0 && b.stok <= 5) ? "text-amber-600" : "text-gray-900"}`}>
            {barangs.filter((b) => b.stok > 0 && b.stok <= 5).length}
          </p>
        </div>
      </div>

      {/* Header + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-gray-500">
          {barangs.length} barang terdaftar
          {barangs.filter((b) => b.stok <= 0).length > 0 && (
            <span className="text-red-500 font-medium"> — {barangs.filter((b) => b.stok <= 0).length} stok habis</span>
          )}
        </p>
        {!createOpen && !editingId ? (
          <button
            onClick={() => setCreateOpen(true)}
            className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Barang
          </button>
        ) : null}
      </div>

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Barang Baru</h3>
            <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang *</label>
                <input type="text" name="nama" required className={inputCls} placeholder="Contoh: Kaos DXIC, Stiker, Pin..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi Simpan</label>
                <input type="text" name="lokasi" className={inputCls} placeholder="Contoh: Lemari Sekretariat, Gudang..." />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Beli</label>
                <input type="number" name="hargaBeli" min="0" step="0.01" className={inputCls} placeholder="Rp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Jual</label>
                <input type="number" name="hargaJual" min="0" step="0.01" className={inputCls} placeholder="Rp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok Awal</label>
                <input type="number" name="stok" min="0" defaultValue={0} className={inputCls} />
              </div>
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
                {createPending ? "Menyimpan..." : "Simpan Barang"}
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {barangs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 mb-4">Belum ada barang. Tambahkan barang pertama Anda.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            + Tambah Barang
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Nama Barang</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Harga Beli</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Harga Jual</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Stok</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Lokasi Simpan</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {barangs.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                        <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </span>
                        {item.nama}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{rupiah(item.hargaBeli)}</td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{rupiah(item.hargaJual)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${stokBadge(item.stok)}`}>
                        {item.stok} pcs
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">
                      {item.lokasi ? (
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.lokasi}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
              <h3 className="font-semibold text-gray-900">Edit Barang — {editItem.nama}</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang *</label>
                  <input type="text" name="nama" required defaultValue={editItem.nama} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi Simpan</label>
                  <input type="text" name="lokasi" defaultValue={editItem.lokasi || ""} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Beli</label>
                  <input type="number" name="hargaBeli" min="0" step="0.01" defaultValue={editItem.hargaBeli ?? ""} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Jual</label>
                  <input type="number" name="hargaJual" min="0" step="0.01" defaultValue={editItem.hargaJual ?? ""} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok Saat Ini</label>
                  <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700">
                    {editItem.stok} pcs
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Stok hanya berubah lewat transaksi Masuk/Keluar Barang.
                  </p>
                </div>
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
