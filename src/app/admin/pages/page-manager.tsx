"use client";

import { useState } from "react";
import { createPage, updatePage, deletePage } from "./actions";
import { ContentEditor } from "@/components/content-editor";

type CmsPage = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  status: string;
  layout: string;
  order: number;
  createdAt: Date;
};

export function PageManager({ pages: initialPages }: { pages: CmsPage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("content", content);

    try {
      if (editing) {
        await updatePage(editing.id, formData);
      } else {
        await createPage(formData);
      }
      setShowModal(false);
      setEditing(null);
      setContent("");
      window.location.reload();
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Hapus halaman "${title}"?`)) return;
    try {
      await deletePage(id);
      window.location.reload();
    } catch {
      alert("Gagal menghapus halaman");
    }
  }

  function openEdit(page: CmsPage) {
    setEditing(page);
    setContent(page.content || "");
    setShowModal(true);
  }

  function openCreate() {
    setEditing(null);
    setContent("");
    setShowModal(true);
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Halaman</h1>
          <p className="text-gray-500 mt-1">Kelola halaman statis</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Halaman
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Judul</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Slug</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Layout</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Urutan</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{page.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">/{page.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{page.layout}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    page.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {page.status === "published" ? "Terbit" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{page.order}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(page.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(page)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(page.id, page.title)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <div className="text-center py-12 text-gray-400">Belum ada halaman</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowModal(false); setEditing(null); }} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Edit Halaman" : "Tambah Halaman"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Halaman</label>
                <input type="text" name="title" required defaultValue={editing?.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                <ContentEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Tulis konten halaman di sini..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" defaultValue={editing?.status || "draft"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="draft">Draft</option>
                    <option value="published">Terbit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                  <select name="layout" defaultValue={editing?.layout || "default"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="default">Default</option>
                    <option value="full-width">Full Width</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                  <input type="number" name="order" defaultValue={editing?.order || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
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
