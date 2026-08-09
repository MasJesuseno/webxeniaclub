"use client"

import { useState, useEffect, useRef, useCallback, useActionState } from "react"
import { useRouter } from "next/navigation"
import { updateBukuMember, deleteBukuMember, getMitraList, lookupMember } from "@/lib/actions"

interface BukuMember {
  id: string
  memberId: string | null
  namaMember: string
  region: string | null
  mitra: string
  tanggal: Date | null
  jumlahBayar: number | null
  diskon: string | null
  keterangan: string | null
}

function formatDateInput(date: Date | null | string) {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export function EditBukuMemberForm({ item }: { item: BukuMember }) {
  const router = useRouter()
  const [partners, setPartners] = useState<string[]>([])
  const [lookupLoading, setLookupLoading] = useState(false)
  const namaRef = useRef<HTMLInputElement>(null)
  const regionRef = useRef<HTMLInputElement>(null)
  const lookupTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const updateWithId = updateBukuMember.bind(null, item.id)
  const [state, formAction, pending] = useActionState(updateWithId, null)

  // Load partners on mount + ensure current mitra is in list
  useEffect(() => {
    getMitraList().then((list) => {
      const names = list.map((p) => p.name)
      // If current mitra is not in active partners (e.g. deactivated), add it anyway
      if (item.mitra && !names.includes(item.mitra)) {
        names.push(item.mitra)
      }
      setPartners(names)
    })
  }, [item.mitra])

  // Auto-fill from memberId on edit form too
  const handleMemberIdChange = useCallback((value: string) => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current)
    if (!value || value.trim().length < 2) return
    setLookupLoading(true)
    lookupTimer.current = setTimeout(async () => {
      try {
        const result = await lookupMember(value.trim())
        if (result) {
          if (namaRef.current) namaRef.current.value = result.namaMember
          if (regionRef.current && result.region) regionRef.current.value = result.region
        }
      } finally {
        setLookupLoading(false)
      }
    }, 500)
  }, [])

  async function handleDelete() {
    if (!confirm("Hapus data ini?")) return
    await deleteBukuMember(item.id)
    router.push("/admin/buku-member")
    router.refresh()
  }

  const allMitraOptions = partners // already includes item.mitra if needed

  return (
    <form action={formAction} className="max-w-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
            <h3 className="font-semibold text-gray-900 text-lg">Informasi Transaksi</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ID Member
                  {lookupLoading && (
                    <svg className="inline-block w-3.5 h-3.5 ml-1.5 text-red-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                </label>
                <input
                  type="text"
                  name="memberId"
                  defaultValue={item.memberId || ""}
                  onChange={(e) => handleMemberIdChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Ketik ID member..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Member <span className="text-red-500">*</span>
                </label>
                <input
                  ref={namaRef}
                  type="text"
                  name="namaMember"
                  required
                  defaultValue={item.namaMember}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Nama lengkap member"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
                <input
                  ref={regionRef}
                  type="text"
                  name="region"
                  defaultValue={item.region || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Terisi otomatis dari ID Member"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mitra <span className="text-red-500">*</span>
                </label>
                <select
                  name="mitra"
                  required
                  defaultValue={item.mitra}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                >
                  <option value="">-- Pilih Mitra --</option>
                  {allMitraOptions.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  name="tanggal"
                  defaultValue={formatDateInput(item.tanggal)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Bayar</label>
                <input
                  type="number"
                  name="jumlahBayar"
                  step="500"
                  defaultValue={item.jumlahBayar ?? ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Rp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Diskon</label>
                <input
                  type="text"
                  name="diskon"
                  defaultValue={item.diskon || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Mis: 5%, 10%, atau Rp50.000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
                <input
                  type="text"
                  name="keterangan"
                  defaultValue={item.keterangan || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {state?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-3">
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
                "Simpan Perubahan"
              )}
            </button>
            <a
              href="/admin/buku-member"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Batal
            </a>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full text-center py-3 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all"
            >
              Hapus Data Ini
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
