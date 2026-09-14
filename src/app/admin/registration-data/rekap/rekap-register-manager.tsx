"use client"

import { useState, useMemo } from "react"
import * as XLSX from "xlsx"

interface RekapRow {
  region: string
  period: string
  periodId: string
  total: number
  belum: number
  lunas: number
  menunggu: number
}

interface RegistrationPeriod {
  id: string
  period: string
}

export function RekapRegisterManager({
  rekapData,
  periods,
}: {
  rekapData: RekapRow[]
  periods: RegistrationPeriod[]
}) {
  const [filterPeriod, setFilterPeriod] = useState("")
  const [filterRegion, setFilterRegion] = useState("")

  // Unique region list
  const regionOptions = useMemo(() => {
    const set = new Set<string>()
    for (const row of rekapData) {
      if (row.region) set.add(row.region)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "id"))
  }, [rekapData])

  // Filter data
  const filteredData = useMemo(() => {
    let result = rekapData
    if (filterPeriod) {
      result = result.filter((r) => r.periodId === filterPeriod)
    }
    if (filterRegion) {
      result = result.filter((r) => r.region === filterRegion)
    }
    return result
  }, [rekapData, filterPeriod, filterRegion])

  // Summary totals
  const summary = useMemo(() => {
    let total = 0
    let belum = 0
    let lunas = 0
    let menunggu = 0
    for (const row of filteredData) {
      total += row.total
      belum += row.belum
      lunas += row.lunas
      menunggu += row.menunggu
    }
    return { total, belum, lunas, menunggu }
  }, [filteredData])

  function buildExportRows() {
    const headers = ["Nama Region", "Periode Register", "Jumlah Register", "Belum Upload", "Lunas", "Menunggu Verifikasi"]
    const rows = filteredData.map((r) => [
      r.region,
      r.period,
      r.total,
      r.belum,
      r.lunas,
      r.menunggu,
    ])
    rows.push(["TOTAL", "", summary.total, summary.belum, summary.lunas, summary.menunggu])
    return { headers, rows }
  }

  function handleExportCSV() {
    const { headers, rows } = buildExportRows()
    const csvRows = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const csvContent = [headers.map((h) => `"${h}"`).join(","), csvRows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Rekap_Register_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  function handleExportExcel() {
    const { headers, rows } = buildExportRows()
    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Style column widths
    ws["!cols"] = [
      { wch: 25 },  // Nama Region
      { wch: 22 },  // Periode Register
      { wch: 16 },  // Jumlah Register
      { wch: 14 },  // Belum Upload
      { wch: 10 },  // Lunas
      { wch: 20 },  // Menunggu Verifikasi
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Register")
    XLSX.writeFile(wb, `Rekap_Register_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      {/* Filters + Export */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-gray-500">{filteredData.length} data rekap</p>

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

          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white min-w-[180px]"
          >
            <option value="">Semua Region</option>
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Register</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Belum Upload</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{summary.belum}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Lunas</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{summary.lunas}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-sm">
          <p className="text-xs font-medium text-amber-700">Menunggu Verifikasi</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{summary.menunggu}</p>
        </div>
      </div>

      {/* Table */}
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
          <p className="text-gray-500">
            {filterPeriod || filterRegion
              ? "Tidak ada data yang cocok dengan filter"
              : "Belum ada data register"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Nama Region</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-700">Periode Register</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700">Jumlah Register</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700">Belum Upload</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700">Lunas</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-gray-700">Menunggu Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row, idx) => (
                  <tr key={`${row.region}-${row.periodId}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-gray-900">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {row.region}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">{row.period}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {row.total}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        {row.belum}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {row.lunas}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        {row.menunggu}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary Row */}
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td className="py-3 px-4 text-gray-900" colSpan={2}>
                    TOTAL
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-blue-200 text-blue-800">
                      {summary.total}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800">
                      {summary.belum}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800">
                      {summary.lunas}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-800">
                      {summary.menunggu}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
