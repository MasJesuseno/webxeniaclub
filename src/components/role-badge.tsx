// Badge nama role yang dipakai di sidebar & topbar admin.
// Warna disesuaikan per role; role kustom diberi warna netral.

const ROLE_COLORS: Record<string, string> = {
  "super-admin": "bg-red-600/15 text-red-600 border border-red-200",
  editor: "bg-blue-50 text-blue-700 border border-blue-200",
  member: "bg-green-50 text-green-700 border border-green-200",
  bendahara: "bg-amber-50 text-amber-700 border border-amber-200",
}

export function RoleBadge({ name, displayName }: { name: string; displayName: string }) {
  const color = ROLE_COLORS[name] || "bg-gray-100 text-gray-600 border border-gray-200"
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
      {displayName}
    </span>
  )
}

export function RoleBadges({ roles }: { roles: { name: string; displayName: string }[] }) {
  if (!roles || roles.length === 0) return null
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {roles.map((role) => (
        <RoleBadge key={role.name} name={role.name} displayName={role.displayName} />
      ))}
    </span>
  )
}
