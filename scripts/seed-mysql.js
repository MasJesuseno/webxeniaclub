// Seed script for DXIC MySQL database
// Run: node scripts/seed-mysql.js
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("crypto")

async function main() {
  console.log("Seeding database...")
  
  const conn = await mysql.createConnection("mysql://root@localhost:3306/xeniaclub")
  
  // Helper to run queries
  const q = async (sql, params = []) => {
    try {
      const [result] = await conn.execute(sql, params)
      return result
    } catch (e) {
      // Ignore duplicate key errors
      if (e.errno === 1062) return { affectedRows: 0 }
      throw e
    }
  }

  // Generate hashed password for admin123
  const hashedPassword = await bcrypt.hash("admin123", 12)

  // Roles
  await q("INSERT IGNORE INTO Role (id, name, displayName, isSystem) VALUES (?, ?, ?, ?)", [
    "role-super-admin", "super-admin", "Super Admin", true
  ])
  await q("INSERT IGNORE INTO Role (id, name, displayName, isSystem) VALUES (?, ?, ?, ?)", [
    "role-editor", "editor", "Editor", true
  ])

  // Admin user
  await q("INSERT IGNORE INTO User (id, name, username, email, password, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())", [
    "user-admin", "Admin DXIC", "admin", "admin@xeniaclub.or.id", hashedPassword, true
  ])

  // Assign role
  await q("INSERT IGNORE INTO UserRole (userId, roleId) VALUES (?, ?)", ["user-admin", "role-super-admin"])

  // Site profile
  const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM SiteProfile")
  if (existing[0].cnt === 0) {
    await q("INSERT INTO SiteProfile (id, clubName, shortName, slogan, description, vision, mission, memberCount, cityCount, establishedYear, primaryColor, instagramUrl, youtubeUrl, facebookUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      "default", "Daihatsu Xenia Indonesia Club", "DXIC", "Xenia Menyatukan Kita",
      "Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia.",
      "Menjadi komunitas Daihatsu Xenia terbesar dan terbaik di Indonesia.",
      "Mempererat silaturahmi antar sesama pemilik Xenia.",
      500, 30, "2010", "#DC2626",
      "https://instagram.com/xeniaclub", "https://youtube.com/@xeniaclub", "https://facebook.com/xeniaclub"
    ])
  }

  // Categories
  await q("INSERT IGNORE INTO Category (id, name, slug, color) VALUES (?, ?, ?, ?)", ["cat-kegiatan", "Kegiatan", "kegiatan", "#DC2626"])
  await q("INSERT IGNORE INTO Category (id, name, slug, color) VALUES (?, ?, ?, ?)", ["cat-kopdar", "Kopdar", "kopdar", "#2563EB"])
  await q("INSERT IGNORE INTO Category (id, name, slug, color) VALUES (?, ?, ?, ?)", ["cat-info", "Info", "info", "#059669"])
  await q("INSERT IGNORE INTO Category (id, name, slug, color) VALUES (?, ?, ?, ?)", ["cat-tips", "Tips & Trik", "tips", "#D97706"])

  // Posts
  await q("INSERT IGNORE INTO Post (id, title, slug, content, excerpt, status, featured, publishedAt, createdAt, updatedAt, authorId, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), ?, ?)", [
    "post-1", "Kopdar Akbar DXIC 2025 Sukses Digelar", "kopdar-akbar-dxic-2025-sukses-digelar",
    "<p>Acara Kopdar Akbar DXIC 2025 yang diselenggarakan di Bandung pada akhir pekan lalu berlangsung meriah.</p>",
    "Acara Kopdar Akbar DXIC 2025 di Bandung berlangsung meriah.", "published", true, "user-admin", "cat-kegiatan"
  ])
  await q("INSERT IGNORE INTO Post (id, title, slug, content, excerpt, status, featured, publishedAt, createdAt, updatedAt, authorId, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), ?, ?)", [
    "post-2", "Tips Perawatan Daihatsu Xenia agar Tetap Prima", "tips-perawatan-daihatsu-xenia-agar-tetap-prima",
    "<p>Merawat Daihatsu Xenia dengan baik akan membuat mobil kesayangan Anda tetap prima.</p>",
    "Tips lengkap merawat Daihatsu Xenia agar tetap prima.", "published", true, "user-admin", "cat-tips"
  ])
  await q("INSERT IGNORE INTO Post (id, title, slug, content, excerpt, status, featured, publishedAt, createdAt, updatedAt, authorId, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), ?, ?)", [
    "post-3", "DXIC Gelar Bakti Sosial di Panti Asuhan", "dxic-gelar-bakti-sosial-di-panti-asuhan",
    "<p>DXIC kembali mengadakan kegiatan bakti sosial dengan mengunjungi panti asuhan di Jakarta.</p>",
    "Kegiatan bakti sosial DXIC di panti asuhan Jakarta.", "published", true, "user-admin", "cat-kegiatan"
  ])

  // Menus
  await q("INSERT IGNORE INTO Menu (id, name, location) VALUES (?, ?, ?)", ["menu-header", "Header Menu", "header"])
  await q("INSERT IGNORE INTO Menu (id, name, location) VALUES (?, ?, ?)", ["menu-footer", "Footer Menu", "footer"])

  // Page
  const [pageRows] = await conn.execute("SELECT COUNT(*) as cnt FROM Page WHERE slug = ?", ["profil"])
  if (pageRows[0].cnt === 0) {
    const pageId = "page-profil"
    await q("INSERT INTO Page (id, title, slug, content, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())", [
      pageId, "Profil", "profil", "<h2>Tentang DXIC</h2><p>DXIC adalah komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia.</p>", "published"
    ])
    await q("INSERT IGNORE INTO MenuItem (id, label, pageId, menuId, `order`, isActive) VALUES (?, ?, ?, ?, ?, ?)", [
      "mi-profil", "Profil", pageId, "menu-header", 0, true
    ])
  }

  // Testimonials
  await q("INSERT IGNORE INTO Testimonial (id, name, title, content, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())", [
    "test-1", "Andi Pratama", "Anggota DXIC Jakarta", "Bergabung dengan DXIC adalah pengalaman yang luar biasa!", 0, true
  ])
  await q("INSERT IGNORE INTO Testimonial (id, name, title, content, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())", [
    "test-2", "Budi Santoso", "Anggota DXIC Bandung", "DXIC bukan sekadar komunitas, sudah seperti keluarga kedua.", 1, true
  ])
  await q("INSERT IGNORE INTO Testimonial (id, name, title, content, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())", [
    "test-3", "Citra Dewi", "Anggota DXIC Surabaya", "Senang sekali bisa bergabung di DXIC.", 2, true
  ])
  await q("INSERT IGNORE INTO Testimonial (id, name, title, content, `order`, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())", [
    "test-4", "Deni Nugroho", "Anggota DXIC Yogyakarta", "Kopdar pertama saya dengan DXIC sangat berkesan.", 3, true
  ])

  // Settings
  await q("INSERT IGNORE INTO Setting (id, `key`, value) VALUES (?, ?, ?)", ["set-1", "site_description", "DXIC - Daihatsu Xenia Indonesia Club."])
  await q("INSERT IGNORE INTO Setting (id, `key`, value) VALUES (?, ?, ?)", ["set-2", "site_keywords", "DXIC, Xenia Club Indonesia, Daihatsu Xenia"])

  await conn.end()
  console.log("Database seeding completed!")
  console.log("Admin login: admin@xeniaclub.or.id / admin123")
}

main().catch((e) => {
  console.error("Seed failed:", e.message)
  process.exit(1)
})
