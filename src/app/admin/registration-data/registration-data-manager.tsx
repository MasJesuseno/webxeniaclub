"use client"

import { useState, useActionState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { createRegistrationData, updateRegistrationData, deleteRegistrationData, bulkCreateTagihan } from "@/lib/actions"
import { ImageUpload } from "@/components/image-upload"
import { MemberCard } from "@/components/member-card"

interface RegistrationDataItem {
  id: string
  registrationPeriodId: string
  biaya: number | null
  memberId: string | null
  namaMember: string
  tanggalTagihan: string | null
  tanggalBayar: string | null
  fotoBukti: string | null
  status: string
  createdAt: string
  registrationPeriod: { period: string; regisLang: string }
}

interface RegistrationPeriod {
  id: string
  period: string
  biaya: number | null
  tanggalBerlaku: string | null
  batasAkhir: string | null
}

interface Member {
  id: string
  memberId: string | null
  namaLengkap: string
  namaPanggilan: string | null
  foto: string | null
  masaBerlaku: string | null
  region: string | null
}

interface SiteProfile {
  clubName: string
  shortName: string
  slogan: string | null
  logo: string | null
  favicon: string | null
  cardTemplateFront: string | null
  cardTemplateBack: string | null
}

const STATUS_OPTIONS = ["Belum", "Menunggu Verifikasi", "Lunas"]

const STATUS_BADGE: Record<string, string> = {
  "Belum": "bg-gray-100 text-gray-600",
  "Menunggu Verifikasi": "bg-amber-100 text-amber-700",
  "Lunas": "bg-emerald-100 text-emerald-700",
}

const STATUS_DOT: Record<string, string> = {
  "Belum": "bg-gray-400",
  "Menunggu Verifikasi": "bg-amber-500",
  "Lunas": "bg-emerald-500",
}


export function RegistrationDataManager({
  data,
  periods,
  members,
  siteProfile,
}: {
  data: RegistrationDataItem[]
  periods: RegistrationPeriod[]
  members: Member[]
  siteProfile: SiteProfile
}) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [createFotoBukti, setCreateFotoBukti] = useState("")
  const [editFotoBukti, setEditFotoBukti] = useState("")

  // Auto-fill state (create)
  const [selectedPeriodId, setSelectedPeriodId] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState("")

  // Auto-fill state (edit)
  const [editSelectedPeriodId, setEditSelectedPeriodId] = useState("")
  const [editSelectedMemberId, setEditSelectedMemberId] = useState("")

  // Filters
  const [filterPeriod, setFilterPeriod] = useState("")
  const [filterMemberId, setFilterMemberId] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterRegion, setFilterRegion] = useState("")

  const [createState, createAction, createPending] = useActionState(createRegistrationData, null)
  const [updatePending, setUpdatePending] = useState(false)

  // Bulk tagihan masal
  const [bulkPeriodId, setBulkPeriodId] = useState("")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null)

  async function handleBulkCreate() {
    if (!bulkPeriodId) return
    const period = periods.find((p) => p.id === bulkPeriodId)
    if (!confirm(`Apakah Anda akan melanjutkan proses membuat Tagihan Masal untuk periode "${period?.period}"?`)) return

    setBulkLoading(true)
    setBulkResult(null)
    const res = await bulkCreateTagihan(bulkPeriodId)
    if (res?.error) {
      alert(res.error)
    } else if (res) {
      setBulkResult({ created: res.created || 0, skipped: res.skipped || 0, errors: res.errors || [] })
      router.refresh()
    }
    setBulkLoading(false)
  }

  // Card preview & download modal
  const [cardModalState, setCardModalState] = useState<{
    memberId: string
    registrationPeriodId: string
    actionType: "download" | "view"
  } | null>(null)
  const [cardTab, setCardTab] = useState<"both" | "front" | "back">("both")
  const [downloadingSide, setDownloadingSide] = useState<"front" | "back" | "both" | "merged" | null>(null)

  const frontCardRef = useRef<HTMLDivElement>(null)
  const backCardRef = useRef<HTMLDivElement>(null)

  // Bukti transfer preview modal
  const [proofModalState, setProofModalState] = useState<{ memberId: string; namaMember: string; fotoBukti: string } | null>(null)

  // Determine base URL for QR code
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://xeniaclub.or.id"


  // Region lookup: map memberId/id → region from the member list
  const memberRegionMap = useMemo(() => {
    const map = new Map<string, string | null>()
    for (const m of members) {
      if (m.memberId) map.set(m.memberId, m.region || null)
      map.set(m.id, m.region || null)
    }
    return map
  }, [members])

  const getRegionByItem = (item: RegistrationDataItem): string | null => {
    if (!item.memberId) return null
    return memberRegionMap.get(item.memberId) || null
  }

  // Fallback site profile in case it is null
  const effectiveSiteProfile = useMemo(() => {
    return siteProfile || {
      clubName: "Xenia Club Indonesia",
      shortName: "DXIC",
      slogan: "Xenia Menyatukan Kita",
      logo: null,
      favicon: null,
      cardTemplateFront: null,
      cardTemplateBack: null,
    }
  }, [siteProfile])

  // Find full member data for card modal with robust fallback
  const cardMember = useMemo(() => {
    if (!cardModalState) return null
    const targetId = (cardModalState.memberId || "").trim().toLowerCase()
    const found = members.find((m) => {
      const mid = (m.memberId || "").trim().toLowerCase()
      const id = (m.id || "").trim().toLowerCase()
      return (mid && mid === targetId) || (id && id === targetId)
    })
    if (found) return found

    // Fallback if not found in prospectiveMember table: construct basic member object from registration data
    const regItem = data.find((d) => (d.memberId || "").trim().toLowerCase() === targetId)
    return {
      id: cardModalState.memberId || "member",
      memberId: cardModalState.memberId || null,
      namaLengkap: regItem?.namaMember || cardModalState.memberId || "Member",
      namaPanggilan: null,
      foto: null,
      masaBerlaku: null,
      region: regItem ? getRegionByItem(regItem) : null,
    }
  }, [cardModalState, members, data, memberRegionMap])

  // Find registration period for card modal
  const cardPeriod = cardModalState
    ? periods.find((p) => p.id === cardModalState.registrationPeriodId) ?? null
    : null

  // Find registration item for card modal
  const cardRegItem = cardModalState
    ? data.find((d) => d.memberId === cardModalState.memberId && d.registrationPeriodId === cardModalState.registrationPeriodId) ?? null
    : null

  // Get masa berlaku from member or fallback to period
  const cardMasaBerlaku = cardModalState
    ? (() => {
        if (cardMember?.masaBerlaku) return cardMember.masaBerlaku
        return cardPeriod?.batasAkhir || cardPeriod?.tanggalBerlaku || null
      })()
    : null

  function handleViewCard(memberId: string, registrationPeriodId: string) {
    setCardTab("both")
    setCardModalState({ memberId, registrationPeriodId, actionType: "view" })
  }

  function handleDownloadCard(memberId: string, registrationPeriodId: string) {
    setCardTab("both")
    setCardModalState({ memberId, registrationPeriodId, actionType: "download" })
  }

  async function captureCardCanvas(side: "front" | "back"): Promise<HTMLCanvasElement | null> {
    const container = side === "front" ? frontCardRef.current : backCardRef.current
    if (!container) return null

    const target = (container.querySelector(".member-card") as HTMLElement) || container

    try {
      const html2canvas = (await import("html2canvas")).default
      // Target: 300 DPI at 53.98mm width (credit card size)
      const targetWidthPx = Math.round((53.98 / 25.4) * 300)
      const scale = targetWidthPx / 320

      const canvas = await html2canvas(target, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        width: 320,
        height: 507,
      })
      return canvas
    } catch (err) {
      console.error(`Capture ${side} card error:`, err)
      return null
    }
  }

  async function handleDownloadFront() {
    if (!cardMember) return
    setDownloadingSide("front")
    try {
      const canvas = await captureCardCanvas("front")
      if (canvas) {
        const link = document.createElement("a")
        link.download = `Kartu_Member_${cardMember.memberId || "DXIC"}_Depan.png`
        link.href = canvas.toDataURL("image/png")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } finally {
      setDownloadingSide(null)
    }
  }

  async function handleDownloadBack() {
    if (!cardMember) return
    setDownloadingSide("back")
    try {
      const canvas = await captureCardCanvas("back")
      if (canvas) {
        const link = document.createElement("a")
        link.download = `Kartu_Member_${cardMember.memberId || "DXIC"}_Belakang.png`
        link.href = canvas.toDataURL("image/png")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } finally {
      setDownloadingSide(null)
    }
  }

  // 1 Single PNG containing BOTH Front and Back side-by-side (Never blocked by browser!)
  async function handleDownloadMerged() {
    if (!cardMember) return
    setDownloadingSide("merged")
    const prevTab = cardTab
    if (prevTab !== "both") {
      setCardTab("both")
      await new Promise((r) => setTimeout(r, 200))
    }

    try {
      const [frontCanvas, backCanvas] = await Promise.all([
        captureCardCanvas("front"),
        captureCardCanvas("back"),
      ])

      if (!frontCanvas || !backCanvas) {
        alert("Gagal merender kartu. Silakan coba kembali.")
        return
      }

      const gap = 30
      const mergedCanvas = document.createElement("canvas")
      mergedCanvas.width = frontCanvas.width + backCanvas.width + gap
      mergedCanvas.height = Math.max(frontCanvas.height, backCanvas.height)

      const ctx = mergedCanvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(frontCanvas, 0, 0)
        ctx.drawImage(backCanvas, frontCanvas.width + gap, 0)

        const link = document.createElement("a")
        link.download = `Kartu_Member_${cardMember.memberId || "DXIC"}_Lengkap_Depan_Belakang.png`
        link.href = mergedCanvas.toDataURL("image/png")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error("Merged download error:", err)
    } finally {
      if (prevTab !== "both") setCardTab(prevTab)
      setDownloadingSide(null)
    }
  }

  // Download both as 2 separate PNG files
  async function handleDownloadBothSeparately() {
    if (!cardMember) return
    setDownloadingSide("both")
    const prevTab = cardTab
    if (prevTab !== "both") {
      setCardTab("both")
      await new Promise((r) => setTimeout(r, 200))
    }

    try {
      const frontCanvas = await captureCardCanvas("front")
      if (frontCanvas) {
        const link1 = document.createElement("a")
        link1.download = `Kartu_Member_${cardMember.memberId || "DXIC"}_Depan.png`
        link1.href = frontCanvas.toDataURL("image/png")
        document.body.appendChild(link1)
        link1.click()
        document.body.removeChild(link1)
      }

      await new Promise((r) => setTimeout(r, 600))

      const backCanvas = await captureCardCanvas("back")
      if (backCanvas) {
        const link2 = document.createElement("a")
        link2.download = `Kartu_Member_${cardMember.memberId || "DXIC"}_Belakang.png`
        link2.href = backCanvas.toDataURL("image/png")
        document.body.appendChild(link2)
        link2.click()
        document.body.removeChild(link2)
      }
    } catch (err) {
      console.error("Separate download error:", err)
    } finally {
      if (prevTab !== "both") setCardTab(prevTab)
      setDownloadingSide(null)
    }
  }

  // Compute auto-filled biaya from selected period
  const getBiayaByPeriod = (periodId: string) => {
    const p = periods.find((p) => p.id === periodId)
    return p?.biaya ?? null
  }

  // Compute auto-filled nama from selected member
  const getNamaByMember = (memberId: string) => {
    const m = members.find((m) => m.memberId === memberId || m.id === memberId)
    return m?.namaLengkap ?? ""
  }


  // Unique region list for the filter dropdown
  const regionOptions = useMemo(() => {
    const set = new Set<string>()
    for (const m of members) {
      if (m.region && m.region.trim()) set.add(m.region.trim())
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "id"))
  }, [members])

  // Filter data
  const filteredData = useMemo(() => {
    let result = data
    if (filterPeriod) {
      result = result.filter((d) => d.registrationPeriodId === filterPeriod)
    }
    if (filterMemberId.trim()) {
      const q = filterMemberId.toLowerCase()
      result = result.filter(
        (d) =>
          (d.memberId || "").toLowerCase().includes(q) ||
          d.namaMember.toLowerCase().includes(q)
      )
    }
    if (filterRegion) {
      result = result.filter((d) => getRegionByItem(d) === filterRegion)
    }
    if (filterStatus) {
      result = result.filter((d) => d.status === filterStatus)
    }
    return result
  }, [data, filterPeriod, filterMemberId, filterRegion, filterStatus, memberRegionMap])

  // Status summary for the currently filtered set (e.g. per region)
  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of filteredData) {
      counts[d.status] = (counts[d.status] || 0) + 1
    }
    return counts
  }, [filteredData])

  // Close create form on success
  useEffect(() => {
    if (createState?.success) {
      setCreateOpen(false)
      setCreateFotoBukti("")
      setSelectedPeriodId("")
      setSelectedMemberId("")
      router.refresh()
    }
  }, [createState])

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    if (!editingId) return
    e.preventDefault()
    setUpdatePending(true)
    const form = new FormData(e.currentTarget)
    const res = await updateRegistrationData(editingId, form)
    if (res?.error) {
      alert(res.error)
    }
    setEditingId(null)
    setEditFotoBukti("")
    setUpdatePending(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus data register ini?")) return
    await deleteRegistrationData(id)
    router.refresh()
  }

  function formatDate(date: string | null) {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function formatCurrency(val: number | null) {
    if (val === null || val === undefined) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  function getInputDateValue(date: string | null) {
    if (!date) return ""
    return new Date(date).toISOString().split("T")[0]
  }

  const editItem = editingId ? data.find((d) => d.id === editingId) : null

  return (
    <div className="space-y-6">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-gray-500">Total {data.length} data register</p>

          {/* Filter Periode */}
          <div className="relative">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white min-w-[180px]"
            >
              <option value="">Semua Periode</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.period}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white min-w-[140px]"
            >
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Region */}
          <div className="relative">
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white min-w-[140px]"
            >
              <option value="">Semua Region</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Filter ID Member */}
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              placeholder="Cari ID/Nama Member..."
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm w-56"
            />
          </div>
        </div>

        {!createOpen && !editingId ? (
          <button
            onClick={() => setCreateOpen(true)}
            className="dxic-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Data Register
          </button>
        ) : null}
      </div>

      {/* Buat Tagihan Masal */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900">Buat Tagihan Masal</h3>
            <select
              value={bulkPeriodId}
              onChange={(e) => setBulkPeriodId(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white min-w-[220px]"
            >
              <option value="">Pilih Periode...</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.period}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkCreate}
              disabled={!bulkPeriodId || bulkLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Buat Tagihan Masal
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bulk Result */}
        {bulkResult && (
          <div className="mt-4 space-y-2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
              bulkResult.created > 0
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-yellow-50 border border-yellow-200 text-yellow-700"
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{bulkResult.created} tagihan berhasil dibuat</span>
              {bulkResult.skipped > 0 && (
                <span>, {bulkResult.skipped} sudah ada (dilewati)</span>
              )}
              <button onClick={() => setBulkResult(null)} className="ml-2 hover:opacity-70">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {bulkResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 space-y-1">
                {bulkResult.errors.map((err, i) => (
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

      {/* Create Form */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Data Register Baru</h3>
            <button
              onClick={() => {
                setCreateOpen(false)
                setCreateFotoBukti("")
                setSelectedPeriodId("")
                setSelectedMemberId("")
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Periode Register */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Periode Register</label>
                <select
                  name="registrationPeriodId"
                  required
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                >
                  <option value="">Pilih Periode...</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.period}
                    </option>
                  ))}
                </select>
              </div>
              {/* Biaya (auto-fill) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Biaya (Rp)</label>
                <input
                  type="number"
                  name="biaya"
                  value={getBiayaByPeriod(selectedPeriodId) ?? ""}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 cursor-not-allowed"
                  placeholder="Otomatis dari periode"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID Member */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                >
                  <option value="">Pilih Member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.memberId || m.id}>
                      {m.memberId || m.id} — {m.namaLengkap}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="memberId" value={selectedMemberId} />
              </div>
              {/* Nama Member (auto-fill) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Member</label>
                <input
                  type="text"
                  name="namaMember"
                  value={getNamaByMember(selectedMemberId)}
                  readOnly
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 cursor-not-allowed"
                  placeholder="Otomatis dari member"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Tagihan</label>
                <input
                  type="date"
                  name="tanggalTagihan"
                  defaultValue="2026-08-31"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Bayar</label>
                <input
                  type="date"
                  name="tanggalBayar"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                name="status"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input type="hidden" name="fotoBukti" value={createFotoBukti} />
              <ImageUpload
                value={createFotoBukti}
                onChange={setCreateFotoBukti}
                label="Foto Bukti Pembayaran (opsional)"
                hint="Upload foto bukti transfer atau pembayaran"
              />
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
                  "Simpan Data Register"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false)
                  setCreateFotoBukti("")
                  setSelectedPeriodId("")
                  setSelectedMemberId("")
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Summary — rekap Lunas / Belum untuk hasil filter (misal per Region) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Data</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredData.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Lunas</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{statusSummary["Lunas"] || 0}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-sm">
          <p className="text-xs font-medium text-amber-700">Menunggu Verifikasi</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{statusSummary["Menunggu Verifikasi"] || 0}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Belum</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{statusSummary["Belum"] || 0}</p>
        </div>
      </div>

      {filterRegion && (
        <div className="text-sm text-gray-600">
          Menampilkan rekap pembayaran untuk region <span className="font-semibold text-gray-900">{filterRegion}</span>.
        </div>
      )}

      {/* Data Table */}
      {filteredData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p className="text-gray-500 mb-4">
            {filterPeriod || filterMemberId || filterStatus || filterRegion
              ? "Tidak ada data yang cocok dengan filter"
              : "Belum ada data register"}
          </p>
          {!filterPeriod && !filterMemberId && !filterStatus && !filterRegion && (
            <button
              onClick={() => setCreateOpen(true)}
              className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Data Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Periode</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Biaya</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">ID Member</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Nama Member</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Region</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Tgl Tagihan</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden md:table-cell">Tgl Bayar</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700 hidden lg:table-cell">Bukti</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-20">RegisLang</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Status</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {item.registrationPeriod.period}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700 font-medium">{formatCurrency(item.biaya)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-gray-500">{item.memberId || "—"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{item.namaMember}</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {getRegionByItem(item) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {getRegionByItem(item)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell whitespace-nowrap">
                      {formatDate(item.tanggalTagihan)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell whitespace-nowrap">
                      {formatDate(item.tanggalBayar)}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {item.fotoBukti ? (
                        <a
                          href={item.fotoBukti}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Lihat
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    {/* RegisLang */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        item.registrationPeriod?.regisLang === "Ya"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.registrationPeriod?.regisLang || "Tidak"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          STATUS_BADGE[item.status] || "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            STATUS_DOT[item.status] || "bg-yellow-500"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Lihat Bukti Transfer — active if fotoBukti exists */}
                        <button
                          onClick={() =>
                            item.fotoBukti &&
                            setProofModalState({ memberId: item.memberId || "", namaMember: item.namaMember, fotoBukti: item.fotoBukti })
                          }
                          disabled={!item.fotoBukti}
                          className={`p-2 rounded-lg transition-all ${
                            item.fotoBukti
                              ? "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title={item.fotoBukti ? "Lihat Bukti Transfer" : "Belum ada bukti transfer"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                          </svg>
                        </button>
                        {/* Lihat Kartu */}
                        <button
                          type="button"
                          onClick={() => handleViewCard(item.memberId || "", item.registrationPeriodId)}
                          className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                          title="Lihat Kartu (Depan & Belakang)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {/* Download Kartu */}
                        <button
                          type="button"
                          onClick={() => handleDownloadCard(item.memberId || "", item.registrationPeriodId)}
                          className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all font-medium"
                          title="Download Kartu (Depan & Belakang)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingId(item.id)
                            setEditFotoBukti(item.fotoBukti || "")
                            setEditSelectedPeriodId(item.registrationPeriodId)
                            setEditSelectedMemberId(item.memberId || "")
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
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

      {/* Edit Modal */}
      {editingId && editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setEditingId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Edit Data Register</h3>
              <button
                onClick={() => {
                  setEditingId(null)
                  setEditFotoBukti("")
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Periode Register</label>
                  <select
                    name="registrationPeriodId"
                    required
                    value={editSelectedPeriodId}
                    onChange={(e) => setEditSelectedPeriodId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                  >
                    <option value="">Pilih Periode...</option>
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.period}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Biaya (Rp)</label>
                  <input
                    type="number"
                    name="biaya"
                    defaultValue={getBiayaByPeriod(editSelectedPeriodId) ?? editItem.biaya ?? ""}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Member</label>
                  <select
                    value={editSelectedMemberId}
                    onChange={(e) => setEditSelectedMemberId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                  >
                    <option value="">Pilih Member...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.memberId || m.id}>
                        {m.memberId || m.id} — {m.namaLengkap}
                      </option>
                    ))}
                  </select>
                  <input type="hidden" name="memberId" value={editSelectedMemberId} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Member</label>
                  <input
                    type="text"
                    name="namaMember"
                    defaultValue={getNamaByMember(editSelectedMemberId) || editItem.namaMember}
                    readOnly
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Tagihan</label>
                  <input
                    type="date"
                    name="tanggalTagihan"
                    defaultValue={getInputDateValue(editItem.tanggalTagihan)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Bayar</label>
                  <input
                    type="date"
                    name="tanggalBayar"
                    defaultValue={getInputDateValue(editItem.tanggalBayar)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  name="status"
                  defaultValue={editItem.status}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input type="hidden" name="fotoBukti" value={editFotoBukti} />
                <ImageUpload
                  value={editFotoBukti}
                  onChange={setEditFotoBukti}
                  label="Foto Bukti Pembayaran (opsional)"
                  hint="Upload foto bukti transfer atau pembayaran"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updatePending}
                  className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {updatePending ? (
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
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setEditFotoBukti("")
                  }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bukti Transfer Preview Modal */}
      {proofModalState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setProofModalState(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Bukti Transfer</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {proofModalState.memberId} — {proofModalState.namaMember}
                </p>
              </div>
              <button
                onClick={() => setProofModalState(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofModalState.fotoBukti}
                alt={`Bukti transfer ${proofModalState.namaMember}`}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="flex justify-end mt-4">
              <a
                href={proofModalState.fotoBukti}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Buka di tab baru
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Card Preview & Download Modal */}
      {cardModalState && cardMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setCardModalState(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900">
                    {cardModalState.actionType === "download" ? "Download Kartu Member" : "Kartu Member"}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                    {cardMember.memberId || "Member"}
                  </span>
                  {cardRegItem && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        STATUS_BADGE[cardRegItem.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          STATUS_DOT[cardRegItem.status] || "bg-gray-400"
                        }`}
                      />
                      {cardRegItem.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold text-gray-700">{cardMember.namaLengkap}</span>
                  {cardPeriod?.period && <> &bull; Periode: <span className="font-medium text-gray-700">{cardPeriod.period}</span></>}
                </p>
              </div>

              <button
                onClick={() => setCardModalState(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Tutup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* View Tabs */}
            <div className="flex items-center justify-center my-4">
              <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCardTab("both")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    cardTab === "both"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Kedua Sisi (Depan & Belakang)
                </button>
                <button
                  type="button"
                  onClick={() => setCardTab("front")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    cardTab === "front"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Kartu Depan
                </button>
                <button
                  type="button"
                  onClick={() => setCardTab("back")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    cardTab === "back"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Kartu Belakang
                </button>
              </div>
            </div>

            {/* Cards Display Grid */}
            <div className="relative py-2">
              <div
                className={`grid gap-6 items-start justify-center ${
                  cardTab === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-sm mx-auto"
                }`}
              >
                {/* Kartu Depan Card Container */}
                <div
                  className={`flex flex-col items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 transition-all ${
                    cardTab === "back" ? "hidden" : "block"
                  }`}
                >
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      Kartu Depan
                    </span>
                    <span className="text-[11px] text-gray-400">Sisi Utama</span>
                  </div>

                  <div ref={frontCardRef} className="rounded-xl overflow-hidden shadow-md">
                    <MemberCard
                      compact
                      member={{
                        namaPanggilan: cardMember.namaPanggilan,
                        namaLengkap: cardMember.namaLengkap,
                        foto: cardMember.foto,
                        memberId: cardMember.memberId,
                        masaBerlaku: cardMasaBerlaku,
                      }}
                      clubName={effectiveSiteProfile.clubName}
                      shortName={effectiveSiteProfile.shortName}
                      slogan={effectiveSiteProfile.slogan}
                      logo={effectiveSiteProfile.logo}
                      favicon={effectiveSiteProfile.favicon}
                      cardTemplateFront={effectiveSiteProfile.cardTemplateFront}
                      cardTemplateBack={effectiveSiteProfile.cardTemplateBack}
                      profileUrl={cardMember.memberId ? `${baseUrl}/p/${cardMember.memberId}` : null}
                      showBack={false}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadFront}
                    disabled={downloadingSide !== null}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloadingSide === "front" ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Mengunduh Kartu Depan...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download Kartu Depan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Kartu Belakang Card Container */}
                <div
                  className={`flex flex-col items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 transition-all ${
                    cardTab === "front" ? "hidden" : "block"
                  }`}
                >
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-gray-800" />
                      Kartu Belakang
                    </span>
                    <span className="text-[11px] text-gray-400">Sisi Belakang</span>
                  </div>

                  <div ref={backCardRef} className="rounded-xl overflow-hidden shadow-md">
                    <MemberCard
                      compact
                      member={{
                        namaPanggilan: cardMember.namaPanggilan,
                        namaLengkap: cardMember.namaLengkap,
                        foto: cardMember.foto,
                        memberId: cardMember.memberId,
                        masaBerlaku: cardMasaBerlaku,
                      }}
                      clubName={effectiveSiteProfile.clubName}
                      shortName={effectiveSiteProfile.shortName}
                      slogan={effectiveSiteProfile.slogan}
                      logo={effectiveSiteProfile.logo}
                      favicon={effectiveSiteProfile.favicon}
                      cardTemplateFront={effectiveSiteProfile.cardTemplateFront}
                      cardTemplateBack={effectiveSiteProfile.cardTemplateBack}
                      profileUrl={cardMember.memberId ? `${baseUrl}/p/${cardMember.memberId}` : null}
                      showBack={true}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadBack}
                    disabled={downloadingSide !== null}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloadingSide === "back" ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Mengunduh Kartu Belakang...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download Kartu Belakang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Button 1: 1 Gambar Lengkap (Depan & Belakang) — Paling aman dari blokir browser */}
                  <button
                    type="button"
                    onClick={handleDownloadMerged}
                    disabled={downloadingSide !== null}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-sm transition-all disabled:opacity-50"
                  >
                    {downloadingSide === "merged" ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Menggabungkan & Mengunduh...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Download 1 Gambar Lengkap (Depan & Belakang)</span>
                      </>
                    )}
                  </button>

                  {/* Button 2: 2 File Terpisah */}
                  <button
                    type="button"
                    onClick={handleDownloadBothSeparately}
                    disabled={downloadingSide !== null}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {downloadingSide === "both" ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Mengunduh 2 File...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        <span>Download 2 File Terpisah (PNG)</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCardModalState(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>

              <p className="text-[11px] text-gray-400">
                💡 <span className="font-semibold text-gray-500">Tips:</span> Tombol <strong>&quot;Download 1 Gambar Lengkap&quot;</strong> menggabungkan kartu depan dan belakang berdampingan dalam satu berkas gambar kualitas tinggi (300 DPI) tanpa risiko diblokir browser.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
