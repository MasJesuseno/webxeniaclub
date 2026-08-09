"use client"

import { useState } from "react"

interface Partner {
  id: string
  name: string
  logo: string
  description: string | null
  website: string | null
  locationLink: string | null
  benefit: string | null
  region: string | null
}

export function PartnerCarousel({ partners }: { partners: Partner[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (partners.length === 0) return null

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Mitra Kerja Sama
          </h2>
          <div className="w-20 h-1 dxic-gradient rounded-full mx-auto mb-4" />
          <p className="text-gray-500 max-w-2xl mx-auto">
            Bersama mitra-mitra terbaik kami dalam memberikan pelayanan dan manfaat eksklusif untuk anggota DXIC
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-5 font-semibold text-gray-700 w-28">Logo</th>
                <th className="text-left py-4 px-5 font-semibold text-gray-700">Nama Mitra</th>
                <th className="text-left py-4 px-5 font-semibold text-gray-700 hidden sm:table-cell">Wilayah</th>
                <th className="text-left py-4 px-5 font-semibold text-gray-700 hidden md:table-cell">Deskripsi</th>
                <th className="text-left py-4 px-5 font-semibold text-gray-700 hidden lg:table-cell">Lokasi</th>
                <th className="text-left py-4 px-5 font-semibold text-gray-700">Benefit Member</th>
                <th className="text-left py-4 px-5 font-semibold text-gray-700 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full dxic-gradient flex items-center justify-center text-white font-bold text-sm">
                          {partner.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-semibold text-gray-900">{partner.name}</div>
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 mt-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Website
                      </a>
                    )}
                  </td>
                  <td className="py-4 px-5 hidden sm:table-cell">
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
                  <td className="py-4 px-5 text-gray-600 hidden md:table-cell">
                    <span className={
                      expandedId === partner.id
                        ? ""
                        : "line-clamp-2"
                    }>
                      {partner.description || "-"}
                    </span>
                    {partner.description && partner.description.length > 120 && (
                      <button
                        onClick={() => setExpandedId(expandedId === partner.id ? null : partner.id)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium ml-1"
                      >
                        {expandedId === partner.id ? "Sembunyikan" : "Selengkapnya"}
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-5 hidden lg:table-cell">
                    {partner.locationLink ? (
                      partner.locationLink.startsWith("http://") || partner.locationLink.startsWith("https://") ? (
                        <a
                          href={partner.locationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Lihat Detail
                        </a>
                      ) : (
                        <span className="text-xs text-gray-600">{partner.locationLink}</span>
                      )
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    {partner.benefit ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {partner.benefit}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    {/* Mobile expand button - appears on small screens */}
                    {partner.description && (
                      <button
                        onClick={() => setExpandedId(expandedId === partner.id ? null : partner.id)}
                        className="md:hidden text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Detail"
                      >
                        <svg className={`w-5 h-5 transition-transform ${expandedId === partner.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile expanded detail */}
        {expandedId && (
          <div className="md:hidden mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {(() => {
              const partner = partners.find(p => p.id === expandedId)
              if (!partner) return null
              return (
                <div className="space-y-3 text-sm">
                  {partner.region && (
                    <div>
                      <span className="font-semibold text-gray-700">Wilayah:</span>
                      <p className="text-gray-600 mt-0.5">{partner.region}</p>
                    </div>
                  )}
                  {partner.description && (
                    <div>
                      <span className="font-semibold text-gray-700">Deskripsi:</span>
                      <p className="text-gray-600 mt-0.5">{partner.description}</p>
                    </div>
                  )}
                  {partner.locationLink && (
                    <div>
                      <span className="font-semibold text-gray-700">Lokasi:</span>
                      {partner.locationLink.startsWith("http://") || partner.locationLink.startsWith("https://") ? (
                        <a href={partner.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 ml-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Buka Link
                        </a>
                      ) : (
                        <p className="text-gray-600 mt-0.5 ml-2">{partner.locationLink}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            * Benefit berlaku sesuai ketentuan masing-masing mitra. Tunjukkan kartu member DXIC untuk mendapatkan benefit.
          </p>
        </div>
      </div>
    </section>
  )
}
