import Link from "next/link"

export function ProfilSubnav({ active }: { active: "profil" | "laporan" }) {
  const items = [
    {
      key: "profil" as const,
      href: "/profil",
      label: "Profil",
      icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      key: "laporan" as const,
      href: "/profil/laporan-keuangan",
      label: "Laporan Keuangan",
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
  ]

  return (
    <div className="flex items-center gap-1 mb-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 overflow-x-auto">
      {items.map((item) => {
        const isActive = item.key === active
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              isActive
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
