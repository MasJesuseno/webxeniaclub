"use client"

import { useState, useEffect, useMemo, useActionState } from "react"
import { useRouter } from "next/navigation"
import { submitTransaksiMember, getTransaksiSaya } from "@/lib/actions"

interface Benefit {
  id: string
  name: string
  logo: string
  description: string | null
  website: string | null
  benefit: string | null
  locationLink: string | null
  region: string | null
}

interface MemberData {
  memberId: string
  namaLengkap: string
  region: string | null
}

export default function MemberBenefitPage() {
  const router = useRouter()
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [member, setMember] = useState<MemberData | null>(null)
  const [transaksiMitra, setTransaksiMitra] = useState<string | null>(null)
  const [transaksiOpen, setTransaksiOpen] = useState(false)
  const [transaksiState, transaksiAction, transaksiPending] = useActionState(submitTransaksiMember, null)
  const [bukuSayaOpen, setBukuSayaOpen] = useState(false)
  const [bukuSayaList, setBukuSayaList] = useState<any[]>([])
  const [bukuSayaLoading, setBukuSayaLoading] = useState(false)
  const [bukuFilterMitra, setBukuFilterMitra] = useState("")
  const [bukuFilterTglMulai, setBukuFilterTglMulai] = useState("")
  const [bukuFilterTglAkhir, setBukuFilterTglAkhir] = useState("")

  // Unique mitra from transactions for filter dropdown
  const bukuMitraOptions = useMemo(() => {
    const set = new Set<string>()
    bukuSayaList.forEach((i: any) => { if (i.mitra) set.add(i.mitra) })
    return Array.from(set).sort()
  }, [bukuSayaList])

  // Filtered transactions
  const bukuFilteredList = useMemo(() => {
    return bukuSayaList.filter((item: any) => {
      if (bukuFilterMitra && item.mitra !== bukuFilterMitra) return false
      if (bukuFilterTglMulai && item.tanggal) {
        if (new Date(item.tanggal) < new Date(bukuFilterTglMulai)) return false
      }
      if (bukuFilterTglAkhir && item.tanggal) {
        if (new Date(item.tanggal) > new Date(bukuFilterTglAkhir + "T23:59:59")) return false
      }
      return true
    })
  }, [bukuSayaList, bukuFilterMitra, bukuFilterTglMulai, bukuFilterTglAkhir])

  const bukuHasFilter = bukuFilterMitra || bukuFilterTglMulai || bukuFilterTglAkhir

  function resetBukuFilter() {
    setBukuFilterMitra("")
    setBukuFilterTglMulai("")
    setBukuFilterTglAkhir("")
  }

  // Load benefits & member data
  useEffect(() => {
    Promise.all([
      fetch("/api/member/benefits").then((res) => res.json()),
      fetch("/api/member/me").then((res) => res.json()),
    ])
      .then(([benefitsData, memberData]) => {
        setBenefits(benefitsData.benefits || [])
        if (memberData && memberData.memberId) {
          setMember({
            memberId: memberData.memberId,
            namaLengkap: memberData.namaLengkap,
            region: memberData.region,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Close modal on success
  useEffect(() => {
    if (transaksiState?.success) {
      setTransaksiOpen(false)
      setTransaksiMitra(null)
      router.refresh()
    }
  }, [transaksiState])

  // Extract unique regions, excluding null/empty, sorted alphabetically
  const regions = useMemo(() => {
    const regionSet = new Set<string>()
    benefits.forEach((b) => {
      if (b.region) regionSet.add(b.region)
    })
    return Array.from(regionSet).sort()
  }, [benefits])

  // Filter benefits by selected region
  const filteredBenefits = useMemo(() => {
    if (!selectedRegion) return benefits
    return benefits.filter((b) => b.region === selectedRegion)
  }, [benefits, selectedRegion])

  function openTransaksi(partnerName: string) {
    setTransaksiMitra(partnerName)
    setTransaksiOpen(true)
  }

  function closeTransaksi() {
    setTransaksiOpen(false)
    setTransaksiMitra(null)
  }

  async function openBukuSaya() {
    setBukuSayaOpen(true)
    setBukuSayaLoading(true)
    resetBukuFilter()
    try {
      const data = await getTransaksiSaya()
      setBukuSayaList(data)
    } catch {
      setBukuSayaList([])
    } finally {
      setBukuSayaLoading(false)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-red-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Memuat benefit...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Benefit Mitra</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Nikmati berbagai benefit dan diskon dari mitra kerjasama DXIC
          </p>
        </div>
        <button
          onClick={openBukuSaya}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-semibold hover:bg-indigo-700 transition-all shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Buku Saya
        </button>
      </div>

      {/* Region Filter */}
      {regions.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <select
              value={selectedRegion ?? ""}
              onChange={(e) => setSelectedRegion(e.target.value || null)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer"
            >
              <option value="">Semua Wilayah ({benefits.length})</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region} ({benefits.filter((b) => b.region === region).length})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {selectedRegion && (
            <button
              onClick={() => setSelectedRegion(null)}
              className="shrink-0 p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Reset filter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Results Info */}
      {selectedRegion && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Menampilkan {filteredBenefits.length} mitra di wilayah <span className="font-semibold text-indigo-700">{selectedRegion}</span>
          </p>
          <button
            onClick={() => setSelectedRegion(null)}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Reset filter
          </button>
        </div>
      )}

      {filteredBenefits.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 019.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <p className="text-sm text-gray-500">Belum ada benefit tersedia</p>
          {selectedRegion && (
            <button
              onClick={() => setSelectedRegion(null)}
              className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hapus filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBenefits.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full dxic-gradient flex items-center justify-center text-white font-bold text-lg">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                  {partner.region && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {partner.region}
                    </span>
                  )}
                  {partner.description && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                      {partner.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Benefit */}
              {partner.benefit && (
                <div className="mx-4 mb-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 019.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-green-700">Benefit</p>
                      <p className="text-sm text-green-800 mt-0.5">{partner.benefit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2">
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Buka
                  </a>
                )}
                {partner.locationLink && (
                  <a
                    href={partner.locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Lokasi
                  </a>
                )}
                <button
                  onClick={() => openTransaksi(partner.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Input Transaksi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Buku Saya */}
      {bukuSayaOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBukuSayaOpen(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg mx-auto p-5 shadow-xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Buku Saya
              </h3>
              <button
                onClick={() => setBukuSayaOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            {bukuSayaLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : bukuSayaList.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-sm text-gray-500">Belum ada transaksi</p>
                <p className="text-xs text-gray-400 mt-1">Transaksi yang kamu lakukan di mitra akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Filter inside modal */}
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  <select
                    value={bukuFilterMitra}
                    onChange={(e) => setBukuFilterMitra(e.target.value)}
                    className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                  >
                    <option value="">Semua Mitra</option>
                    {bukuMitraOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={bukuFilterTglMulai}
                    onChange={(e) => setBukuFilterTglMulai(e.target.value)}
                    className="flex-1 min-w-[100px] px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                    title="Dari tanggal"
                  />
                  <input
                    type="date"
                    value={bukuFilterTglAkhir}
                    onChange={(e) => setBukuFilterTglAkhir(e.target.value)}
                    className="flex-1 min-w-[100px] px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                    title="Sampai tanggal"
                  />
                  {bukuHasFilter && (
                    <button
                      onClick={resetBukuFilter}
                      className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Reset filter"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {/* Count */}
                <p className="text-xs text-gray-500">
                  {bukuHasFilter
                    ? `Menampilkan ${bukuFilteredList.length} dari ${bukuSayaList.length} transaksi`
                    : `Total ${bukuSayaList.length} transaksi`}
                </p>
                {/* List */}
                {bukuFilteredList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Tidak ada transaksi yang cocok</p>
                    {bukuHasFilter && (
                      <button
                        onClick={resetBukuFilter}
                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Reset filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bukuFilteredList.map((item: any) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-sm text-gray-900">{item.mitra}</span>
                          <span className="text-xs text-gray-500">{formatTanggal(item.tanggal)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Jumlah: </span>
                            <span className="font-medium text-gray-900">{formatRupiah(item.jumlahBayar)}</span>
                          </div>
                          {item.diskon && (
                            <div>
                              <span className="text-gray-500">Diskon: </span>
                              <span className="font-medium text-orange-700">{item.diskon}</span>
                            </div>
                          )}
                          {item.keterangan && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Ket: </span>
                              <span className="text-gray-700">{item.keterangan}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Input Transaksi */}
      {transaksiOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeTransaksi} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Input Transaksi</h3>
              <button
                onClick={closeTransaksi}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form action={transaksiAction} className="space-y-4">
              {/* Read-only member info */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">ID Member</label>
                  <p className="text-sm font-medium text-gray-900">{member?.memberId || "-"}</p>
                  <input type="hidden" name="memberId" value={member?.memberId || ""} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Nama</label>
                    <p className="text-sm font-medium text-gray-900">{member?.namaLengkap || "-"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Region</label>
                    <p className="text-sm font-medium text-gray-900">{member?.region || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Mitra (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mitra</label>
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700">
                  {transaksiMitra}
                </div>
                <input type="hidden" name="mitra" value={transaksiMitra || ""} />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  name="tanggal"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              {/* Jumlah Transaksi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Transaksi (Rp)</label>
                <input
                  type="number"
                  name="jumlahBayar"
                  step="500"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  placeholder="Masukkan nominal"
                />
              </div>

              {/* Diskon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Diskon</label>
                <input
                  type="text"
                  name="diskon"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  placeholder="Mis: 5%, 10%, atau Rp50.000"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
                <textarea
                  name="keterangan"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>

              {/* Success message */}
              {transaksiState?.success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Transaksi berhasil dicatat!
                </div>
              )}

              {/* Error message */}
              {transaksiState?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {transaksiState.error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeTransaksi}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={transaksiPending}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {transaksiPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Transaksi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
