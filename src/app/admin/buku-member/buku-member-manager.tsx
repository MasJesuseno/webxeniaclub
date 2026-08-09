"use client"

import { useState, useActionState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBukuMember, deleteBukuMember, lookupMember, getMitraList } from "@/lib/actions"

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
  createdAt: Date
}

export function BukuMemberManager({ items }: { items: BukuMember[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [createState, createAction, createPending] = useActionState(createBukuMember, null)
  const [memberIdInput, setMemberIdInput] = useState("")
  const [autoFill, setAutoFill] = useState<{ namaMember: string; region: string | null } | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [partners, setPartners] = useState<string[]>([])
  const namaRef = useRef<HTMLInputElement>(null)
  const regionRef = useRef<HTMLInputElement>(null)
  const lookupTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // Filter state
  const [filterMemberId, setFilterMemberId] = useState("")
  const [filterNama, setFilterNama] = useState("")
  const [filterMitra, setFilterMitra] = useState("")
  const [filterTglMulai, setFilterTglMulai] = useState("")
  const [filterTglAkhir, setFilterTglAkhir] = useState("")

  // Unique mitra names from items for filter dropdown
  const mitraOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => { if (i.mitra) set.add(i.mitra) })
    return Array.from(set).sort()
  }, [items])

  // Apply filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by memberId
      if (filterMemberId) {
        const q = filterMemberId.toLowerCase()
        if (!item.memberId?.toLowerCase().includes(q)) return false
      }
      // Filter by nama
      if (filterNama) {
        const q = filterNama.toLowerCase()
        if (!item.namaMember.toLowerCase().includes(q)) return false
      }
      // Filter by mitra
      if (filterMitra && item.mitra !== filterMitra) return false
      // Filter by date range
      if (filterTglMulai && item.tanggal) {
        const tgl = new Date(item.tanggal)
        const mulai = new Date(filterTglMulai)
        if (tgl < mulai) return false
      }
      if (filterTglAkhir && item.tanggal) {
        const tgl = new Date(item.tanggal)
        const akhir = new Date(filterTglAkhir + "T23:59:59")
        if (tgl > akhir) return false
      }
      return true
    })
  }, [items, filterMemberId, filterNama, filterMitra, filterTglMulai, filterTglAkhir])

  // Load partners on mount
  useEffect(() => {
    getMitraList().then((list) => setPartners(list.map((p) => p.name)))
  }, [])

  // Lookup member when memberId changes (debounced)
  const handleMemberIdChange = useCallback((value: string) => {
    setMemberIdInput(value)

    if (lookupTimer.current) clearTimeout(lookupTimer.current)

    if (!value || value.trim().length < 2) {
      setAutoFill(null)
      return
    }

    setLookupLoading(true)
    lookupTimer.current = setTimeout(async () => {
      try {
        const result = await lookupMember(value.trim())
        setAutoFill(result)
        if (result) {
          // Auto-fill the nama and region inputs
          if (namaRef.current) {
            namaRef.current.value = result.namaMember
          }
          if (regionRef.current && result.region) {
            regionRef.current.value = result.region
          }
        }
      } finally {
        setLookupLoading(false)
      }
    }, 500)
  }, [])

  // Close create form on success
  useEffect(() => {
    if (createState?.success) {
      setCreateOpen(false)
      setMemberIdInput("")
      setAutoFill(null)
      router.refresh()
    }
  }, [createState])

  async function handleDelete(id: string) {
    if (!confirm("Hapus data ini?")) return
    await deleteBukuMember(id)
    router.refresh()
  }

  function resetFilters() {
    setFilterMemberId("")
    setFilterNama("")
    setFilterMitra("")
    setFilterTglMulai("")
    setFilterTglAkhir("")
  }

  function formatTanggal(date: Date | null | string) {
    if (!date) return "-"
    const d = new Date(date)
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  function formatRupiah(num: number | null) {
    if (num == null) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const hasActiveFilters = filterMemberId || filterNama || filterMitra || filterTglMulai || filterTglAkhir

  return (
    <div className="space-y-6">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {hasActiveFilters ? (
              <>Menampilkan {filteredItems.length} dari {items.length} catatan</>
            ) : (
              <>Total {items.length} catatan</>
            )}
          </p>
        </div>
        {!createOpen ? (
          <button
            onClick={() => setCreateOpen(true)}
            className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Catatan
          </button>
        ) : null}
      </div>

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Catatan Baru</h3>
            <button
              onClick={() => { setCreateOpen(false); setAutoFill(null); setMemberIdInput(""); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="relative">
                  <input
                    type="text"
                    name="memberId"
                    value={memberIdInput}
                    onChange={(e) => handleMemberIdChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                    placeholder="Ketik ID member..."
                  />
                  {autoFill && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Member <span className="text-red-500">*</span></label>
                <input
                  ref={namaRef}
                  type="text"
                  name="namaMember"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Nama lengkap member"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
                <input
                  ref={regionRef}
                  type="text"
                  name="region"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Terisi otomatis dari ID Member"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mitra <span className="text-red-500">*</span></label>
                <select
                  name="mitra"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                >
                  <option value="">-- Pilih Mitra --</option>
                  {partners.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  name="tanggal"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Bayar</label>
                <input
                  type="number"
                  name="jumlahBayar"
                  step="500"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Rp"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Diskon</label>
                <input
                  type="text"
                  name="diskon"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Mis: 5%, 10%, atau Rp50.000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
                <input
                  type="text"
                  name="keterangan"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>

            {createState?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {createState.error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createPending}
                className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                {createPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </button>
              <button
                type="button"
                onClick={() => { setCreateOpen(false); setAutoFill(null); setMemberIdInput(""); }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Filter</span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-700 ml-auto font-medium"
            >
              Reset filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <input
              type="text"
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              placeholder="Cari ID..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
            />
          </div>
          <div>
            <input
              type="text"
              value={filterNama}
              onChange={(e) => setFilterNama(e.target.value)}
              placeholder="Cari Nama..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
            />
          </div>
          <div>
            <select
              value={filterMitra}
              onChange={(e) => setFilterMitra(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs bg-white"
            >
              <option value="">Semua Mitra</option>
              {mitraOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              value={filterTglMulai}
              onChange={(e) => setFilterTglMulai(e.target.value)}
              placeholder="Dari tanggal"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
              title="Dari tanggal"
            />
          </div>
          <div>
            <input
              type="date"
              value={filterTglAkhir}
              onChange={(e) => setFilterTglAkhir(e.target.value)}
              placeholder="Sampai tanggal"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-xs"
              title="Sampai tanggal"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 mb-2">
            {hasActiveFilters ? "Tidak ada catatan yang cocok dengan filter" : "Belum ada catatan Buku Member"}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Reset filter
            </button>
          ) : (
            <button
              onClick={() => setCreateOpen(true)}
              className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Catatan Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Nama Member</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Region</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Mitra</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Tanggal</th>
                  <th className="text-right py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Jumlah Bayar</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden xl:table-cell">Diskon</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-gray-500">{item.memberId || "-"}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.namaMember}</td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {item.region ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.region}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.mitra}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-gray-500">
                      {formatTanggal(item.tanggal)}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-right font-medium">
                      {formatRupiah(item.jumlahBayar)}
                    </td>
                    <td className="py-3 px-4 hidden xl:table-cell">
                      {item.diskon ? (
                        <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
                          {item.diskon}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/buku-member/${item.id}/edit`}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
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
