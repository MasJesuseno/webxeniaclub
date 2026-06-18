"use client";

import { useState } from "react";
import { createMenu, deleteMenu, addMenuItem, updateMenuItem, deleteMenuItem } from "./actions";

type Page = { id: number; title: string; slug: string };
type MenuItem = {
  id: number; label: string; url: string | null; pageId: number | null;
  order: number; isActive: boolean; page: Page | null;
  children: MenuItem[];
};
type Menu = { id: number; name: string; location: string; items: MenuItem[] };

export function MenuManager({ menus: initialMenus, pages }: { menus: Menu[]; pages: Page[] }) {
  const [menus, setMenus] = useState(initialMenus);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(
    initialMenus[0]?.id || null
  );
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeMenu = menus.find((m) => m.id === activeMenuId);

  async function handleCreateMenu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createMenu(formData);
      setShowNewMenu(false);
      window.location.reload();
    } catch { alert("Gagal membuat menu"); }
    finally { setLoading(false); }
  }

  async function handleDeleteMenu(id: number, name: string) {
    if (!confirm(`Hapus menu "${name}"?`)) return;
    try { await deleteMenu(id); window.location.reload(); }
    catch { alert("Gagal menghapus menu"); }
  }

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("menuId", String(activeMenuId));
    try {
      await addMenuItem(formData);
      setShowAddItem(false);
      window.location.reload();
    } catch { alert("Gagal menambah item"); }
    finally { setLoading(false); }
  }

  async function handleDeleteItem(id: number) {
    if (!confirm("Hapus item menu ini?")) return;
    try { await deleteMenuItem(id); window.location.reload(); }
    catch { alert("Gagal menghapus item"); }
  }

  function renderMenuItems(items: MenuItem[], level = 0) {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors ${
            level > 0 ? "ml-6 border-l-2 border-primary-200 pl-4" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">
                {item.page ? `/${item.page.slug}` : item.url}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDeleteItem(item.id)}
            className="p-1 text-gray-400 hover:text-red-500 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {item.children.length > 0 && renderMenuItems(item.children, level + 1)}
      </div>
    ));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-gray-500 mt-1">Kelola navigasi website</p>
        </div>
        <button onClick={() => setShowNewMenu(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Menu Baru
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenuId(menu.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMenuId === menu.id
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {menu.name}
          </button>
        ))}
      </div>

      {activeMenu && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{activeMenu.name}</h2>
              <p className="text-sm text-gray-500">Lokasi: {activeMenu.location}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddItem(true)}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Tambah Item
              </button>
              <button onClick={() => handleDeleteMenu(activeMenu.id, activeMenu.name)}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                Hapus Menu
              </button>
            </div>
          </div>

          <div className="space-y-1 border rounded-lg p-2">
            {activeMenu.items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Belum ada item menu. Klik "Tambah Item" untuk menambahkan.
              </p>
            ) : (
              renderMenuItems(activeMenu.items)
            )}
          </div>
        </div>
      )}

      {!activeMenu && menus.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Belum ada menu. Buat menu baru untuk memulai.
        </div>
      )}

      {/* New Menu Modal */}
      {showNewMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewMenu(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Menu Baru</h2>
            <form onSubmit={handleCreateMenu} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
                <input type="text" name="name" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Menu Utama" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <select name="location" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="main">Header (Main)</option>
                  <option value="footer">Footer</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewMenu(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddItem(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Tambah Item Menu</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input type="text" name="label" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Beranda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Tautan</label>
                <select name="linkType" id="linkType"
                  onChange={(e) => {
                    const urlInput = document.getElementById("urlInput") as HTMLInputElement;
                    const pageSelect = document.getElementById("pageSelect") as HTMLSelectElement;
                    if (e.target.value === "url") {
                      urlInput.style.display = "block";
                      pageSelect.style.display = "none";
                    } else {
                      urlInput.style.display = "none";
                      pageSelect.style.display = "block";
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="url">URL Kustom</option>
                  <option value="page">Halaman</option>
                </select>
              </div>
              <div id="urlInput">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input type="text" name="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="/tentang-kami" />
              </div>
              <div id="pageSelect" style={{ display: "none" }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Halaman</label>
                <select name="pageId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">-- Pilih Halaman --</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>{page.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                <input type="number" name="order" defaultValue={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
