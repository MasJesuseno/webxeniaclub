interface PengurusItem {
  id: string
  memberId: string | null
  nama: string
  jabatan: string
  foto: string | null
  tentang: string | null
  urutan: number
}

export function PengurusSection({ pengurus }: { pengurus: PengurusItem[] }) {
  if (pengurus.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Belum ada data pengurus</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Struktur Organisasi
        </h2>
      </div>
      <div className="p-5">
        <div className="space-y-4">
          {pengurus.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              {item.foto ? (
                <img src={item.foto} alt={item.nama} className="w-28 h-[180px] sm:w-[120px] sm:h-[200px] rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0" />
              ) : (
                <div className="w-28 h-[180px] sm:w-[120px] sm:h-[200px] bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold text-3xl border-2 border-white shadow-sm flex-shrink-0">
                  {item.nama.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400">{item.memberId || "-"}</p>
                <p className="text-base font-bold text-gray-900">{item.nama}</p>
                <p className="text-sm text-red-600 font-semibold">{item.jabatan}</p>
                {item.tentang && (
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.tentang}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
