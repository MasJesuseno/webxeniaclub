"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUser, toggleUserActive, deleteUser } from "@/lib/actions"

interface User {
  id: string
  name: string
  username: string
  email: string
  isActive: boolean
  createdAt: Date
  roles: { role: { id: string; name: string; displayName: string } }[]
}

interface Role {
  id: string
  name: string
  displayName: string
}

export function UserManager({ users, roles }: { users: User[]; roles: Role[] }) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await createUser(form)
    if (res?.error) alert(res.error)
    setCreateOpen(false)
    router.refresh()
  }

  async function handleToggleActive(id: string) {
    await toggleUserActive(id)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengguna ini?")) return
    await deleteUser(id)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {!createOpen ? (
        <button onClick={() => setCreateOpen(true)} className="dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tambah Pengguna Baru</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
                <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input type="text" name="username" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Username untuk login" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="email@xeniaclub.or.id" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" name="password" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Minimal 6 karakter" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Pengguna</button>
              <button type="button" onClick={() => setCreateOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden md:table-cell">Username</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden lg:table-cell">Email</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden sm:table-cell">Role</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden sm:table-cell">Status</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full dxic-gradient flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{user.username}</code>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{user.email}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((ur) => (
                          <span key={ur.role.id} className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            {ur.role.displayName}
                          </span>
                        ))}
                        {user.roles.length === 0 && <span className="text-xs text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          className={`p-2 rounded-lg transition-all ${
                            user.isActive
                              ? "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                              : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                          }`}
                          title={user.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.isActive
                              ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                            />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-500">Belum ada pengguna</p>
          </div>
        )}
      </div>
    </div>
  )
}
