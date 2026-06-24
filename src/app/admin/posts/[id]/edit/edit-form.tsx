"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { updatePost } from "@/lib/actions"
import { ContentEditor } from "@/components/content-editor"
import { ImageUpload } from "@/components/image-upload"
import { useState } from "react"

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

export function EditPostForm({ post, categories }: { post: any; categories: Category[] }) {
  const router = useRouter()
  const [content, setContent] = useState(post.content || "")
  const [image, setImage] = useState(post.image || "")
  const updateWithId = updatePost.bind(null, post.id)
  const [state, formAction, pending] = useActionState(updateWithId, null)

  return (
    <form action={formAction} className="max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Judul</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={post.title}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konten</label>
            <input type="hidden" name="content" value={content} />
            <ContentEditor value={content} onChange={setContent} />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1.5">Ringkasan</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={post.excerpt || ""}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>

          <ImageUpload value={image} onChange={setImage} label="Gambar Unggulan" hint="Rekomendasi: 1920×1080px (16:9) — agar gambar tidak terpotong dan tampil sempurna di carousel home" />
          <input type="hidden" name="image" value={image} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Publikasi</h3>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select id="status" name="status" defaultValue={post.status} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm">
                <option value="draft">Draft</option>
                <option value="published">Terbitkan</option>
                <option value="archived">Arsip</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" value="true" defaultChecked={post.featured} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                <span className="text-sm text-gray-700">Berita unggulan</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <select id="categoryId" name="categoryId" defaultValue={post.categoryId || ""} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm">
              <option value="">Tanpa kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {state?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{state.error}</div>
          )}

          <button type="submit" disabled={pending} className="w-full dxic-gradient text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </form>
  )
}
