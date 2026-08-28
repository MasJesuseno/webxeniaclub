"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface SosMessage {
  id: string
  memberId: string | null
  nama: string
  region: string | null
  hp: string
  latitude: number | null
  longitude: number | null
  kebutuhan: string
  status: string
  createdAt: string
}

interface SosResponse {
  messages: SosMessage[]
  currentMemberId: string | null
}

function statusBadge(status: string) {
  if (status === "Open")
    return "bg-red-50 text-red-600 ring-1 ring-red-100"
  return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function MemberSosPage() {
  const [messages, setMessages] = useState<SosMessage[]>([])
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "Open" | "Close">("Open")
  const [showForm, setShowForm] = useState(false)
  const [formKebutuhan, setFormKebutuhan] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [closingId, setClosingId] = useState<string | null>(null)

  function fetchData() {
    fetch("/api/member/sos")
      .then((res) => res.json())
      .then((data: SosResponse) => {
        setMessages(data.messages || [])
        setCurrentMemberId(data.currentMemberId || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSubmitSos() {
    if (!formKebutuhan.trim()) {
      setFormError("Kebutuhan harus diisi")
      return
    }
    setFormLoading(true)
    setFormError("")
    setFormSuccess("")

    try {
      // Ambil lokasi GPS jika tersedia
      let latitude: number | null = null
      let longitude: number | null = null
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        latitude = pos.coords.latitude
        longitude = pos.coords.longitude
      } catch {}

      const res = await fetch("/api/member/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kebutuhan: formKebutuhan, latitude, longitude }),
      })

      if (res.ok) {
        setFormSuccess("SOS berhasil dikirim!")
        setFormKebutuhan("")
        setShowForm(false)
        fetchData()
        setTimeout(() => setFormSuccess(""), 3000)
      } else {
        const data = await res.json()
        setFormError(data.error || "Gagal mengirim SOS")
      }
    } catch {
      setFormError("Terjadi kesalahan")
    } finally {
      setFormLoading(false)
    }
  }

  async function handleCloseSos(id: string) {
    if (!confirm("Tandai SOS ini sebagai selesai ditangani?")) return
    setClosingId(id)
    try {
      const res = await fetch(`/api/member/sos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Close" }),
      })
      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || "Gagal mengubah status")
      }
    } catch {
      alert("Terjadi kesalahan")
    } finally {
      setClosingId(null)
    }
  }

  const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter)
  const openCount = messages.filter((m) => m.status === "Open").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-red-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Memuat data SOS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">SOS</h1>
          <p className="text-xs text-gray-500">Informasi bantuan darurat dari member</p>
        </div>
        {openCount > 0 && (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-red-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            {openCount} Open
          </span>
        )}
      </div>

      {/* Success message */}
      {formSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {formSuccess}
        </div>
      )}

      {/* Create SOS Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full dxic-gradient text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Kirim SOS
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Kirim SOS Baru</h3>
            <button onClick={() => { setShowForm(false); setFormError("") }} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Nama, Region, dan No HP akan otomatis diambil dari data profil Anda.
            Lokasi GPS akan otomatis terdeteksi jika diizinkan browser.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kebutuhan Bantuan *</label>
            <textarea
              value={formKebutuhan}
              onChange={(e) => setFormKebutuhan(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
              placeholder="Jelaskan kebutuhan bantuan Anda..."
            />
          </div>
          {formError && (
            <p className="text-xs text-red-600">{formError}</p>
          )}
          <button
            onClick={handleSubmitSos}
            disabled={formLoading}
            className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {formLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengirim...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Kirim SOS
              </>
            )}
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(["Open", "Close", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f
                ? f === "Open"
                  ? "bg-red-600 text-white"
                  : f === "Close"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f === "all" ? "Semua" : f}
            {f === "Open" && ` (${openCount})`}
            {f === "Close" && ` (${messages.filter((m) => m.status === "Close").length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-500 text-sm">
            {filter === "Open" ? "Tidak ada SOS yang sedang open" : "Belum ada data SOS"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold">
                    {item.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.nama}</p>
                    <p className="text-[11px] text-gray-400">
                      {item.memberId || "Non-member"} · {item.region || "-"}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="px-4 py-3 space-y-2.5">
                {/* Kebutuhan */}
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">Kebutuhan</p>
                  <p className="text-sm text-gray-700">{item.kebutuhan}</p>
                </div>

                {/* HP + WhatsApp */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">No. HP</p>
                    <p className="text-sm text-gray-900 font-medium">{item.hp}</p>
                  </div>
                  <a
                    href={`https://wa.me/${item.hp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-600 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>

                {/* GPS Link */}
                {item.latitude && item.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 text-xs hover:underline"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Lihat Lokasi di Maps
                  </a>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-50 flex items-center justify-between">
                <p className="text-[10px] text-gray-400">
                  {formatDate(item.createdAt)}
                </p>
                {/* Tombol Close — hanya pemilik yang bisa menutup */}
                {item.status === "Open" && item.memberId === currentMemberId && (
                  <button
                    onClick={() => handleCloseSos(item.id)}
                    disabled={closingId === item.id}
                    className="inline-flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {closingId === item.id ? (
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Selesai
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
