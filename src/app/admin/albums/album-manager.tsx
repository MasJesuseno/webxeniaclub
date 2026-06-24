"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAlbum, updateAlbum, deleteAlbum } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"

interface Album {
  id: string
  title: string
  slug: string
  description: string | null
  coverImage: string | null
  _count: { items: number }
}

export function AlbumManager({ albums }: { albums: Album[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editCover, setEditCover] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newCover, setNewCover] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const form = new FormData()
    form.set("title", newTitle)
    form.set("description", newDesc)
    form.set("coverImage", newCover)
    const res = await createAlbum(form)
    if (res?.error) alert(res.error)
    setNewTitle(""); setNewDesc(""); setNewCover(""); setCreateOpen(false)
    router.refresh()
  }

  async function handleUpdate(id: string) {
    const form = new FormData()
    form.set("title", editTitle)
    form.set("description", editDesc)
    form.set("coverImage", editCover)
    const res = await updateAlbum(id, form)
    if (res?.error) alert(res.error)
    setEditingId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus album ini? Semua foto di dalamnya akan ikut terhapus.")) return
    await deleteAlbum(id)
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
          Tambah Album Baru
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tambah Album Baru</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Album</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Kopdar Akbar 2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
            </div>
            <ImageUpload value={newCover} onChange={setNewCover} label="Foto Sampul" hint="Rekomendasi: 1920×1080px (16:9) untuk sampul album" />
            <div className="flex gap-3">
              <button type="submit" className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Album</button>
              <button type="button" onClick={() => setCreateOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Albums List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div key={album.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {editingId === album.id ? (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
                </div>
                <ImageUpload value={editCover} onChange={setEditCover} label="Foto Sampul" hint="Rekomendasi: 1920×1080px (16:9) untuk sampul album" />
                <div className="flex gap-3">
                  <button onClick={() => handleUpdate(album.id)} className="dxic-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold">Simpan</button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700">Batal</button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  {album.coverImage ? (
                    <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full dxic-gradient flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                    {album._count.items} foto
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900">{album.title}</h3>
                  {album.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{album.description}</p>}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">/{album.slug}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingId(album.id); setEditTitle(album.title); setEditDesc(album.description || ""); setEditCover(album.coverImage || ""); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(album.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all">
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
        {albums.length === 0 && (
          <div className="col-span-full text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 mb-4">Belum ada album</p>
            <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Album Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
