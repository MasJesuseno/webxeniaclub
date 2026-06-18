"use client";

import { useState } from "react";
import { createAlbum, updateAlbum, deleteAlbum } from "./actions";
import { ImageUpload } from "@/components/image-upload";

type Album = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  _count: { items: number };
};

export function AlbumManager({ albums: initialAlbums }: { albums: Album[] }) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (editing) {
        await updateAlbum(editing.id, formData);
      } else {
        await createAlbum(formData);
      }
      setShowModal(false);
      setEditing(null);
      window.location.reload();
    } catch { alert("Terjadi kesalahan"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Hapus album "${title}"?`)) return;
    try { await deleteAlbum(id); window.location.reload(); }
    catch { alert("Gagal menghapus album"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Album</h1>
          <p className="text-gray-500 mt-1">Kelompokkan galeri ke dalam album</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Album Baru
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album) => (
          <div key={album.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              {album.coverImage ? (
                <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{album.title}</h3>
              {album.description && <p className="text-sm text-gray-500 mt-1">{album.description}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">{album._count.items} gambar</span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(album); setShowModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(album.id, album.title)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12 text-gray-400">Belum ada album</div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowModal(false); setEditing(null); }} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Album" : "Album Baru"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Album</label>
                <input type="text" name="title" required defaultValue={editing?.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea name="description" rows={2} defaultValue={editing?.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <ImageUpload
                  name="coverImage"
                  label="Cover Album (opsional)"
                  defaultValue={editing?.coverImage}
                  recommendedResolution="1920 × 1080 px (16:9)"
                  aspectRatio="16/9"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
