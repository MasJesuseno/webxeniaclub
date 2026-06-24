"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createTestimonial, updateTestimonial, deleteTestimonial } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"

interface Testimonial {
  id: string
  name: string
  photo: string | null
  content: string
  title: string | null
  order: number
  isActive: boolean
}

export function TestimonialManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Testimonial | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createPhoto, setCreatePhoto] = useState("")
  const [editPhoto, setEditPhoto] = useState("")

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await createTestimonial(form)
    if (res?.error) alert(res.error)
    setCreateOpen(false)
    setCreatePhoto("")
    router.refresh()
  }

  async function handleUpdate() {
    if (!editingId || !editData) return
    const form = new FormData()
    form.set("name", editData.name)
    form.set("content", editData.content)
    form.set("title", editData.title || "")
    form.set("photo", editPhoto)
    form.set("isActive", String(editData.isActive))
    form.set("order", String(editData.order))
    const res = await updateTestimonial(editingId, form)
    if (res?.error) alert(res.error)
    setEditingId(null)
    setEditData(null)
    setEditPhoto("")
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus testimoni ini?")) return
    await deleteTestimonial(id)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {!createOpen ? (
        <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Testimoni
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tambah Testimoni Baru</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
                <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Nama anggota" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jabatan</label>
                <input type="text" name="title" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Anggota DXIC Jakarta" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Testimoni</label>
              <textarea name="content" required rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" placeholder="Tulis testimoni..." />
            </div>
            <div>
              <input type="hidden" name="photo" value={createPhoto} />
              <ImageUpload value={createPhoto} onChange={setCreatePhoto} label="Foto" hint="Rekomendasi: 400×400px (persegi) untuk foto profil" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Urutan</label>
                <input type="number" name="order" defaultValue={testimonials.length} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Testimoni</button>
              <button type="button" onClick={() => setCreateOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${t.isActive ? "border-gray-100" : "border-gray-200 border-dashed opacity-75"}`}>
            {editingId === t.id && editData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
                    <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Jabatan</label>
                    <input type="text" value={editData.title || ""} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Testimoni</label>
                  <textarea value={editData.content} onChange={(e) => setEditData({ ...editData, content: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
                </div>
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
                <div>
                  <ImageUpload value={editPhoto} onChange={setEditPhoto} label="Foto" hint="Rekomendasi: 400×400px (persegi) untuk foto profil" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleUpdate} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Perubahan</button>
                  <button onClick={() => { setEditingId(null); setEditData(null); }} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full dxic-gradient flex items-center justify-center text-white font-bold text-lg">{t.name.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
                    {t.title && <span className="text-sm text-gray-500">— {t.title}</span>}
                    {!t.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Nonaktif</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{t.content}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-2">Urutan: {t.order}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingId(t.id); setEditData({ ...t }); setEditPhoto(t.photo || ""); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-500">Belum ada testimoni</p>
          </div>
        )}
      </div>
    </div>
  )
}
