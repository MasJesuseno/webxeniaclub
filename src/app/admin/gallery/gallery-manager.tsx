"use client";

import { useState } from "react";
import { addGalleryItem, updateGalleryItem, deleteGalleryItem } from "./actions";
import { ImageUpload } from "@/components/image-upload";

type Album = { id: number; title: string; slug: string };
type GalleryItem = {
  id: number;
  title: string | null;
  image: string;
  description: string | null;
  type: string;
  album: Album | null;
  createdAt: Date;
};

export function GalleryManager({ items: initialItems, albums }: { items: GalleryItem[]; albums: Album[] }) {
  const [items] = useState(initialItems);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (editing) {
        await updateGalleryItem(editing.id, formData);
      } else {
        await addGalleryItem(formData);
      }
      setShowModal(false);
      setEditing(null);
      window.location.reload();
    } catch {
      alert("Gagal menyimpan gambar");
    } finally {
      setLoading(false);
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditing(null);
  }

  function openAdd() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setShowModal(true);
  }

  async function handleDelete(id: number, title: string | null) {
    if (!confirm(`Hapus ${title ? `"${title}"` : "gambar"}?`)) return;
    try {
      await deleteGalleryItem(id);
      window.location.reload();
    } catch {
      alert("Gagal menghapus");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeri</h1>
          <p className="text-gray-500 mt-1">Kelola gambar dan video</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Gambar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
            <div className="aspect-square overflow-hidden">
              {item.type === "video" ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <img src={item.image} alt={item.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title || "Tanpa Judul"}</p>
              {item.album && <p className="text-xs text-gray-500">{item.album.title}</p>}
            </div>

            {/* Action buttons overlay on hover */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(item)}
                className="p-1.5 bg-white/90 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-white shadow transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => handleDelete(item.id, item.title)}
                className="p-1.5 bg-white/90 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white shadow transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">Belum ada gambar di galeri</div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Edit Gambar" : "Tambah Gambar"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                name="image"
                label="Upload Gambar"
                defaultValue={editing?.image}
                recommendedResolution="1920 × 1080 piksel"
                aspectRatio="1/1"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul (opsional)</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editing?.title || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Masukkan judul gambar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editing?.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Deskripsi gambar"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
                  <select
                    name="albumId"
                    defaultValue={editing?.album?.id || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Tidak ada album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>{album.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select
                    name="type"
                    defaultValue={editing?.type || "image"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="image">Gambar</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleCloseModal}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
