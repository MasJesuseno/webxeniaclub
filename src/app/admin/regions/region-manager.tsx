"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createRegion, updateRegion, deleteRegion, syncRegionsFromMembers } from "@/lib/actions"

interface Region {
  id: string
  region: string
  provinsi: string | null
  ketuaRegion: string | null
  emailKetua: string | null
  waKetua: string | null
  linkWaGrup: string | null
  order: number
}

export function RegionManager({
  regions,
  memberRegionCount,
}: {
  regions: Region[]
  memberRegionCount: number
}) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<{ created: number; skipped: number } | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const [createState, createAction, createPending] = useActionState(createRegion, null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editPending, setEditPending] = useState(false)

  const editItem = editingId ? regions.find((r) => r.id === editingId) : null

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
    const res = await updateRegion(editingId, form)
    if (res?.error) {
      setEditError(res.error)
    } else {
      setEditingId(null)
      router.refresh()
    }
    setEditPending(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus region "${name}"?`)) return
    await deleteRegion(id)
    router.refresh()
  }

  async function handleSync() {
    if (!confirm("Sinkronkan region dari data member? Region baru akan ditambahkan otomatis.")) return
    setSyncLoading(true)
    setSyncResult(null)
    setSyncError(null)
    const res = await syncRegionsFromMembers()
    if (res?.error) {
      setSyncError(res.error)
    } else if (res) {
      setSyncResult({ created: res.created || 0, skipped: res.skipped || 0 })
      router.refresh()
    }
    setSyncLoading(false)
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-gray-500">Total {regions.length} region terdaftar</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSync}
            disabled={syncLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sinkronisasi...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sinkron dari Data Member
              </>
            )}
          </button>
          {!createOpen && !editingId ? (
            <button
              onClick={() => setCreateOpen(true)}
              className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Region
            </button>
          ) : null}
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{syncResult.created} region baru dibuat</span>
          <span>, {syncResult.skipped} sudah ada</span>
          <button onClick={() => setSyncResult(null)} className="ml-2 hover:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {syncError && (
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">
          {syncError}
        </div>
      )}

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Region Baru</h3>
            <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Region *</label>
                <input type="text" name="region" required className={inputCls} placeholder="Contoh: JAKARTA, BOGOR" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi</label>
                <input type="text" name="provinsi" className={inputCls} placeholder="Contoh: DKI Jakarta" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ketua Region</label>
                <input type="text" name="ketuaRegion" className={inputCls} placeholder="Nama ketua region" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Ketua Region</label>
                <input type="email" name="emailKetua" className={inputCls} placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WA Ketua Region</label>
                <input type="text" name="waKetua" className={inputCls} placeholder="08xxxxxxxxxx" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link WA Grup</label>
              <input type="text" name="linkWaGrup" className={inputCls} placeholder="https://chat.whatsapp.com/..." />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Urutan</label>
              <input type="number" name="order" defaultValue={0} className={inputCls} />
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
                {createPending ? "Menyimpan..." : "Simpan Region"}
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
      {regions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-500 mb-4">Belum ada region.</p>
          {memberRegionCount > 0 && (
            <button
              onClick={handleSync}
              disabled={syncLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sinkron dari Data Member
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Region</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Provinsi</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Ketua Region</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Email Ketua</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">WA Ketua</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden xl:table-cell">Link WA Grup</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {regions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {item.region.slice(0, 3).toUpperCase()}
                        </span>
                        {item.region}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{item.provinsi || "—"}</td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{item.ketuaRegion || "—"}</td>
                    <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">
                      {item.emailKetua ? (
                        <a href={`mailto:${item.emailKetua}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                          {item.emailKetua}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{item.waKetua || "—"}</td>
                    <td className="py-3 px-4 hidden xl:table-cell">
                      {item.linkWaGrup ? (
                        <a
                          href={item.linkWaGrup}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 01-5.656-5.656l1.1-1.1m8.486-3.828l-1.1 1.1M6 12h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Buka
                        </a>
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
                          onClick={() => handleDelete(item.id, item.region)}
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
              <h3 className="font-semibold text-gray-900">Edit Region — {editItem.region}</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Region *</label>
                  <input type="text" name="region" required defaultValue={editItem.region} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi</label>
                  <input type="text" name="provinsi" defaultValue={editItem.provinsi || ""} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ketua Region</label>
                  <input type="text" name="ketuaRegion" defaultValue={editItem.ketuaRegion || ""} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Ketua Region</label>
                  <input type="email" name="emailKetua" defaultValue={editItem.emailKetua || ""} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">WA Ketua Region</label>
                  <input type="text" name="waKetua" defaultValue={editItem.waKetua || ""} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link WA Grup</label>
                <input type="text" name="linkWaGrup" defaultValue={editItem.linkWaGrup || ""} className={inputCls} />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Urutan</label>
                <input type="number" name="order" defaultValue={editItem.order} className={inputCls} />
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
