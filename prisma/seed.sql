-- Database seeding for DXIC
-- Admin login: admin@xeniaclub.or.id / admin123

-- Roles
INSERT IGNORE INTO Role (id, name, displayName, isSystem) VALUES
  ('role-super-admin', 'super-admin', 'Super Admin', TRUE),
  ('role-editor', 'editor', 'Editor', TRUE);

-- Admin user (password: admin123 - bcrypt hash)
INSERT IGNORE INTO User (id, name, username, email, password, isActive, createdAt, updatedAt) VALUES
  ('user-admin', 'Admin DXIC', 'admin', 'admin@xeniaclub.or.id', '$2a$12$LJ3m4ys3Lk0TSwHW7r.hNOPE1N6jPqWxrYmQRqYK7A1M8JTCx3KKe', TRUE, NOW(), NOW());

-- Assign role
INSERT IGNORE INTO UserRole (userId, roleId) VALUES ('user-admin', 'role-super-admin');

-- Site profile
INSERT INTO SiteProfile (id, clubName, shortName, slogan, description, vision, mission, memberCount, cityCount, establishedYear, primaryColor, instagramUrl, youtubeUrl, facebookUrl)
SELECT 'default', 'Daihatsu Xenia Indonesia Club', 'DXIC', 'Xenia Menyatukan Kita', 'Komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia.', 'Menjadi komunitas Daihatsu Xenia terbesar dan terbaik di Indonesia.', 'Mempererat silaturahmi antar sesama pemilik Xenia.', 500, 30, '2010', '#DC2626', 'https://instagram.com/xeniaclub', 'https://youtube.com/@xeniaclub', 'https://facebook.com/xeniaclub'
WHERE NOT EXISTS (SELECT 1 FROM SiteProfile LIMIT 1);

-- Categories
INSERT IGNORE INTO Category (id, name, slug, color) VALUES
  ('cat-kegiatan', 'Kegiatan', 'kegiatan', '#DC2626'),
  ('cat-kopdar', 'Kopdar', 'kopdar', '#2563EB'),
  ('cat-info', 'Info', 'info', '#059669'),
  ('cat-tips', 'Tips & Trik', 'tips', '#D97706');

-- Posts
INSERT IGNORE INTO Post (id, title, slug, content, excerpt, status, featured, publishedAt, createdAt, updatedAt, authorId, categoryId) VALUES
  ('post-1', 'Kopdar Akbar DXIC 2025 Sukses Digelar', 'kopdar-akbar-dxic-2025-sukses-digelar', '<p>Acara Kopdar Akbar DXIC 2025 yang diselenggarakan di Bandung pada akhir pekan lalu berlangsung meriah.</p>', 'Acara Kopdar Akbar DXIC 2025 di Bandung berlangsung meriah.', 'published', TRUE, NOW(), NOW(), NOW(), 'user-admin', 'cat-kegiatan'),
  ('post-2', 'Tips Perawatan Daihatsu Xenia agar Tetap Prima', 'tips-perawatan-daihatsu-xenia-agar-tetap-prima', '<p>Merawat Daihatsu Xenia dengan baik akan membuat mobil kesayangan Anda tetap prima.</p>', 'Tips lengkap merawat Daihatsu Xenia agar tetap prima.', 'published', TRUE, NOW(), NOW(), NOW(), 'user-admin', 'cat-tips'),
  ('post-3', 'DXIC Gelar Bakti Sosial di Panti Asuhan', 'dxic-gelar-bakti-sosial-di-panti-asuhan', '<p>DXIC kembali mengadakan kegiatan bakti sosial dengan mengunjungi panti asuhan di Jakarta.</p>', 'Kegiatan bakti sosial DXIC di panti asuhan Jakarta.', 'published', TRUE, NOW(), NOW(), NOW(), 'user-admin', 'cat-kegiatan');

-- Menus
INSERT IGNORE INTO Menu (id, name, location) VALUES
  ('menu-header', 'Header Menu', 'header'),
  ('menu-footer', 'Footer Menu', 'footer');

-- Page for profil
INSERT INTO Page (id, title, slug, content, status, createdAt, updatedAt)
SELECT 'page-profil', 'Profil', 'profil', '<h2>Tentang DXIC</h2><p>DXIC adalah komunitas pemilik mobil Daihatsu Xenia seluruh Indonesia.</p>', 'published', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM Page WHERE slug = 'profil');

-- Menu item for profil page
INSERT INTO MenuItem (id, label, pageId, menuId, menuOrder, isActive)
SELECT 'mi-profil', 'Profil', 'page-profil', 'menu-header', 0, TRUE
WHERE NOT EXISTS (SELECT 1 FROM MenuItem WHERE label = 'Profil' AND menuId = 'menu-header');

-- Testimonials
INSERT IGNORE INTO Testimonial (id, name, title, content, testOrder, isActive, createdAt, updatedAt) VALUES
  ('test-1', 'Andi Pratama', 'Anggota DXIC Jakarta', 'Bergabung dengan DXIC adalah pengalaman yang luar biasa!', 0, TRUE, NOW(), NOW()),
  ('test-2', 'Budi Santoso', 'Anggota DXIC Bandung', 'DXIC bukan sekadar komunitas, sudah seperti keluarga kedua.', 1, TRUE, NOW(), NOW()),
  ('test-3', 'Citra Dewi', 'Anggota DXIC Surabaya', 'Senang sekali bisa bergabung di DXIC.', 2, TRUE, NOW(), NOW()),
  ('test-4', 'Deni Nugroho', 'Anggota DXIC Yogyakarta', 'Kopdar pertama saya dengan DXIC sangat berkesan.', 3, TRUE, NOW(), NOW());

-- Settings
INSERT IGNORE INTO Setting (id, settingKey, settingValue) VALUES
  ('set-1', 'site_description', 'DXIC - Daihatsu Xenia Indonesia Club.'),
  ('set-2', 'site_keywords', 'DXIC, Xenia Club Indonesia, Daihatsu Xenia, Komunitas Xenia');
