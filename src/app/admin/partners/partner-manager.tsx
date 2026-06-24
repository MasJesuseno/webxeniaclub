"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPartner, updatePartner, deletePartner } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"

interface Partner {
  id: string
  name: string
  logo: string
  description: string | null
  website: string | null
  order: number
  isActive: boolean
}

export function PartnerManager({ partners }: { partners: Partner[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partner | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLogo, setCreateLogo] = useState("")
  const [editLogo, setEditLogo] = useState("")
  const [createState, createAction, createPending] = useActionState(createPartner, null)

  // Close create form on success
  useEffect(() => {
    if (createState?.success) {
      setCreateOpen(false)
      setCreateLogo("")
      router.refresh()
    }
  }, [createState])

  async function handleUpdate() {
    if (!editingId || !editData) return
    const form = new FormData()
    form.set("name", editData.name)
    form.set("logo", editLogo)
    form.set("description", editData.description || "")
    form.set("website", editData.website || "")
    form.set("isActive", String(editData.isActive))
    form.set("order", String(editData.order))
    const res = await updatePartner(editingId, null, form)
    if (res?.error) alert(res.error)
    setEditingId(null)
    setEditData(null)
    setEditLogo("")
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus mitra ini?")) return
    await deletePartner(id)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Create Button / Form */}
      {!createOpen ? (
        <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Mitra
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tambah Mitra Baru</h3>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Mitra</label>
                <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Nama perusahaan/organisasi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website (opsional)</label>
                <input type="url" name="website" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi (opsional)</label>
              <textarea name="description" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" placeholder="Deskripsi singkat tentang mitra..." />
            </div>
            <div>
              <input type="hidden" name="logo" value={createLogo} />
              <ImageUpload value={createLogo} onChange={setCreateLogo} label="Logo Mitra" hint="Rekomendasi: 400×400px (persegi) dengan latar transparan" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Urutan</label>
                <input type="number" name="order" defaultValue={partners.length} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
              </div>
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
                  "Simpan Mitra"
                )}
              </button>
              <button type="button" onClick={() => { setCreateOpen(false); setCreateLogo(""); }} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${partner.isActive ? "border-gray-100" : "border-gray-200 border-dashed opacity-75"}`}>
            {editingId === partner.id && editData ? (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
                    <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                    <input type="url" value={editData.website || ""} onChange={(e) => setEditData({ ...editData, website: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                  <textarea value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
                </div>
                <ImageUpload value={editLogo} onChange={setEditLogo} label="Logo Mitra" hint="Rekomendasi: 400×400px (persegi) dengan latar transparan" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Urutan</label>
                    <input type="number" value={editData.order} onChange={(e) => setEditData({ ...editData, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editData.isActive} onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                      <span className="text-sm text-gray-700">Aktif</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleUpdate} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Perubahan</button>
                  <button onClick={() => { setEditingId(null); setEditData(null); setEditLogo(""); }} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-40 bg-gray-50 flex items-center justify-center p-6">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full dxic-gradient flex items-center justify-center text-white font-bold text-2xl">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{partner.name}</h3>
                    {!partner.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Nonaktif</span>}
                  </div>
                  {partner.description && <p className="text-sm text-gray-500 line-clamp-2">{partner.description}</p>}
                  {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:text-red-700 mt-2 inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Kunjungi website
                    </a>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Urutan: {partner.order}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingId(partner.id); setEditData({ ...partner }); setEditLogo(partner.logo || ""); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(partner.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {partners.length === 0 && (
          <div className="col-span-full text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 mb-4">Belum ada mitra kerja sama</p>
            <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Mitra Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
