"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createMenu, createMenuItem, deleteMenuItem, deleteMenu } from "@/lib/actions"

interface MenuItem {
  id: string
  label: string
  url: string | null
  pageId: string | null
  parentId: string | null
  menuId: string
  order: number
  isActive: boolean
  page: { title: string; slug: string } | null
  children: MenuItem[]
}

interface Menu {
  id: string
  name: string
  location: string
  items: MenuItem[]
}

interface Page {
  id: string
  title: string
  slug: string
}

export function MenuManager({ menus, pages }: { menus: Menu[]; pages: Page[] }) {
  const router = useRouter()
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [addItemTo, setAddItemTo] = useState<string | null>(null)

  async function handleCreateMenu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await createMenu(form)
    if (res?.error) alert(res.error)
    setCreateMenuOpen(false)
    router.refresh()
  }

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>, menuId: string) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    form.set("menuId", menuId)
    const res = await createMenuItem(form)
    if (res?.error) alert(res.error)
    setAddItemTo(null)
    router.refresh()
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Hapus item menu ini?")) return
    await deleteMenuItem(id)
    router.refresh()
  }

  async function handleDeleteMenu(id: string) {
    if (!confirm("Hapus menu ini? Semua item di dalamnya akan ikut terhapus.")) return
    await deleteMenu(id)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Create Menu Button */}
      {!createMenuOpen ? (
        <button onClick={() => setCreateMenuOpen(true)} className="dxic-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Menu Baru
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tambah Menu Baru</h3>
          <form onSubmit={handleCreateMenu} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Menu</label>
                <input type="text" name="name" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Contoh: Header Menu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi</label>
                <select name="location" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="dxic-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">Simpan Menu</button>
              <button type="button" onClick={() => setCreateMenuOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Lists */}
      {menus.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="text-gray-500">Belum ada menu</p>
        </div>
      ) : (
        menus.map((menu) => (
          <div key={menu.id} className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{menu.name}</h3>
                <p className="text-xs text-gray-500">
                  Lokasi: <span className="font-medium uppercase">{menu.location}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddItemTo(addItemTo === menu.id ? null : menu.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                >
                  + Tambah Item
                </button>
                <button onClick={() => handleDeleteMenu(menu.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add Item Form */}
            {addItemTo === menu.id && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <form onSubmit={(e) => handleAddItem(e, menu.id)} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Tambah Item Menu</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input type="text" name="label" required className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Nama item menu" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Parent Item (opsional)</label>
                      <select name="parentId" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
                        <option value="">— Menu Utama —</option>
                        {menu.items.map((item) => (
                          <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">URL (opsional)</label>
                      <input type="text" name="url" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="https:// atau /halaman" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Halaman (opsional)</label>
                      <select name="pageId" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm">
                        <option value="">— Pilih Halaman —</option>
                        {pages.map((page) => (
                          <option key={page.id} value={page.id}>{page.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="dxic-gradient text-white px-4 py-2 rounded-lg text-xs font-semibold hover:shadow-lg transition-all">Tambah Item</button>
                    <button type="button" onClick={() => setAddItemTo(null)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
                  </div>
                </form>
              </div>
            )}

            {/* Menu Items Tree */}
            <div className="divide-y divide-gray-100">
              {menu.items.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-500 text-center">Belum ada item menu</p>
              ) : (
                menu.items.map((item) => (
                  <div key={item.id}>
                    <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        {item.page ? (
                          <span className="text-xs text-blue-500">/{item.page.slug}</span>
                        ) : item.url ? (
                          <span className="text-xs text-gray-400 truncate max-w-[150px]">{item.url}</span>
                        ) : null}
                      </div>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* Children */}
                    {item.children.length > 0 && (
                      <div className="bg-gray-50 divide-y divide-gray-100">
                        {item.children.map((child) => (
                          <div key={child.id} className="px-6 py-2.5 flex items-center justify-between hover:bg-gray-100" style={{ paddingLeft: "3rem" }}>
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-1 rounded-full bg-gray-400" />
                              <span className="text-sm text-gray-700">{child.label}</span>
                              {child.page ? (
                                <span className="text-xs text-blue-500">/{child.page.slug}</span>
                              ) : child.url ? (
                                <span className="text-xs text-gray-400 truncate max-w-[150px]">{child.url}</span>
                              ) : null}
                            </div>
                            <button onClick={() => handleDeleteItem(child.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
