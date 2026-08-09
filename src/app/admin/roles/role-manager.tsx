"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createRole, deleteRole, updateRolePermissions } from "@/lib/actions"
import { ADMIN_MENU, ALL_PERMISSIONS, type AdminMenuSection } from "@/lib/admin-menu"

interface Role {
  id: string
  name: string
  displayName: string
  isSystem: boolean
  permissions: { permission: string }[]
  _count: { users: number }
}

const ALL_MENU_KEYS = ADMIN_MENU.flatMap((section) => section.items.map((item) => item.key))

/** Ringkas akses untuk ditampilkan di daftar role */
function permissionSummary(role: Role): string {
  if (role.permissions.some((p) => p.permission === ALL_PERMISSIONS)) return "Semua menu"
  if (role.permissions.length === 0) return "Belum ada akses"
  return `${role.permissions.length} menu`
}

// ─── Komponen picker permission menu (dipakai untuk tambah & edit role) ───

function PermissionPicker({
  sections,
  selected,
  onChange,
  disabled = false,
}: {
  sections: AdminMenuSection[]
  selected: string[]
  onChange: (keys: string[]) => void
  disabled?: boolean
}) {
  const toggle = (key: string) => {
    if (disabled) return
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  }

  const selectAll = (keys: string[]) => {
    if (disabled) return
    onChange(Array.from(new Set([...selected, ...keys])))
  }

  const clearSection = (keys: string[]) => {
    if (disabled) return
    onChange(selected.filter((k) => !keys.includes(k)))
  }

  return (
    <div className={`space-y-5 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
      {sections.map((section) => {
        const keys = section.items.map((item) => item.key)
        const allChecked = keys.every((k) => selected.includes(k))
        const someChecked = keys.some((k) => selected.includes(k))
        return (
          <div key={section.section}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.section}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => (allChecked ? clearSection(keys) : selectAll(keys))}
                  className={`text-xs font-medium px-2 py-0.5 rounded-lg border transition-all ${
                    allChecked
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600"
                  }`}
                >
                  {allChecked ? "Bersihkan" : "Semua"}
                </button>
                {someChecked && !allChecked && (
                  <button
                    type="button"
                    onClick={() => selectAll(keys)}
                    className="text-xs font-medium px-2 py-0.5 rounded-lg border border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600 transition-all"
                  >
                    Pilih semua
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {section.items.map((item) => {
                const checked = selected.includes(item.key)
                return (
                  <label
                    key={item.key}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "bg-red-50 border-red-300 ring-1 ring-red-200"
                        : "border-gray-200 hover:border-red-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(item.key)}
                      disabled={disabled}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className={`text-sm ${checked ? "font-medium text-gray-900" : "text-gray-600"}`}>
                      {item.label}
                    </span>
                    <code className="ml-auto text-[10px] text-gray-400 hidden sm:block">{item.key}</code>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Komponen utama RoleManager ───

export function RoleManager({ roles }: { roles: Role[] }) {
  const router = useRouter()

  const [createOpen, setCreateOpen] = useState(false)
  const [newPermissions, setNewPermissions] = useState<string[]>([])
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editPermissions, setEditPermissions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    newPermissions.forEach((key) => form.append("permissions", key))
    const res = await createRole(form)
    if (res?.error) alert(res.error)
    setSaving(false)
    setCreateOpen(false)
    setNewPermissions([])
    router.refresh()
  }

  function openEdit(role: Role) {
    setEditingRole(role)
    setEditPermissions(role.permissions.map((p) => p.permission))
  }

  async function handleSavePermissions() {
    if (!editingRole) return
    setSaving(true)
    const form = new FormData()
    form.set("roleId", editingRole.id)
    editPermissions.forEach((key) => form.append("permissions", key))
    const res = await updateRolePermissions(form)
    if (res?.error) alert(res.error)
    setSaving(false)
    setEditingRole(null)
    router.refresh()
  }

  async function handleDelete(id: string, isSystem: boolean) {
    if (isSystem) { alert("Role sistem tidak bisa dihapus"); return }
    if (!confirm("Hapus role ini?")) return
    const res = await deleteRole(id)
    if (res?.error) alert(res.error)
    router.refresh()
  }

  const isSuperAdmin = (role: Role) => role.name === "super-admin"

  return (
    <div className="space-y-8">
      {/* Tombol tambah role */}
      {!createOpen && !editingRole && (
        <button
          onClick={() => setCreateOpen(true)}
          className="dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Role Baru
        </button>
      )}

      {/* Form tambah role */}
      {createOpen && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tambah Role Baru</h3>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Role</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="contoh: penulis"
                />
                <p className="text-xs text-gray-400 mt-1">ID unik, hanya huruf kecil dan tanda strip</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Tampilan</label>
                <input
                  type="text"
                  name="displayName"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Contoh: Penulis"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Akses Menu</label>
                <button
                  type="button"
                  onClick={() =>
                    setNewPermissions(
                      newPermissions.length === ALL_MENU_KEYS.length ? [] : [...ALL_MENU_KEYS]
                    )
                  }
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600 transition-all"
                >
                  {newPermissions.length === ALL_MENU_KEYS.length ? "Hapus semua" : "Pilih semua menu"}
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto pr-2 rounded-xl border border-gray-100 p-4">
                <PermissionPicker
                  sections={ADMIN_MENU}
                  selected={newPermissions}
                  onChange={setNewPermissions}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {newPermissions.length} dari {ALL_MENU_KEYS.length} menu dipilih
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Role"}
              </button>
              <button
                type="button"
                onClick={() => { setCreateOpen(false); setNewPermissions([]) }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal atur akses menu */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingRole(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Atur Akses Menu — {editingRole.displayName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isSuperAdmin(editingRole)
                    ? "Super Admin otomatis memiliki akses ke semua menu."
                    : "Centang menu yang boleh diakses role ini. Berlaku langsung tanpa login ulang."}
                </p>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                aria-label="Tutup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <PermissionPicker
                sections={ADMIN_MENU}
                selected={editPermissions}
                onChange={setEditPermissions}
                disabled={isSuperAdmin(editingRole)}
              />
              <p className="text-xs text-gray-400 mt-3">
                {isSuperAdmin(editingRole)
                  ? "Semua menu diizinkan."
                  : `${editPermissions.length} dari ${ALL_MENU_KEYS.length} menu dipilih`}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingRole(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleSavePermissions()}
                disabled={saving || isSuperAdmin(editingRole)}
                className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Akses"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daftar role */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Daftar Role ({roles.length})</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Atur akses menu untuk masing-masing role. Super Admin selalu punya akses penuh.
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {roles.map((role) => (
            <div key={role.id} className="px-6 py-4 flex flex-wrap items-center gap-3 justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {role.displayName}
                    {role.isSystem && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Sistem</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {role.name} • {role._count.users} pengguna
                  </p>
                  <p className={`text-xs mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    isSuperAdmin(role) || role.permissions.some((p) => p.permission === ALL_PERMISSIONS)
                      ? "bg-green-100 text-green-700"
                      : role.permissions.length === 0
                        ? "bg-gray-100 text-gray-500"
                        : "bg-red-50 text-red-600"
                  }`}>
                    {permissionSummary(role)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Tombol atur akses */}
                <button
                  onClick={() => openEdit(role)}
                  disabled={isSuperAdmin(role)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isSuperAdmin(role)
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200"
                  }`}
                  title={isSuperAdmin(role) ? "Super Admin memiliki akses penuh" : "Atur akses menu role ini"}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Atur Akses
                </button>
                {/* Hapus role */}
                <button
                  onClick={() => handleDelete(role.id, role.isSystem)}
                  className={`p-2 rounded-lg transition-all ${
                    role.isSystem
                      ? "text-gray-200 cursor-not-allowed"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title={role.isSystem ? "Role sistem tidak bisa dihapus" : "Hapus role"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {roles.length === 0 && (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Belum ada role</p>
          )}
        </div>
      </div>
    </div>
  )
}
