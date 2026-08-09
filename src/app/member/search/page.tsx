"use client"

import { useState, useRef } from "react"

interface MemberResult {
  id: string
  memberId: string
  namaLengkap: string
  namaPanggilan: string
  noWa: string
  provinsi: string
  kotaKabupaten: string
  region: string
  foto: string
  jenisMobil: string
  tipeMobil: string
  noPolisi: string
  warna: string
}

export default function MemberSearchPage() {
  const [query, setQuery] = useState("")
  const [searchMode, setSearchMode] = useState<"name" | "id" | "plat">("name")
  const [results, setResults] = useState<MemberResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  async function handleSearch(value: string) {
    setQuery(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    setError("")

    if (value.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true)
      setSearched(true)
      try {
        const res = await fetch(
          `/api/member/search?q=${encodeURIComponent(value)}&byId=${searchMode === "id"}&byPlat=${searchMode === "plat"}`
        )
        if (!res.ok) {
          throw new Error("Gagal mencari data")
        }
        const data = await res.json()
        setResults(data.results || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  function toggleSearchMode(mode: "name" | "id" | "plat") {
    setSearchMode(mode)
    setQuery("")
    setResults([])
    setSearched(false)
    setError("")
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Cari Member</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Cari berdasarkan nama, ID member, atau nomor polisi
        </p>
      </div>

      {/* Search Mode Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => toggleSearchMode("name")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            searchMode === "name"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Nama
        </button>
        <button
          onClick={() => toggleSearchMode("id")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            searchMode === "id"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          ID Member
        </button>
        <button
          onClick={() => toggleSearchMode("plat")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            searchMode === "plat"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          No. Polisi
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={
            searchMode === "name"
              ? "Ketik nama member..."
              : searchMode === "id"
                ? "Ketik ID member..."
                : "Ketik nomor polisi..."
          }
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
          autoFocus
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setSearched(false); setError("") }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* Results */}
      {!loading && searched && !error && (
        <>
          {results.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-500">Tidak ada member ditemukan</p>
              <p className="text-xs text-gray-400 mt-1">Coba dengan kata kunci lain</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                {results.length} member ditemukan untuk "{query}"
              </p>
              {results.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {member.foto ? (
                        <img src={member.foto} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        member.namaLengkap.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-gray-900">{member.namaLengkap}</h3>
                      <p className="text-xs text-gray-500">
                        ID: {member.memberId}
                        {member.namaPanggilan && ` · ${member.namaPanggilan}`}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {member.region && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-[10px] font-medium">
                            {member.region}
                          </span>
                        )}
                        {member.kotaKabupaten && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                            {member.kotaKabupaten}
                          </span>
                        )}
                        {member.provinsi && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">
                            {member.provinsi}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-[10px] text-gray-400">
                        {member.jenisMobil} {member.tipeMobil} · {member.noPolisi}
                        {member.warna && ` · ${member.warna}`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (member.noWa) {
                          window.open(
                            `https://wa.me/${member.noWa.replace(/^0/, "62").replace(/[^0-9]/g, "")}`,
                            "_blank"
                          )
                        }
                      }}
                      className="shrink-0 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Hubungi via WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
