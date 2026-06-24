"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createGalleryItem, deleteGalleryItem } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"

interface GalleryItem {
  id: string
  title: string | null
  image: string
  description: string | null
  albumId: string
  album: { title: string; slug: string }
  createdAt: Date
}

interface Album {
  id: string
  title: string
  slug: string
}

export function GalleryManager({ items, albums }: { items: GalleryItem[]; albums: Album[] }) {
  const router = useRouter()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [image, setImage] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [albumId, setAlbumId] = useState(albums[0]?.id || "")

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!image || !albumId) { alert("Gambar dan album harus diisi"); return }
    const form = new FormData()
    form.set("image", image)
    form.set("albumId", albumId)
    form.set("title", title)
    form.set("description", description)
    const res = await createGalleryItem(form)
    if (res?.error) alert(res.error)
    setImage(""); setTitle(""); setDescription(""); setUploadOpen(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus foto ini?")) return
    await deleteGalleryItem(id)
    router.refresh()
  }

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.albumId]) acc[item.albumId] = { album: item.album, items: [] }
    acc[item.albumId].items.push(item)
    return acc
  }, {} as Record<string, { album: { title: string; slug: string }; items: GalleryItem[] }>)

  return (
    <div className="space-y-8">
      {/* Upload Button / Form */}
      {albums.length === 0 ? (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm text-yellow-700">
          Belum ada album. Silakan buat album terlebih dahulu di menu <strong>Album</strong>.
        </div>
      ) : !uploadOpen ? (
        <button onClick={() => setUploadOpen(true)} className="dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Foto Baru
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Upload Foto Baru</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Album</label>
              <select value={albumId} onChange={(e) => setAlbumId(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
                {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
            <ImageUpload value={image} onChange={setImage} label="Foto" hint="Rekomendasi: 1920×1080px (16:9) untuk foto galeri" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Foto (opsional)</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Judul foto" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi (opsional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Upload</button>
              <button type="button" onClick={() => setUploadOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Gallery Grid by Album */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Belum ada foto</p>
        </div>
      ) : (
        Object.entries(grouped).map(([albumId, group]) => (
          <div key={albumId}>
            <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {group.album.title}
              <span className="text-sm font-normal text-gray-400">({group.items.length} foto)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {group.items.map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={item.image} alt={item.title || "Foto"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                    <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white transition-all hover:scale-110">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
