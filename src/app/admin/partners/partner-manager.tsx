"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createPartner, deletePartner, togglePartnerActive } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"

interface Partner {
  id: string
  name: string
  logo: string
  description: string | null
  website: string | null
  locationLink: string | null
  benefit: string | null
  region: string | null
  order: number
  isActive: boolean
}

export function PartnerManager({ partners }: { partners: Partner[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [createLogo, setCreateLogo] = useState("")
  const [createState, createAction, createPending] = useActionState(createPartner, null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Close create form on success
  useEffect(() => {
    if (createState?.success) {
      setCreateOpen(false)
      setCreateLogo("")
      router.refresh()
    }
  }, [createState])

  async function handleDelete(id: string) {
    if (!confirm("Hapus mitra ini?")) return
    await deletePartner(id)
    router.refresh()
  }

  async function handleToggle(id: string) {
    setTogglingId(id)
    await togglePartnerActive(id)
    setTogglingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Total {partners.length} mitra
          </p>
        </div>
        {!createOpen ? (
          <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Mitra
          </button>
        ) : null}
      </div>

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Mitra Baru</h3>
            <button onClick={() => { setCreateOpen(false); setCreateLogo(""); }} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Mitra</label>
                <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Nama perusahaan/organisasi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website (opsional)</label>
                <input type="url" name="website" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi (opsional)</label>
              <textarea name="description" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" placeholder="Deskripsi singkat tentang mitra..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi (opsional)</label>
                <input type="text" name="locationLink" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Semua cabang bengkel resmi di kota anda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Benefit untuk Member (opsional)</label>
                <input type="text" name="benefit" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Mis: Diskon 20% service" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wilayah (opsional)</label>
                <input type="text" name="region" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Jabodetabek, Jawa Timur, Sumatera" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Urutan</label>
                <input type="number" name="order" defaultValue={partners.length} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <input type="hidden" name="logo" value={createLogo} />
              <ImageUpload value={createLogo} onChange={setCreateLogo} label="Logo Mitra" hint="Rekomendasi: 400×400px (persegi) dengan latar transparan" />
            </div>

            {createState?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{createState.error}</div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={createPending} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2">
                {createPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Mitra"
                )}
              </button>
              <button type="button" onClick={() => { setCreateOpen(false); setCreateLogo(""); }} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Partners Table */}
      {partners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 mb-4">Belum ada mitra kerja sama</p>
          <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Mitra Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 w-16">Logo</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Nama Mitra</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Deskripsi</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden xl:table-cell">Wilayah</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden xl:table-cell">Lokasi</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Benefit</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Tampil</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners.map((partner) => (
                  <tr key={partner.id} className={`hover:bg-gray-50/50 transition-colors ${!partner.isActive ? "opacity-60" : ""}`}>
                    {/* Logo */}
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <div className="w-full h-full dxic-gradient flex items-center justify-center text-white font-bold text-xs">
                            {partner.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Nama + Website */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{partner.name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>Urutan: {partner.order}</span>
                        {partner.website && (
                          <>
                            <span>•</span>
                            <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">Website</a>
                          </>
                        )}
                      </div>
                    </td>
                    {/* Deskripsi */}
                    <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">
                      <span className="line-clamp-2 max-w-xs">{partner.description || "-"}</span>
                    </td>
                    {/* Wilayah */}
                    <td className="py-3 px-4 hidden xl:table-cell">
                      {partner.region ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {partner.region}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    {/* Lokasi */}
                    <td className="py-3 px-4 hidden xl:table-cell">
                      {partner.locationLink ? (
                        <span className="text-xs text-gray-600 line-clamp-2 max-w-[200px]">
                          {partner.locationLink.startsWith("http://") || partner.locationLink.startsWith("https://") ? (
                            <a href={partner.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-medium">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {partner.locationLink.replace(/^https?:\/\//, "").substring(0, 30)}
                            </a>
                          ) : (
                            partner.locationLink
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    {/* Benefit */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      {partner.benefit ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {partner.benefit}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    {/* Tampil (Ya/Tidak) */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(partner.id)}
                        disabled={togglingId === partner.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          partner.isActive ? "bg-red-600" : "bg-gray-300"
                        }`}
                        title={partner.isActive ? "Klik untuk sembunyikan" : "Klik untuk tampilkan"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            partner.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div className="text-xs mt-1 font-medium">
                        {partner.isActive ? (
                          <span className="text-emerald-600">Ya</span>
                        ) : (
                          <span className="text-gray-400">Tidak</span>
                        )}
                      </div>
                    </td>
                    {/* Aksi */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/partners/${partner.id}/edit`}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
