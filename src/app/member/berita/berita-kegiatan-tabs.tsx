"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate, truncate, stripHtml } from "@/lib/utils"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  image: string | null
  publishedAt: Date | null
  author: { name: string }
  category: { name: string; color: string } | null
}

interface KegiatanItem {
  id: string
  tanggal: Date
  region: string
  namaKegiatan: string
  uraian: string | null
  lokasi: string
  kontakPerson: string
}

export function BeritaKegiatanTabs({
  posts,
  kegiatan,
  canAddKegiatan,
}: {
  posts: Post[]
  kegiatan: KegiatanItem[]
  canAddKegiatan: boolean
}) {
  const router = useRouter()
  const [tab, setTab] = useState<"berita" | "kegiatan">("berita")
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formTanggal, setFormTanggal] = useState("")
  const [formRegion, setFormRegion] = useState("")
  const [formNama, setFormNama] = useState("")
  const [formUraian, setFormUraian] = useState("")
  const [formLokasi, setFormLokasi] = useState("")
  const [formKontak, setFormKontak] = useState("")

  function resetForm() {
    setFormTanggal("")
    setFormRegion("")
    setFormNama("")
    setFormUraian("")
    setFormLokasi("")
    setFormKontak("")
    setError(null)
    setSuccess(false)
    setShowAddForm(false)
  }

  async function handleAddKegiatan() {
    setError(null)
    setSuccess(false)

    if (!formTanggal) return setError("Tanggal harus diisi")
    if (!formRegion.trim()) return setError("Region / Provinsi harus diisi")
    if (!formNama.trim()) return setError("Nama kegiatan harus diisi")
    if (!formLokasi.trim()) return setError("Lokasi harus diisi")
    if (!formKontak.trim()) return setError("Kontak Person harus diisi")

    setSubmitting(true)
    try {
      const res = await fetch("/api/member/kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: formTanggal,
          region: formRegion.trim(),
          namaKegiatan: formNama.trim(),
          uraian: formUraian.trim() || null,
          lokasi: formLokasi.trim(),
          kontakPerson: formKontak.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal menambahkan kegiatan")
      } else {
        setSuccess(true)
        resetForm()
        router.refresh()
      }
    } catch {
      setError("Terjadi kesalahan jaringan")
    }
    setSubmitting(false)
  }

  function formatTanggal(d: Date) {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  /** Try to extract a phone number (10+ digits) from a string and return a WhatsApp link. */
  function renderKontakPerson(text: string) {
    const phoneMatch = text.match(/(\d[\d\s\-()]{8,}\d)/)
    if (!phoneMatch) return <>{text}</>

    const phoneRaw = phoneMatch[1]
    const digitsOnly = phoneRaw.replace(/[^\d]/g, "")
    const normalized = digitsOnly.startsWith("0")
      ? "62" + digitsOnly.slice(1)
      : digitsOnly.startsWith("62")
        ? digitsOnly
        : "62" + digitsOnly
    const before = text.slice(0, phoneMatch.index)
    const after = text.slice(phoneMatch.index! + phoneRaw.length)

    return (
      <>
        {before}
        <a
          href={`https://wa.me/${normalized}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 font-medium hover:underline inline-flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {phoneRaw.trim()}
        </a>
        {after}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Berita</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Informasi dan berita terbaru seputar DXIC
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("berita")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === "berita"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Berita
        </button>
        <button
          onClick={() => setTab("kegiatan")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === "kegiatan"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Kegiatan ({kegiatan.length})
        </button>
      </div>

      {/* Tab Content: Berita */}
      {tab === "berita" && (
        <>
          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/member/berita/${post.slug}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full dxic-gradient flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {post.category && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-semibold text-white"
                            style={{ backgroundColor: post.category.color || "#DC2626" }}
                          >
                            {post.category.name}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {post.publishedAt ? formatDate(post.publishedAt) : ""}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                        {post.excerpt || truncate(stripHtml(post.content), 100)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        {post.author.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-sm text-gray-500">Belum ada berita</p>
            </div>
          )}
        </>
      )}

      {/* Tab Content: Kegiatan */}
      {tab === "kegiatan" && (
        <>
          {/* Add Button */}
          {canAddKegiatan && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 hover:border-red-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Kegiatan
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Tambah Kegiatan</h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Region / Provinsi *</label>
                  <input
                    type="text"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    placeholder="Contoh: JAKARTA / DKI Jakarta"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Nama kegiatan"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Uraian</label>
                <textarea
                  value={formUraian}
                  onChange={(e) => setFormUraian(e.target.value)}
                  placeholder="Deskripsi singkat kegiatan (opsional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Lokasi *</label>
                  <input
                    type="text"
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    placeholder="Lokasi kegiatan"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Kontak Person *</label>
                  <input
                    type="text"
                    value={formKontak}
                    onChange={(e) => setFormKontak(e.target.value)}
                    placeholder="Nama / No. HP"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700">{error}</div>
              )}
              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-700">
                  Kegiatan berhasil ditambahkan!
                </div>
              )}
              <button
                onClick={handleAddKegiatan}
                disabled={submitting}
                className="w-full dxic-gradient text-white py-2.5 rounded-xl text-xs font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan Kegiatan"}
              </button>
            </div>
          )}

          {/* Kegiatan List */}
          {kegiatan.length > 0 ? (
            <div className="space-y-3">
              {kegiatan.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Date Badge */}
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-red-50 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-semibold text-red-600 uppercase">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold text-red-700 leading-none">
                        {new Date(item.tanggal).getDate()}
                      </span>
                      <span className="text-[9px] text-red-500">
                        {new Date(item.tanggal).getFullYear()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-gray-900 leading-snug">
                        {item.namaKegiatan}
                      </h3>
                      {item.uraian && (
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{item.uraian}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.lokasi}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          {item.region}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {renderKontakPerson(item.kontakPerson)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">Belum ada kegiatan</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
