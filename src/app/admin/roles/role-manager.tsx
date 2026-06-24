"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createRole, deleteRole } from "@/lib/actions"

interface Role {
  id: string
  name: string
  displayName: string
  isSystem: boolean
  _count: { users: number }
}

export function RoleManager({ roles }: { roles: Role[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await createRole(form)
    if (res?.error) alert(res.error)
    setCreateOpen(false)
    router.refresh()
  }

  async function handleDelete(id: string, isSystem: boolean) {
    if (isSystem) { alert("Role sistem tidak bisa dihapus"); return }
    if (!confirm("Hapus role ini?")) return
    const res = await deleteRole(id)
    if (res?.error) alert(res.error)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {!createOpen ? (
        <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Role Baru
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tambah Role Baru</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Role</label>
              <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="contoh: penulis" />
              <p className="text-xs text-gray-400 mt-1">ID unik, hanya huruf kecil dan tanda strip</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Tampilan</label>
              <input type="text" name="displayName" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Penulis" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Role</button>
              <button type="button" onClick={() => setCreateOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Roles List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Daftar Role ({roles.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {roles.map((role) => (
            <div key={role.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {role.displayName}
                    {role.isSystem && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Sistem</span>}
                  </p>
                  <p className="text-xs text-gray-500">{role.name} • {role._count.users} pengguna</p>
                </div>
              </div>
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
          ))}
          {roles.length === 0 && (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Belum ada role</p>
          )}
        </div>
      </div>
    </div>
  )
}
