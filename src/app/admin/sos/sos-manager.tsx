"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSosMessage, updateSosMessage, deleteSosMessage, lookupMemberById } from "@/lib/actions"

interface SosMessage {
  id: string
  memberId: string | null
  nama: string
  region: string | null
  hp: string
  latitude: number | null
  longitude: number | null
  kebutuhan: string
  status: string
  createdAt: Date
  updatedAt: Date
}

function statusBadge(status: string) {
  if (status === "Open")
    return "bg-red-50 text-red-600 ring-1 ring-red-100"
  return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function SosManager({ messages }: { messages: SosMessage[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createPending, setCreatePending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editPending, setEditPending] = useState(false)

  const editItem = editingId ? messages.find((m) => m.id === editingId) : null

  const [memberLookup, setMemberLookup] = useState<{ loading: boolean; found: boolean; data?: { nama: string; region: string | null; hp: string } }>({ loading: false, found: false })

  async function handleMemberIdLookup(memberId: string, formEl: HTMLFormElement | null) {
    if (!memberId.trim()) {
      setMemberLookup({ loading: false, found: false })
      return
    }
    setMemberLookup({ loading: true, found: false })
    const data = await lookupMemberById(memberId.trim())
    if (data && formEl) {
      setMemberLookup({ loading: false, found: true, data })
      const namaInput = formEl.querySelector<HTMLInputElement>("[name='nama']")
      const regionInput = formEl.querySelector<HTMLInputElement>("[name='region']")
      const hpInput = formEl.querySelector<HTMLInputElement>("[name='hp']")
      if (namaInput) namaInput.value = data.nama
      if (regionInput) regionInput.value = data.region || ""
      if (hpInput) hpInput.value = data.hp
    } else {
      setMemberLookup({ loading: false, found: false })
    }
  }

  const openCount = messages.filter((m) => m.status === "Open").length
  const closeCount = messages.filter((m) => m.status === "Close").length

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreatePending(true)
    setCreateError(null)
    const form = new FormData(e.currentTarget)
    const res = await createSosMessage(null, form)
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
    const res = await updateSosMessage(editingId, form)
    if (res?.error) {
      setEditError(res.error)
    } else {
      setEditingId(null)
      router.refresh()
    }
    setEditPending(false)
  }

  async function handleDelete(item: SosMessage) {
    if (!confirm(`Hapus data SOS "${item.nama}"?`)) return
    await deleteSosMessage(item.id)
    router.refresh()
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"

  const sosFormFields = (defaultValues?: Partial<SosMessage>, formId?: string) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Member</label>
          <div className="relative">
            <input
              type="text"
              name="memberId"
              defaultValue={defaultValues?.memberId || ""}
              className={inputCls}
              placeholder="Ketik ID Member untuk auto-fill..."
              onBlur={(e) => handleMemberIdLookup(e.target.value, e.currentTarget.closest("form"))}
            />
            {memberLookup.loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
          {memberLookup.found && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Data member ditemukan — nama, region, HP terisi otomatis
            </p>
          )}
          {!memberLookup.loading && !memberLookup.found && defaultValues?.memberId && (
            <p className="text-xs text-amber-500 mt-1">ID tidak ditemukan, silakan isi manual</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama *</label>
          <input type="text" name="nama" required defaultValue={defaultValues?.nama || ""} className={inputCls} placeholder="Nama lengkap" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
          <input type="text" name="region" defaultValue={defaultValues?.region || ""} className={inputCls} placeholder="Contoh: Jabodetabek" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">No HP *</label>
          <input type="text" name="hp" required defaultValue={defaultValues?.hp || ""} className={inputCls} placeholder="08xxxxxxxxxx" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
          <input type="number" name="latitude" step="any" defaultValue={defaultValues?.latitude ?? ""} className={inputCls} placeholder="-6.2088" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
          <input type="number" name="longitude" step="any" defaultValue={defaultValues?.longitude ?? ""} className={inputCls} placeholder="106.8456" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Kebutuhan *</label>
        <textarea name="kebutuhan" required rows={3} defaultValue={defaultValues?.kebutuhan || ""} className={inputCls} placeholder="Jelaskan kebutuhan bantuan..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
        <select name="status" defaultValue={defaultValues?.status || "Open"} className={inputCls}>
          <option value="Open">Open (Belum Ditangani)</option>
          <option value="Close">Close (Selesai Ditangani)</option>
        </select>
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Total SOS</p>
          <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Open (Belum Ditangani)</p>
          <p className="text-2xl font-bold text-red-600">{openCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Close (Selesai)</p>
          <p className="text-2xl font-bold text-emerald-600">{closeCount}</p>
        </div>
      </div>

      {/* Header + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-gray-500">{messages.length} data SOS terdaftar</p>
        {!createOpen && !editingId ? (
          <button
            onClick={() => setCreateOpen(true)}
            className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah SOS
          </button>
        ) : null}
      </div>

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Data SOS Baru</h3>
            <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form id="create-sos-form" onSubmit={handleCreate} className="space-y-4">
            {sosFormFields(undefined, "create-sos-form")}
            {createError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{createError}</div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createPending}
                className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {createPending ? "Menyimpan..." : "Simpan SOS"}
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
      {messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-500 mb-4">Belum ada data SOS. Tambahkan data pertama Anda.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            + Tambah SOS
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">ID Member</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Nama</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Region</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">HP</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Lokasi GPS</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Kebutuhan</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-gray-600 text-xs font-mono">{item.memberId || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{item.nama}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{item.region || "—"}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <a href={`https://wa.me/${item.hp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {item.hp}
                      </a>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {item.latitude && item.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden lg:table-cell max-w-[200px] truncate" title={item.kebutuhan}>
                      {item.kebutuhan}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
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
              <h3 className="font-semibold text-gray-900">Edit SOS — {editItem.nama}</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form id="edit-sos-form" onSubmit={handleUpdate} className="space-y-4">
              {sosFormFields(editItem, "edit-sos-form")}
              <p className="text-[11px] text-gray-400">Dibuat: {formatDate(editItem.createdAt)}</p>
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
