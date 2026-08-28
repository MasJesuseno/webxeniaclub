"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createPengurus, updatePengurus, deletePengurus } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"

interface Pengurus {
  id: string
  memberId: string | null
  nama: string
  jabatan: string
  foto: string | null
  tentang: string | null
  urutan: number
  isActive: boolean
  createdAt: Date
}

export function PengurusManager({ initialData }: { initialData: Pengurus[] }) {
  const router = useRouter()
  const [data, setData] = useState<Pengurus[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Pengurus | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Form state
  const [formMemberId, setFormMemberId] = useState("")
  const [formNama, setFormNama] = useState("")
  const [formJabatan, setFormJabatan] = useState("")
  const [formFoto, setFormFoto] = useState("")
  const [formTentang, setFormTentang] = useState("")
  const [formUrutan, setFormUrutan] = useState("0")
  const [formIsActive, setFormIsActive] = useState(true)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupMsg, setLookupMsg] = useState("")

  const resetForm = () => {
    setFormMemberId("")
    setFormNama("")
    setFormJabatan("")
    setFormFoto("")
    setFormTentang("")
    setFormUrutan("0")
    setFormIsActive(true)
    setEditItem(null)
    setLookupMsg("")
  }

  const handleLookup = async () => {
    if (!formMemberId.trim()) return
    setLookupLoading(true)
    setLookupMsg("")
    try {
      const res = await fetch(`/api/member/public/${formMemberId.trim()}`)
      if (res.ok) {
        const d = await res.json()
        if (d.member) {
          setFormNama(d.member.namaLengkap || "")
          setLookupMsg("✓ Data ditemukan")
        } else {
          setLookupMsg("ID tidak ditemukan, isi manual")
        }
      } else {
        setLookupMsg("ID tidak ditemukan, isi manual")
      }
    } catch {
      setLookupMsg("Gagal lookup")
    }
    setLookupLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const fd = new FormData()
    fd.append("memberId", formMemberId)
    fd.append("nama", formNama)
    fd.append("jabatan", formJabatan)
    fd.append("foto", formFoto)
    fd.append("tentang", formTentang)
    fd.append("urutan", formUrutan)
    fd.append("isActive", String(formIsActive))

    let result
    if (editItem) {
      result = await updatePengurus(editItem.id, null, fd)
    } else {
      result = await createPengurus(null, fd)
    }

    if (result?.error) {
      setMsg({ text: result.error, error: true })
    } else {
      setMsg({ text: editItem ? "Berhasil diupdate" : "Berhasil ditambahkan" })
      setShowForm(false)
      resetForm()
      router.refresh()
      // Re-fetch data
      const res = await fetch("/api/admin/pengurus")
      if (res.ok) {
        const d = await res.json()
        setData(d.pengurus || [])
      }
    }
    setLoading(false)
  }

  const handleEdit = (item: Pengurus) => {
    setEditItem(item)
    setFormMemberId(item.memberId || "")
    setFormNama(item.nama)
    setFormJabatan(item.jabatan)
    setFormFoto(item.foto || "")
    setFormTentang(item.tentang || "")
    setFormUrutan(String(item.urutan))
    setFormIsActive(item.isActive)
    setShowForm(true)
    setLookupMsg("")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data pengurus ini?")) return
    setLoading(true)
    await deletePengurus(id)
    setData((prev) => prev.filter((p) => p.id !== id))
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Message */}
      {msg && (
        <div className={`px-4 py-2 rounded-lg text-sm ${msg.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          + Tambah Pengurus
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">{editItem ? "Edit Pengurus" : "Tambah Pengurus"}</h3>

          {/* Member ID Lookup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Member (opsional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formMemberId}
                onChange={(e) => setFormMemberId(e.target.value)}
                onBlur={handleLookup}
                placeholder="Contoh: 0099"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {lookupLoading && <span className="text-sm text-gray-400">Cari...</span>}
            </div>
            {lookupMsg && (
              <p className={`text-xs mt-1 ${lookupMsg.startsWith("✓") ? "text-green-600" : "text-amber-600"}`}>{lookupMsg}</p>
            )}
          </div>

          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Jabatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formJabatan}
              onChange={(e) => setFormJabatan(e.target.value)}
              required
              placeholder="Contoh: Ketua, Sekretaris, Bendahara"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
            <ImageUpload value={formFoto} onChange={setFormFoto} label="Upload Foto" hint="Foto profil pengurus" />
          </div>

          {/* Tentang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tentang</label>
            <textarea
              value={formTentang}
              onChange={(e) => setFormTentang(e.target.value)}
              rows={3}
              placeholder="Deskripsi singkat tentang pengurus"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Urutan + Active */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutan Tampil</label>
              <input
                type="number"
                value={formUrutan}
                onChange={(e) => setFormUrutan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : editItem ? "Update" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm() }}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">No</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Foto</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ID Member</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Jabatan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tentang</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Urutan</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    Belum ada data pengurus
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {item.foto ? (
                        <img src={item.foto} alt={item.nama} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
                          {item.nama.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.memberId || "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.nama}</td>
                    <td className="px-4 py-3 text-gray-700">{item.jabatan}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{item.tentang || "-"}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{item.urutan}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
