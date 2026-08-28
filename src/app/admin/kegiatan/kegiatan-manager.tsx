"use client"

import { useState, useActionState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createKegiatan, updateKegiatan, deleteKegiatan } from "@/lib/actions"

interface KegiatanItem {
  id: string
  tanggal: string | Date
  region: string
  namaKegiatan: string
  uraian: string | null
  lokasi: string
  kontakPerson: string
}

interface RegionOption {
  id: string
  region: string
  provinsi: string | null
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"

export function KegiatanManager({
  items,
  regions,
}: {
  items: KegiatanItem[]
  regions: RegionOption[]
}) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Filters
  const [filterStart, setFilterStart] = useState("")
  const [filterEnd, setFilterEnd] = useState("")
  const [filterRegion, setFilterRegion] = useState("")

  const [createState, createAction, createPending] = useActionState(createKegiatan, null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editPending, setEditPending] = useState(false)

  const editItem = editingId ? items.find((k) => k.id === editingId) : null

  useEffect(() => {
    if (createState?.success) {
      setCreateOpen(false)
      router.refresh()
    }
  }, [createState, router])

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    if (!editingId) return
    e.preventDefault()
    setEditPending(true)
    setEditError(null)
    const form = new FormData(e.currentTarget)
    const res = await updateKegiatan(editingId, form)
    if (res?.error) {
      setEditError(res.error)
    } else {
      setEditingId(null)
      router.refresh()
    }
    setEditPending(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kegiatan "${name}"?`)) return
    await deleteKegiatan(id)
    router.refresh()
  }

  // Unique region options from data + regions table
  const regionOptions = useMemo(() => {
    const fromRegions = regions.map((r) =>
      r.provinsi ? `${r.region} / ${r.provinsi}` : r.region
    )
    const fromItems = items.map((k) => k.region)
    const all = [...new Set([...fromRegions, ...fromItems])].sort()
    return all
  }, [regions, items])

  // Filtered items
  const filtered = useMemo(() => {
    return items.filter((k) => {
      if (filterStart) {
        const start = new Date(filterStart)
        if (new Date(k.tanggal) < start) return false
      }
      if (filterEnd) {
        const end = new Date(filterEnd)
        end.setHours(23, 59, 59, 999)
        if (new Date(k.tanggal) > end) return false
      }
      if (filterRegion && k.region !== filterRegion) return false
      return true
    })
  }, [items, filterStart, filterEnd, filterRegion])

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-gray-500">
          Total {filtered.length} kegiatan{filtered.length !== items.length ? ` (dari ${items.length} total)` : ""}
        </p>
        {!createOpen && !editingId ? (
          <button
            onClick={() => setCreateOpen(true)}
            className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kegiatan
          </button>
        ) : null}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Filter</span>
          {(filterStart || filterEnd || filterRegion) && (
            <button
              onClick={() => { setFilterStart(""); setFilterEnd(""); setFilterRegion("") }}
              className="text-xs text-red-500 hover:text-red-700 font-medium ml-2"
            >
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Region / Provinsi</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className={inputCls}
            >
              <option value="">Semua Region</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Kegiatan Baru</h3>
            <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal *</label>
                <input type="date" name="tanggal" required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region / Provinsi *</label>
                <input type="text" name="region" required className={inputCls} placeholder="Contoh: JAKARTA / DKI Jakarta" list="region-list" />
                <datalist id="region-list">
                  {regionOptions.map((r) => <option key={r} value={r} />)}
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kegiatan *</label>
                <input type="text" name="namaKegiatan" required className={inputCls} placeholder="Nama kegiatan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi *</label>
                <input type="text" name="lokasi" required className={inputCls} placeholder="Lokasi kegiatan" />
              </div>
            </div>              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Uraian</label>
                <textarea name="uraian" rows={2} className={inputCls + " resize-none"} placeholder="Deskripsi singkat kegiatan (opsional)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kontak Person *</label>
                <input type="text" name="kontakPerson" required className={inputCls} placeholder="Nama / No. HP kontak person" />
              </div>
            {createState?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{createState.error}</div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createPending}
                className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {createPending ? "Menyimpan..." : "Simpan Kegiatan"}
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
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-2">
            {items.length === 0 ? "Belum ada kegiatan." : "Tidak ada kegiatan yang cocok dengan filter."}
          </p>
          {items.length > 0 && (filterStart || filterEnd || filterRegion) && (
            <button
              onClick={() => { setFilterStart(""); setFilterEnd(""); setFilterRegion("") }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Tanggal</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Region / Provinsi</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Nama Kegiatan</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Lokasi</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Kontak Person</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-2 font-medium text-gray-900">
                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(item.tanggal)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                        {item.region}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{item.namaKegiatan}</span>
                      {item.uraian && (
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{item.uraian}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{item.lokasi}</td>
                    <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{item.kontakPerson}</td>
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
                          onClick={() => handleDelete(item.id, item.namaKegiatan)}
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
              <h3 className="font-semibold text-gray-900">Edit Kegiatan — {editItem.namaKegiatan}</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal *</label>
                  <input
                    type="date"
                    name="tanggal"
                    required
                    defaultValue={new Date(editItem.tanggal).toISOString().split("T")[0]}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Region / Provinsi *</label>
                  <input type="text" name="region" required defaultValue={editItem.region} className={inputCls} list="region-list-edit" />
                  <datalist id="region-list-edit">
                    {regionOptions.map((r) => <option key={r} value={r} />)}
                  </datalist>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kegiatan *</label>
                  <input type="text" name="namaKegiatan" required defaultValue={editItem.namaKegiatan} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi *</label>
                  <input type="text" name="lokasi" required defaultValue={editItem.lokasi} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Uraian</label>
                <textarea name="uraian" rows={2} defaultValue={editItem.uraian || ""} className={inputCls + " resize-none"} placeholder="Deskripsi singkat kegiatan (opsional)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kontak Person *</label>
                <input type="text" name="kontakPerson" required defaultValue={editItem.kontakPerson} className={inputCls} />
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
