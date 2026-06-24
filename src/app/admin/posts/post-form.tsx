"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { createPost } from "@/lib/actions"
import { ContentEditor } from "@/components/content-editor"
import { ImageUpload } from "@/components/image-upload"
import { useState } from "react"

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

export function PostForm({ categories, initialData }: { categories: Category[]; initialData?: any }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createPost, null)
  const [content, setContent] = useState(initialData?.content || "")
  const [image, setImage] = useState(initialData?.image || "")

  return (
    <form action={formAction} className="max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Judul</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={initialData?.title || ""}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-lg font-semibold"
              placeholder="Masukkan judul postingan..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konten</label>
            <input type="hidden" name="content" value={content} />
            <ContentEditor value={content} onChange={setContent} />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1.5">Ringkasan (Excerpt)</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={initialData?.excerpt || ""}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm resize-none"
              placeholder="Ringkasan singkat postingan..."
            />
          </div>

          <ImageUpload value={image} onChange={setImage} label="Gambar Unggulan" hint="Rekomendasi: 1920×1080px (16:9) — agar gambar tidak terpotong dan tampil sempurna di carousel home" />
          <input type="hidden" name="image" value={image} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Publikasi</h3>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={initialData?.status || "draft"}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Terbitkan</option>
                <option value="archived">Arsip</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  value="true"
                  defaultChecked={initialData?.featured || false}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Jadikan berita unggulan</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={initialData?.categoryId || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
            >
              <option value="">Tanpa kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {state?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full dxic-gradient text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Simpan Postingan
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
