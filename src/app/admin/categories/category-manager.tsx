"use client"

import { useActionState } from "react"
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions"
import { useState } from "react"

interface Category {
  id: string
  name: string
  slug: string
  color: string
  _count: { posts: number }
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(createCategory, null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Tambah Kategori Baru</h3>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kategori</label>
            <input type="text" id="name" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm" placeholder="Contoh: Kegiatan, Kopdar" />
          </div>
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1.5">Warna</label>
            <div className="flex gap-2">
              <input type="color" id="color" name="color" defaultValue="#DC2626" className="w-12 h-10 rounded-lg cursor-pointer" />
              <input type="text" name="color_text" defaultValue="#DC2626" className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm font-mono" placeholder="#DC2626" />
            </div>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={pending} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
            {pending ? "Menyimpan..." : "Simpan Kategori"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Daftar Kategori ({categories.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat._count.posts} postingan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingId(editingId === cat.id ? null : cat.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <form action={deleteCategory.bind(null, cat.id) as unknown as (formData: FormData) => void} onSubmit={(e) => { if (!confirm("Hapus kategori ini?")) e.preventDefault(); }}>
                  <button type="submit" className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Belum ada kategori</p>
          )}
        </div>
      </div>
    </div>
  )
}
