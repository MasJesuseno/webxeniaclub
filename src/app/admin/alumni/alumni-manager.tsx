"use client";

import { useState } from "react";
import { addAlumni, updateAlumni, deleteAlumni } from "./actions";
import { ImageUpload } from "@/components/image-upload";

type Alumni = {
  id: number;
  name: string;
  photo: string | null;
  testimonial: string;
  graduationYear: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
};

export function AlumniManager({ items: initialItems }: { items: Alumni[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (editing) {
        await updateAlumni(editing.id, formData);
      } else {
        await addAlumni(formData);
      }
      setShowModal(false);
      setEditing(null);
      window.location.reload();
    } catch {
      alert("Gagal menyimpan data alumni");
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

  function openEdit(item: Alumni) {
    setEditing(item);
    setShowModal(true);
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Hapus testimoni "${name}"?`)) return;
    try {
      await deleteAlumni(id);
      window.location.reload();
    } catch {
      alert("Gagal menghapus");
    }
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimoni Alumni</h1>
          <p className="text-gray-500 mt-1">Kelola testimoni dan foto alumni</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Alumni
        </button>
      </div>

      {initialItems.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Belum ada testimoni alumni</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialItems.map((alumni) => (
            <div key={alumni.id} className="group relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
                  {alumni.photo ? (
                    <img src={alumni.photo} alt={alumni.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-400 font-bold text-xl">
                      {alumni.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{alumni.name}</h3>
                  {alumni.graduationYear && (
                    <p className="text-xs text-gray-500">Lulus {alumni.graduationYear}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3 italic">
                    &quot;{alumni.testimonial}&quot;
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(alumni.createdAt)}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(alumni)}
                  className="p-1.5 bg-white/90 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-white shadow transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(alumni.id, alumni.name)}
                  className="p-1.5 bg-white/90 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white shadow transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Edit Alumni" : "Tambah Alumni"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                name="photo"
                label="Upload Foto"
                defaultValue={editing?.photo || undefined}
                recommendedResolution="400 × 400 piksel (persegi)"
                aspectRatio="1/1"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editing?.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nama alumni"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Lulus</label>
                <input
                  type="text"
                  name="graduationYear"
                  defaultValue={editing?.graduationYear || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Contoh: 2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testimoni *</label>
                <textarea
                  name="testimonial"
                  required
                  rows={4}
                  defaultValue={editing?.testimonial || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Tulis pendapat alumni selama belajar di SMA Annajah..."
                />
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
