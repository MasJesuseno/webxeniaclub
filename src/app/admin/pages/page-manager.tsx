"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPage, updatePage, deletePage } from "@/lib/actions"
import { ContentEditor } from "@/components/content-editor"

interface Page {
  id: string
  title: string
  slug: string
  content: string
  layout: string
  status: string
  createdAt: Date
}

export function PageManager({ pages }: { pages: Page[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ title: string; content: string; layout: string; status: string } | null>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await createPage(form)
    if (res?.error) alert(res.error)
    router.refresh()
  }

  async function handleUpdate(id: string) {
    if (!editData) return
    const form = new FormData()
    form.set("title", editData.title)
    form.set("content", editData.content)
    form.set("layout", editData.layout)
    form.set("status", editData.status)
    const res = await updatePage(id, form)
    if (res?.error) alert(res.error)
    setEditingId(null)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus halaman ini?")) return
    await deletePage(id)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Create Form */}
      <AddPageForm onCreated={() => router.refresh()} />

      {/* Pages List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Daftar Halaman ({pages.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {pages.map((page) => (
            <div key={page.id} className="px-6 py-4">
              {editingId === page.id ? (
                <EditForm
                  page={page}
                  data={editData!}
                  onChange={setEditData}
                  onSave={() => handleUpdate(page.id)}
                  onCancel={() => { setEditingId(null); setEditData(null); }}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{page.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        page.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {page.status === "published" ? "Terbit" : "Draft"}
                      </span>
                      <span className="text-xs text-gray-400">/{page.slug}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Layout: {page.layout}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingId(page.id); setEditData({ title: page.title, content: page.content, layout: page.layout, status: page.status }); }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(page.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {pages.length === 0 && (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Belum ada halaman</p>
          )}
        </div>
      </div>
    </div>
  )
}

function AddPageForm({ onCreated }: { onCreated: () => void }) {
  const [content, setContent] = useState("")
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await createPage(form)
    if (res?.error) alert(res.error)
    else { setContent(""); setOpen(false); onCreated() }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Tambah Halaman Baru
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">Tambah Halaman Baru</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul</label>
          <input type="text" name="title" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Judul halaman" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Konten</label>
          <input type="hidden" name="content" value={content} />
          <ContentEditor value={content} onChange={setContent} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Layout</label>
            <select name="layout" defaultValue="default" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
              <option value="default">Default</option>
              <option value="full-width">Full Width</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select name="status" defaultValue="draft" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
              <option value="draft">Draft</option>
              <option value="published">Terbitkan</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Halaman</button>
          <button type="button" onClick={() => setOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
        </div>
      </form>
    </div>
  )
}

function EditForm({ page, data, onChange, onSave, onCancel }: {
  page: Page
  data: { title: string; content: string; layout: string; status: string }
  onChange: (d: { title: string; content: string; layout: string; status: string }) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul</label>
        <input type="text" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Konten</label>
        <ContentEditor value={data.content} onChange={(v) => onChange({ ...data, content: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Layout</label>
          <select value={data.layout} onChange={(e) => onChange({ ...data, layout: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
            <option value="default">Default</option>
            <option value="full-width">Full Width</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select value={data.status} onChange={(e) => onChange({ ...data, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
            <option value="draft">Draft</option>
            <option value="published">Terbitkan</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onSave} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Perubahan</button>
        <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
      </div>
    </div>
  )
}
