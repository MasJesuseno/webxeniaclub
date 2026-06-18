"use client";

import { useState } from "react";
import { createTag, deleteTag } from "./actions";

type Tag = {
  id: number;
  name: string;
  slug: string;
  _count: { posts: number };
};

export function TagManager({ tags: initialTags }: { tags: Tag[] }) {
  const [tags, setTags] = useState(initialTags);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", newName.trim());
      await createTag(formData);
      setNewName("");
      window.location.reload();
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Hapus tag "${name}"?`)) return;
    try {
      await deleteTag(id);
      window.location.reload();
    } catch {
      alert("Gagal menghapus tag");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tag</h1>
        <p className="text-gray-500 mt-1">Kelola tag untuk postingan</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama tag baru..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || !newName.trim()}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Menambah..." : "Tambah"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="group flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-700">{tag.name}</span>
            <span className="text-xs text-gray-400">({tag._count.posts})</span>
            <button
              onClick={() => handleDelete(tag.id, tag.name)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <p className="text-gray-400 text-sm py-4">Belum ada tag</p>
        )}
      </div>
    </div>
  );
}
