"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { updateProspectiveMember, deleteProspectiveMember, importMembersData } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"
import { timeAgo } from "@/lib/utils"
import * as XLSX from "xlsx"

interface ProspectiveMember {
  id: string
  namaLengkap: string
  namaPanggilan: string | null
  jenisKelamin: string | null
  tempatLahir: string | null
  tanggalLahir: string
  alamatLengkap: string | null
  kotaKabupaten: string | null
  provinsi: string | null
  noWa: string
  golonganDarah: string | null
  jenisMobil: string
  tipeMobil: string
  tahunProduksi: number
  warna: string | null
  noPolisi: string
  email: string
  alasanBergabung: string | null
  ukuranKaos: string | null
  foto: string | null
  fotoSim: string | null
  fotoMobilDepan: string | null
  fotoMobilSamping: string | null
  fotoBuktiTransfer: string | null
  memberId: string | null
  region: string | null
  status: string
  statusMember: string | null
  masaBerlaku: string | null
  adminNote: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  isOnline: boolean
}

interface SiteProfile {
  clubName: string
  shortName: string
  logo: string | null
  favicon: string | null
}

const STATUS_OPTIONS = ["Diajukan", "Diterima", "Ditolak"]

const STATUS_STYLES: Record<string, string> = {
  Diajukan: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Diterima: "bg-green-100 text-green-800 border-green-200",
  Ditolak: "bg-red-100 text-red-800 border-red-200",
}

const MEMBER_STATUS_STYLES: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800 border-green-200",
  "Tidak Aktif": "bg-gray-100 text-gray-800 border-gray-200",
  "Black List": "bg-red-100 text-red-800 border-red-200",
}

const TEMPLATE_HEADERS = [
  "id",
  "namaLengkap",
  "namaPanggilan",
  "jenisKelamin",
  "tempatLahir",
  "tanggalLahir",
  "alamatLengkap",
  "kotaKabupaten",
  "provinsi",
  "noWa",
  "golonganDarah",
  "jenisMobil",
  "tipeMobil",
  "tahunProduksi",
  "warna",
  "noPolisi",
  "email",
  "alasanBergabung",
  "ukuranKaos",
  "region",
  "statusMember",
  "masaBerlaku",
]

export function MemberManager({ members, siteProfile }: { members: ProspectiveMember[]; siteProfile: SiteProfile }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [editFoto, setEditFoto] = useState("")
  const [editFotoSim, setEditFotoSim] = useState("")
  const [editFotoDepan, setEditFotoDepan] = useState("")
  const [editFotoSamping, setEditFotoSamping] = useState("")
  const [editFotoBukti, setEditFotoBukti] = useState("")

  // Pagination
  const PAGE_SIZE = 8
  const [currentPage, setCurrentPage] = useState(1)

  // Filters
  const [filterId, setFilterId] = useState("")
  const [filterNama, setFilterNama] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterKota, setFilterKota] = useState("")
  const [filterProvinsi, setFilterProvinsi] = useState("")
  const [filterRegion, setFilterRegion] = useState("")
  const [filterLogin, setFilterLogin] = useState("")

  // Import state
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)

  // Helper: reset ke halaman 1 saat filter berubah
  const setFilter = (setter: (v: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  // Unique values for dropdown filters
  const uniqueProvinsi = useMemo(() => {
    const set = new Set<string>()
    members.forEach(m => { if (m.provinsi) set.add(m.provinsi) })
    return Array.from(set).sort()
  }, [members])

  const uniqueRegion = useMemo(() => {
    const set = new Set<string>()
    members.forEach(m => { if (m.region) set.add(m.region) })
    return Array.from(set).sort()
  }, [members])

  async function handleUpdate() {
    if (!editingId || !editData) return
    const form = new FormData()
    for (const [key, val] of Object.entries(editData)) {
      if (val !== null && val !== undefined) form.set(key, String(val))
    }
    form.set("foto", editFoto)
    form.set("fotoSim", editFotoSim)
    form.set("fotoMobilDepan", editFotoDepan)
    form.set("fotoMobilSamping", editFotoSamping)
    form.set("fotoBuktiTransfer", editFotoBukti)
    const password = passwordRef.current?.value
    if (password) form.set("password", password)
    const res = await updateProspectiveMember(editingId, form)
    if (res?.error) alert(res.error)
    setEditingId(null)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus data member ini?")) return
    await deleteProspectiveMember(id)
    router.refresh()
  }

  // ---- FILTER ----
  const filtered = members.filter((m) => {
    if (filterStatus && m.status !== filterStatus) return false
    if (filterId) {
      const q = filterId.toLowerCase()
      if (!(m.memberId || "").toLowerCase().includes(q)) return false
    }
    if (filterNama) {
      const q = filterNama.toLowerCase()
      if (!m.namaLengkap.toLowerCase().includes(q) && !(m.namaPanggilan || "").toLowerCase().includes(q)) return false
    }
    if (filterKota) {
      const q = filterKota.toLowerCase()
      if (!(m.kotaKabupaten || "").toLowerCase().includes(q)) return false
    }
    if (filterProvinsi) {
      if (m.provinsi !== filterProvinsi) return false
    }
    if (filterRegion) {
      if (m.region !== filterRegion) return false
    }
    if (filterLogin === "sudah" && !m.lastLoginAt) return false
    if (filterLogin === "belum" && m.lastLoginAt) return false
    return true
  })

  // ---- PAGINATION ----
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  const paginatedMembers = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  // ---- EXPORT EXCEL ----
  function handleExport() {
    const data = filtered.map((m) => ({
      "ID Member": m.memberId || "",
      Nama: m.namaLengkap,
      "Nama Panggilan": m.namaPanggilan || "",
      "Jenis Kelamin": m.jenisKelamin || "",
      "No. WhatsApp": m.noWa,
      Email: m.email,
      "Tempat Lahir": m.tempatLahir || "",
      "Tanggal Lahir": m.tanggalLahir ? new Date(m.tanggalLahir).toLocaleDateString("id-ID") : "",
      "Alamat Lengkap": m.alamatLengkap || "",
      Kota: m.kotaKabupaten || "",
      Provinsi: m.provinsi || "",
      Region: m.region || "",
      "Gol. Darah": m.golonganDarah || "",
      "Jenis Mobil": m.jenisMobil,
      "Tipe Mobil": m.tipeMobil,
      "Tahun Produksi": m.tahunProduksi || "",
      Warna: m.warna || "",
      "No. Polisi": m.noPolisi,
      "Alasan Bergabung": m.alasanBergabung || "",
      "Ukuran Kaos": m.ukuranKaos || "",
      Status: m.status,
      "Status Member": m.statusMember || "",
      "Masa Berlaku": m.masaBerlaku ? new Date(m.masaBerlaku).toLocaleDateString("id-ID") : "",
      "Catatan Admin": m.adminNote || "",
      "Tgl Daftar": new Date(m.createdAt).toLocaleDateString("id-ID"),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Data Member")

    // Set column widths
    ws["!cols"] = [
      { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 15 },
      { wch: 15 }, { wch: 28 }, { wch: 15 }, { wch: 14 },
      { wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 15 },
      { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 14 },
      { wch: 12 }, { wch: 14 }, { wch: 30 }, { wch: 12 },
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 20 },
      { wch: 14 },
    ]

    XLSX.writeFile(wb, `Data_Member_DXIC_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  // ---- DOWNLOAD TEMPLATE ----
  function handleDownloadTemplate() {
    const headerRow: Record<string, string> = {}
    for (const h of TEMPLATE_HEADERS) {
      headerRow[h] = ""
    }
    // Add example row
    const exampleRow: Record<string, string> = {
      id: "Contoh: DXIC-001",
      namaLengkap: "Contoh: Andi Pratama",
      namaPanggilan: "Contoh: Andi",
      jenisKelamin: "Laki-laki",
      tempatLahir: "Contoh: Jakarta",
      tanggalLahir: "Contoh: 1990-01-15",
      alamatLengkap: "Contoh: Jl. Merdeka No. 123",
      kotaKabupaten: "Contoh: Jakarta Pusat",
      provinsi: "Contoh: DKI Jakarta",
      noWa: "Contoh: 08123456789",
      golonganDarah: "O",
      jenisMobil: "Xenia",
      tipeMobil: "Xenia 1.3 Deluxe",
      tahunProduksi: "2015",
      warna: "Hitam",
      noPolisi: "B 1234 XYZ",
      email: "andi@example.com",
      alasanBergabung: "Ingin bergabung komunitas Xenia",
      ukuranKaos: "L",
      region: "Jabodetabek",
      statusMember: "Aktif",
      masaBerlaku: "2027-12-31",
    }

    const ws = XLSX.utils.json_to_sheet([headerRow, exampleRow])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template")

    ws["!cols"] = [
      { wch: 14 }, { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
      { wch: 14 }, { wch: 35 }, { wch: 18 }, { wch: 18 },
      { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 22 },
      { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 30 },
      { wch: 30 }, { wch: 12 }, { wch: 18 }, { wch: 14 },
      { wch: 14 },
    ]

    XLSX.writeFile(wb, "Template_Import_Member_DXIC.xlsx")
  }

  // ---- IMPORT EXCEL ----
  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet) as any[]

      // Map headers to field names (handle both English and Indonesian headers)
      const mapped = jsonData.map((row: any) => {
        const keys = Object.keys(row)
        const getVal = (alternatives: string[]) => {
          for (const k of keys) {
            const kLower = k.toLowerCase().replace(/[\s\-_]/g, "")
            for (const alt of alternatives) {
              if (kLower === alt.toLowerCase().replace(/[\s\-_]/g, "")) return row[k]
            }
          }
          return ""
        }

        return {
          id: getVal(["id", "ID", "IDMember", "idMember", "memberId", "member id", "member_id"]),
          namaLengkap: getVal(["namaLengkap", "nama", "nama lengkap", "name", "fullname"]),
          namaPanggilan: getVal(["namaPanggilan", "nama panggilan", "nickname"]),
          jenisKelamin: getVal(["jenisKelamin", "jenis kelamin", "gender", "jeniskelamin"]),
          tempatLahir: getVal(["tempatLahir", "tempat lahir", "birthplace", "placeofbirth"]),
          tanggalLahir: getVal(["tanggalLahir", "tanggal lahir", "birthdate", "dateofbirth"]),
          alamatLengkap: getVal(["alamatLengkap", "alamat", "address", "fulladdress"]),
          kotaKabupaten: getVal(["kotaKabupaten", "kota", "kabupaten", "city", "kota/kabupaten"]),
          provinsi: getVal(["provinsi", "province"]),
          noWa: getVal(["noWa", "nowa", "no wa", "no_wa", "wa", "whatsapp", "phone", "telepon"]),
          golonganDarah: getVal(["golonganDarah", "golongan darah", "goldarah", "bloodtype", "blood"]),
          jenisMobil: getVal(["jenisMobil", "jenis mobil", "jenismobil", "cartype", "vehicle"]),
          tipeMobil: getVal(["tipeMobil", "tipe mobil", "tipemobil", "model", "carmodel"]),
          tahunProduksi: getVal(["tahunProduksi", "tahun produksi", "tahun", "year", "manufactureyear"]),
          warna: getVal(["warna", "color", "colour"]),
          noPolisi: getVal(["noPolisi", "nopolisi", "no polisi", "nopol", "licenseplate", "plat"]),
          email: getVal(["email", "e-mail"]),
          alasanBergabung: getVal(["alasanBergabung", "alasan bergabung", "alasan", "reason"]),
          ukuranKaos: getVal(["ukuranKaos", "ukuran kaos", "kaos", "shirtsize", "size"]),
          region: getVal(["region", "wilayah", "daerah", "area"]),
          status: getVal(["status", "status"]),
          statusMember: getVal(["statusMember", "status member", "statusmember", "memberstatus"]),
          masaBerlaku: getVal(["masaBerlaku", "masa berlaku", "masaberlaku", "expirydate", "validuntil", "tanggalberakhir"]),
        }
      })

      const result = await importMembersData(mapped)
      if (result?.error) {
        alert(result.error)
      } else if (result) {
        setImportResult({ imported: result.imported || 0, skipped: result.skipped || 0, errors: result.errors || [] })
        router.refresh()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      alert("Gagal membaca file: " + message)
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar: Filters + Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        {/* Export/Import/Template Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Template
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {importing ? "Mengimpor..." : "Import Excel"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportFile}
            className="hidden"
          />

          {/* Import result */}
          {importResult && (
            <div className="space-y-2">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${importResult.imported > 0 ? "bg-green-50 border border-green-200 text-green-700" : "bg-yellow-50 border border-yellow-200 text-yellow-700"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {importResult.imported} diimpor, {importResult.skipped} dilewati
                <button onClick={() => setImportResult(null)} className="ml-2 text-green-500 hover:text-green-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 space-y-1">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ID Member</label>
            <input
              type="text"
              placeholder="Filter ID..."
              value={filterId}
              onChange={(e) => setFilter(setFilterId, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nama</label>
            <input
              type="text"
              placeholder="Cari nama..."
              value={filterNama}
              onChange={(e) => setFilter(setFilterNama, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilter(setFilterStatus, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
            >
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kota</label>
            <input
              type="text"
              placeholder="Cari kota..."
              value={filterKota}
              onChange={(e) => setFilter(setFilterKota, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Provinsi</label>
            <select
              value={filterProvinsi}
              onChange={(e) => setFilter(setFilterProvinsi, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
            >
              <option value="">Semua Provinsi</option>
              {uniqueProvinsi.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Region</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilter(setFilterRegion, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
            >
              <option value="">Semua Region</option>
              {uniqueRegion.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status Login</label>
            <select
              value={filterLogin}
              onChange={(e) => setFilter(setFilterLogin, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
            >
              <option value="">Semua</option>
              <option value="sudah">Sudah Pernah Login</option>
              <option value="belum">Belum Pernah Login</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-yellow-600">{members.filter(m => m.status === "Diajukan").length}</div>
          <div className="text-xs text-gray-500 mt-1">Diajukan</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-600">{members.filter(m => m.status === "Diterima").length}</div>
          <div className="text-xs text-gray-500 mt-1">Diterima</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-red-600">{members.filter(m => m.status === "Ditolak").length}</div>
          <div className="text-xs text-gray-500 mt-1">Ditolak</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">ID Member</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Jenis Kelamin</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">No. WA</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Mobil</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">No. Polisi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Kota</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Region</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Status Member</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Terakhir Login</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Masa Berlaku</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Tgl Daftar</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-500">{m.memberId || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{m.namaLengkap}</div>
                    {m.namaPanggilan && <div className="text-xs text-gray-500">{m.namaPanggilan}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{m.jenisKelamin || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`https://wa.me/${m.noWa.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 font-medium">
                      {m.noWa}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{m.jenisMobil}</div>
                    <div className="text-xs text-gray-500">{m.tipeMobil} ({m.tahunProduksi})</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm uppercase">{m.noPolisi}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{m.kotaKabupaten || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{m.region || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[m.status] || STATUS_STYLES.Diajukan}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${MEMBER_STATUS_STYLES[m.statusMember || ""] || "bg-gray-50 text-gray-400 border-gray-200"}`}>
                      {m.statusMember || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {m.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <span className="relative flex w-2 h-2">
                          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                        </span>
                        Online
                      </span>
                    ) : m.lastLoginAt ? (
                      <div className="text-xs">
                        <div className="text-gray-700 font-medium">{timeAgo(m.lastLoginAt)}</div>
                        <div className="text-gray-400">{new Date(m.lastLoginAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">Belum pernah</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {m.masaBerlaku ? new Date(m.masaBerlaku).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(m.id)
                          setEditData({ ...m })
                          setEditFoto(m.foto || "")
                          setEditFotoSim(m.fotoSim || "")
                          setEditFotoDepan(m.fotoMobilDepan || "")
                          setEditFotoSamping(m.fotoMobilSamping || "")
                          setEditFotoBukti(m.fotoBuktiTransfer || "")
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
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
              {paginatedMembers.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-4 py-16 text-center text-gray-500">
                    {members.length === 0 ? "Belum ada data member terdaftar" : "Tidak ada hasil yang cocok"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Menampilkan {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(safePage - 1)}
                disabled={safePage <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Sebelumnya"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
                    page === safePage
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Selanjutnya"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && editData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setEditingId(null); setEditData(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Data Member</h3>
              <button onClick={() => { setEditingId(null); setEditData(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ID Member, Region, Status, Status Member, Masa Berlaku, Password - Admin Only */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ID Member <span className="text-xs text-red-500">*(hanya admin)</span>
                </label>
                <input
                  type="text"
                  value={editData.memberId || ""}
                  onChange={(e) => setEditData({ ...editData, memberId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono"
                  placeholder="Contoh: DXIC-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Region <span className="text-xs text-red-500">*(hanya admin)</span>
                </label>
                <input
                  type="text"
                  value={editData.region || ""}
                  onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Contoh: Jabodetabek, Jawa Timur..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status Member <span className="text-xs text-red-500">*(hanya admin)</span>
                </label>
                <select
                  value={editData.statusMember || ""}
                  onChange={(e) => setEditData({ ...editData, statusMember: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                >
                  <option value="">—</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                  <option value="Black List">Black List</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Masa Berlaku <span className="text-xs text-red-500">*(hanya admin)</span>
                </label>
                <input
                  type="date"
                  value={editData.masaBerlaku ? editData.masaBerlaku.substring(0, 10) : ""}
                  onChange={(e) => setEditData({ ...editData, masaBerlaku: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-xs text-red-500">*(hanya admin)</span>
                </label>
                <input
                  ref={passwordRef}
                  type="password"
                  name="password"
                  placeholder="Kosongkan jika tidak diubah"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">Isi hanya jika ingin mengganti password member</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Admin</label>
                <input
                  type="text"
                  value={editData.adminNote || ""}
                  onChange={(e) => setEditData({ ...editData, adminNote: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Catatan internal..."
                />
              </div>
            </div>

            {/* Personal Data */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Data Pribadi</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input type="text" value={editData.namaLengkap} onChange={(e) => setEditData({ ...editData, namaLengkap: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Panggilan</label>
                  <input type="text" value={editData.namaPanggilan || ""} onChange={(e) => setEditData({ ...editData, namaPanggilan: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin</label>
                  <select value={editData.jenisKelamin || ""} onChange={(e) => setEditData({ ...editData, jenisKelamin: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white">
                    <option value="">—</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tempat Lahir</label>
                  <input type="text" value={editData.tempatLahir || ""} onChange={(e) => setEditData({ ...editData, tempatLahir: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Lahir</label>
                  <input type="date" value={editData.tanggalLahir ? editData.tanggalLahir.substring(0, 10) : ""} onChange={(e) => setEditData({ ...editData, tanggalLahir: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">No. WhatsApp</label>
                  <input type="text" value={editData.noWa} onChange={(e) => setEditData({ ...editData, noWa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gol. Darah</label>
                  <select value={editData.golonganDarah || ""} onChange={(e) => setEditData({ ...editData, golonganDarah: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white">
                    <option value="">—</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ukuran Kaos</label>
                  <select value={editData.ukuranKaos || ""} onChange={(e) => setEditData({ ...editData, ukuranKaos: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white">
                    <option value="">—</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Alamat</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap</label>
                  <textarea value={editData.alamatLengkap || ""} onChange={(e) => setEditData({ ...editData, alamatLengkap: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kota/Kabupaten</label>
                  <input type="text" value={editData.kotaKabupaten || ""} onChange={(e) => setEditData({ ...editData, kotaKabupaten: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi</label>
                  <input type="text" value={editData.provinsi || ""} onChange={(e) => setEditData({ ...editData, provinsi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
              </div>
            </div>

            {/* Car Data */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Data Mobil</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Mobil</label>
                  <select value={editData.jenisMobil} onChange={(e) => setEditData({ ...editData, jenisMobil: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white">
                    <option value="Xenia">Xenia</option>
                    <option value="Non Xenia">Non Xenia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Mobil</label>
                  <input type="text" value={editData.tipeMobil} onChange={(e) => setEditData({ ...editData, tipeMobil: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun Produksi</label>
                  <input type="number" value={editData.tahunProduksi} onChange={(e) => setEditData({ ...editData, tahunProduksi: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna</label>
                  <input type="text" value={editData.warna || ""} onChange={(e) => setEditData({ ...editData, warna: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Polisi</label>
                  <input type="text" value={editData.noPolisi} onChange={(e) => setEditData({ ...editData, noPolisi: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm uppercase" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alasan Bergabung</label>
                  <textarea value={editData.alasanBergabung || ""} onChange={(e) => setEditData({ ...editData, alasanBergabung: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
                </div>
              </div>
            </div>

            {/* Uploads */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Upload Dokumen</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUpload value={editFoto} onChange={setEditFoto} label="Foto Diri" />
                <ImageUpload value={editFotoSim} onChange={setEditFotoSim} label="Upload SIM" />
                <ImageUpload value={editFotoDepan} onChange={setEditFotoDepan} label="Foto Mobil Depan" />
                <ImageUpload value={editFotoSamping} onChange={setEditFotoSamping} label="Foto Mobil Samping" />
                <div className="sm:col-span-2">
                  <ImageUpload value={editFotoBukti} onChange={setEditFotoBukti} label="Bukti Transfer" hint="Bukti transfer biaya pendaftaran (Rp 285.000,-)" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={handleUpdate} className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                Simpan Perubahan
              </button>
              <button onClick={() => { setEditingId(null); setEditData(null); }} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
