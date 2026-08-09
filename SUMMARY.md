# 🏫 DXIC — Xeniaclub Website & CMS — Project Summary

> **Proyek:** Website + Content Management System (CMS) untuk Xeniaclub (Daihatsu Xenia Indonesia Club / DXIC)
> **Domain:** xeniaclub.or.id
> **Slogan:** *Xenia Menyatukan Kita*
> **Warna Tema:** Merah (#DC2626), Putih, Hitam (#1F2937)

---

## 📋 Informasi Proyek

| Item | Detail |
|------|--------|
| **Nama Proyek** | DXIC Xeniaclub Website & CMS |
| **Direktori** | `D:\xeniaclub` |
| **Database** | MySQL 8.4 (`localhost:3306` / `xeniaclub`) |
| **User Database** | `root` (tanpa password — development) |
| **Port Development** | `http://localhost:3000` |
| **Node.js** | v24.16.0 |

---

## 🛠️ Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 16.2.9 | Framework React (App Router) |
| **TypeScript** | ^5 | Bahasa pemrograman |
| **Tailwind CSS** | v4 | Styling & utility classes |
| **Prisma** | 6.19.3 | ORM Database (MySQL) |
| **MySQL** | 8.4 | Database (`localhost:3306` / `xeniaclub`) |
| **NextAuth** | ^5.0.0-beta.31 | Autentikasi admin (Credentials provider) |
| **bcryptjs** | ^3.0.3 | Enkripsi password |
| **React** | ^19 | Library UI |
| **xlsx** | ^0.18+ | Export/Import Excel untuk Data Member |
| **nodemailer** | ^6 | Kirim email via SMTP (notifikasi) |

---

## 🚀 Perintah Penting

```bash
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm start            # Jalankan production server
npx tsc --noEmit     # Typecheck

# Database
npx prisma studio    # Buka GUI database browser
npx prisma db seed   # Isi ulang data awal
npx prisma migrate dev --name <nama>  # Migrasi database (setelah perubahan schema)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Sinkronisasi schema ke database (tanpa migrasi)

# MySQL (via CLI)
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql" -u root xeniaclub -e "SHOW TABLES;"
```

---

## 👤 Akun Default Admin

| Field | Value |
|-------|-------|
| **Email** | `admin@xeniaclub.or.id` |
| **Password** | `admin123` |
| **Role** | Super Admin + Editor |

> ⚠️ **WAJIB ganti password** sebelum deployment ke production!

---

## 📁 Struktur Proyek

```
📁 xeniaclub/
├── prisma/
│   ├── schema.prisma          # Schema database (18 tabel, MySQL)
│   ├── seed.ts                # Data awal (seeder)
│   ├── migrations/            # Riwayat migrasi database
│   │   ├── 20260621084739_init/
│   │   └── 20260622092323_add_partner_model/
│   └── seed.sql               # SQL dump untuk import manual
├── scripts/
│   └── seed-mysql.js          # Script seed alternatif
├── src/
│   ├── app/
│   │   ├── (public)/          # Layout publik (HeroNav header + Footer)
│   │   │   ├── page.tsx       # Halaman utama (hero, visi-misi, berita, galeri, testimoni, CTA)
│   │   │   ├── layout.tsx     # Layout publik (HeroNav + Footer + ColorTheme)
│   │   │   ├── home-carousel.tsx
│   │   │   ├── testimonial-carousel.tsx
│   │   │   ├── partner-carousel.tsx
│   │   │   ├── [slug]/        # Route dinamis halaman statis (Pages)
│   │   │   ├── profil/        # Halaman profil (tentang, visi, misi, statistik)
│   │   │   ├── berita/        # Halaman berita publik (+ detail [slug])
│   │   │   ├── galeri/        # Halaman galeri publik (+ detail album [slug])
│   │   │   └── kontak/        # Halaman kontak (form + info + medsos)
│   │   ├── admin/             # Panel admin (dilindungi proxy)
│   │   │   ├── page.tsx       # Dashboard (statistik real-time)
│   │   │   ├── layout.tsx     # Layout admin (sidebar + topbar)
│   │   │   ├── admin-sidebar.tsx  # Sidebar navigasi admin
│   │   │   ├── posts/         # ✅ CRUD postingan/berita
│   │   │   ├── categories/    # ✅ CRUD kategori
│   │   │   ├── pages/         # ✅ CRUD halaman statis
│   │   │   ├── menus/         # ✅ Menu builder multilevel
│   │   │   ├── albums/        # ✅ CRUD album galeri
│   │   │   ├── gallery/       # ✅ Upload foto per album
│   │   │   ├── testimonials/  # ✅ CRUD testimoni
│   │   │   ├── partners/      # ✅ CRUD mitra
│   │   │   ├── prospective-members/  # ✅ Data Member (CRUD, filter, Excel, Region)
│   │   │   ├── contacts/      # ✅ Inbox pesan masuk
│   │   │   ├── comments/      # ✅ Moderasi komentar
│   │   │   ├── users/         # ✅ CRUD pengguna
│   │   │   ├── roles/         # ✅ CRUD role + Atur Akses Menu (RBAC)
│   │   │   └── settings/      # ✅ Pengaturan website (profil club)
│   │   ├── login/             # Halaman login admin
│   │   ├── layout.tsx         # Root layout (font, globals)
│   │   └── globals.css        # Global styles + DXIC custom classes
│   ├── components/
│   │   ├── hero-nav.tsx       # Header + navigasi + mobile menu
│   │   ├── footer.tsx         # Footer 3 kolom (data dari DB)
│   │   ├── mobile-menu.tsx    # Client component menu mobile
│   │   ├── color-theme.tsx    # Inject CSS variable warna dinamis
│   │   ├── content-editor.tsx # Rich text editor (toolbar HTML)
│   │   ├── image-upload.tsx   # Upload gambar via URL/drag-drop
│   │   ├── member-form.tsx    # Form pendaftaran calon member publik
│   │   ├── join-member-button.tsx  # Tombol + modal form member
│   │   ├── math-captcha.tsx   # Verifikasi keamanan matematika
│   │   ├── comment-form.tsx   # Form komentar publik
│   │   └── comment-actions.tsx # Aksi komentar (admin)
│   ├── lib/
│   │   ├── actions.ts         # Server actions (CRUD semua modul)
│   │   ├── auth.ts            # Konfigurasi NextAuth (Credentials)
│   │   ├── auth-types.ts      # Type definitions untuk auth
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── admin-menu.ts      # Definisi menu admin + kunci permission (RBAC)
│   │   ├── permissions.ts     # Helper permission server-side (guard server action)
│   │   ├── math-captcha.ts    # Generate & validasi captcha
│   │   └── utils.ts           # Fungsi utilitas (slugify, formatDate, dll)
│   └── proxy.ts                # Proteksi route /admin (redirect ke /login)
├── prisma.config.ts            # Konfigurasi Prisma CLI (datasource url)
├── SUMMARY.md                  # File ini
├── AGENTS.md                   # Agent instructions untuk AI coding
├── CLAUDE.md                   # Claude instructions
├── package.json                # Dependencies & scripts
├── next.config.ts              # Konfigurasi Next.js
├── tsconfig.json               # Konfigurasi TypeScript
├── postcss.config.mjs          # Konfigurasi PostCSS/Tailwind
└── eslint.config.mjs           # Konfigurasi ESLint
```

---

## 🗄️ Database Schema (20 Tabel — MySQL)

| Tabel | Key Fields | Deskripsi |
|-------|-----------|-----------|
| **Barang** | id, nama, hargaBeli, hargaJual, stok, lokasi | Master barang (properti)
| **BarangTransaksi** | id, barangId, tanggal, jenis (Masuk/Keluar), jumlah, keterangan | Riwayat masuk/keluar barang (mengubah stok) |
| **User** | id, name, email, username, password, isActive | Admin users |
| **Role** | id, name, displayName, isSystem | Hak akses (Super Admin, Editor, Member, Bendahara) |
| **RolePermission** | id, roleId, permission | Akses menu admin per role (RBAC) |
| **UserRole** | userId, roleId | Relasi user ↔ role |
| **Post** | id, title, slug, content (Text), image, status, featured, authorId, categoryId, publishedAt | Artikel/berita |
| **Category** | id, name, slug, color | Kategori postingan |
| **Tag** | id, name, slug | Tag postingan |
| **PostTag** | postId, tagId | Relasi post ↔ tag |
| **Page** | id, title, slug, content (Text), layout, status | Halaman statis (route: /[slug]) |
| **Menu** | id, name, location (unique: header/footer) | Grup menu navigasi |
| **MenuItem** | id, label, url, pageId, parentId, menuId, order, isActive | Item menu multilevel |
| **Album** | id, title, slug, description, coverImage | Album galeri foto |
| **GalleryItem** | id, title, image, description, albumId | Foto dalam album |
| **Testimonial** | id, name, photo, content (Text), title, order, isActive | Testimoni anggota |
| **Partner** | id, name, logo, description, website, order, isActive | Mitra/sponsor |
| **Contact** | id, name, email, phone, subject, message (Text), isRead | Pesan dari form kontak |
| **Comment** | id, postId, name, email, content, isApproved | Komentar postingan |
| **Setting** | id, key (unique), value (Text) | Pengaturan key-value |
| **SiteProfile** | id, clubName, shortName, slogan, description, address, vision, mission, logo, dll. | Profil klub DXIC |
| **ProspectiveMember** | id, namaLengkap, noWa, email, jenisMobil, noPolisi, region, status, memberId | Data calon member / anggota DXIC |

---

## ✅ Status Fitur

### 🌐 Website Publik (Semua ✅)

| Halaman | Fitur |
|---------|-------|
| **Beranda** | Hero carousel (slogan + berita unggulan), Tentang DXIC, Visi & Misi, Statistik, Berita Unggulan, Berita Terbaru, Album Galeri, Testimoni Carousel, Partner Carousel, CTA Bergabung Member |
| **Profil** | Tentang klub, statistik (anggota/kota/tahun), Visi & Misi lengkap |
| **Berita** | Daftar berita dengan filter kategori, card grid |
| **Detail Berita** | Breadcrumb, kategori, penulis, tanggal, konten HTML, gambar unggulan, berita terkait, komentar |
| **Galeri** | Grid foto terbaru, daftar album dengan cover |
| **Detail Album** | Grid foto per album dengan lightbox preview |
| **Kontak** | Form kirim pesan, info kontak (alamat/telepon/email), media sosial, captcha |
| **Halaman Statis** | Route dinamis /[slug] untuk halaman dari CMS |
| **Gabung Member** | Form pendaftaran member (modal), upload dokumen, captcha |

### 🔐 Panel Admin (Semua ✅)

| Modul | Fitur |
|-------|-------|
| **Dashboard** | Statistik (postingan, kategori, album, testimoni, pesan, pengguna), daftar postingan & pesan terbaru |
| **Postingan** | CRUD lengkap, status (draft/published/archived), unggulan, kategori, ContentEditor (rich text), ImageUpload |
| **Kategori** | CRUD dengan warna kustom |
| **Halaman** | CRUD halaman statis dengan ContentEditor, layout, status |
| **Menu** | Menu builder multilevel (header/footer), pilih halaman atau URL manual |
| **Album** | CRUD album dengan cover image, deskripsi |
| **Galeri** | Upload foto per album, grid preview, grouped by album |
| **Testimoni** | CRUD testimoni, urutan, status aktif, foto |
| **Mitra** | CRUD mitra, logo, urutan, status aktif |
| **Data Member** | CRUD data member, filter (ID, Nama, Status, Kota, Provinsi, Region), export/import Excel, download template, kolom Region (admin only) |
| **Pesan Masuk** | Inbox, read/unread toggle, hapus |
| **Komentar** | Approve/unapprove, hapus komentar |
| **Pengguna** | CRUD user, toggle aktif/nonaktif |
| **Role** | CRUD role + **Atur Akses Menu (RBAC)** — centang menu yang boleh diakses tiap role; 4 role default (Super Admin, Editor, Member, Bendahara); role baru fleksibel dengan akses menu sendiri |
| **Pengaturan** | Form lengkap: info umum, logo/banner, visi-misi, kontak, statistik, media sosial |
| **Email SMTP** | Konfigurasi mail server (host, port, SSL, user, password, From) + tombol kirim email uji untuk memastikan SMTP berfungsi |
| **Master Barang** | CRUD barang: nama, harga beli, harga jual, stok awal, lokasi simpan; badge stok (habis/menipis/aman) |
| **Masuk/Keluar Barang** | Catat transaksi stok (barang, tanggal, jenis, jumlah, keterangan) — Masuk menambah & Keluar mengurangi stok otomatis; guard stok minus; hapus/edit transaksi menyesuaikan stok |

### 🔧 Fitur Teknis

| Fitur | Status |
|-------|--------|
| Autentikasi (NextAuth Credentials) | ✅ |
| Proteksi rute admin (proxy) | ✅ |
| Responsive design (mobile/desktop) | ✅ |
| Submenu mobile (dropdown di HP) | ✅ |
| Rich text editor (ContentEditor) | ✅ |
| Upload gambar via URL/drag-drop | ✅ |
| Math captcha (form publik) | ✅ |
| Export/Import Excel (Data Member) | ✅ |
| Download template Excel (Data Member) | ✅ |
| Filter multi-kriteria (Data Member) | ✅ |
| Halaman publik dynamic (data real-time) | ✅ |
| Database MySQL | ✅ |
| Seed data awal | ✅ |

---

## 🔌 API & Server Actions

Semua operasi CRUD menggunakan **Next.js Server Actions** (`"use server"`) yang terpusat di `src/lib/actions.ts`:

| Modul | Actions |
|-------|---------|
| **Auth** | `loginAction` |
| **Posts** | `getPosts`, `getPostBySlug`, `createPost`, `updatePost`, `deletePost` |
| **Categories** | `getCategories`, `createCategory`, `updateCategory`, `deleteCategory` |
| **Pages** | `getPages`, `getPageBySlug`, `createPage`, `updatePage`, `deletePage` |
| **Menus** | `getMenus`, `getMenuByLocation`, `createMenu`, `createMenuItem`, `deleteMenuItem`, `deleteMenu` |
| **Albums** | `getAlbums`, `getAlbumBySlug`, `createAlbum`, `updateAlbum`, `deleteAlbum` |
| **Gallery** | `createGalleryItem`, `deleteGalleryItem` |
| **Testimonials** | `getTestimonials`, `getActiveTestimonials`, `createTestimonial`, `updateTestimonial`, `deleteTestimonial` |
| **Partners** | `getPartners`, `getActivePartners`, `createPartner`, `updatePartner`, `deletePartner` |
| **Contacts** | `submitContact`, `getContacts`, `markContactRead`, `deleteContact` |
| **Comments** | `submitComment`, `approveComment`, `deleteComment`, `getCommentsByPost` |
| **Prospective Members** | `submitMemberRegistration`, `getProspectiveMembers`, `updateProspectiveMember`, `deleteProspectiveMember`, `importMembersData` |
| **Settings** | `getSetting`, `setSetting`, `getSiteProfile`, `updateSiteProfile` |
| **Email (SMTP)** | `saveEmailSettingsAction`, `testEmailSmtpAction` (+ lib `src/lib/email.ts`: `getEmailSettings`, `saveEmailSettings`, `sendEmail`) |
| **Users** | `getUsers`, `createUser`, `updateUser`, `toggleUserActive`, `deleteUser` |
| **Roles** | `getRoles`, `createRole`, `updateRolePermissions`, `deleteRole` |
| **Barang (Properti)** | `getBarangs`, `createBarang`, `updateBarang`, `deleteBarang`, `getBarangTransaksis`, `createBarangTransaksi`, `updateBarangTransaksi`, `deleteBarangTransaksi` (stok otomatis bertambah/berkurang) |

---

## 🎨 Tema & Styling

### Warna DXIC
- **Merah DXIC**: `#DC2626` (primary)
- **Merah Gelap**: `#B91C1C`
- **Hitam**: `#1F2937` (secondary)
- **Abu-abu**: Variasi `#F9FAFB` s.d. `#111827`

### CSS Classes Kustom
| Class | Fungsi |
|-------|--------|
| `.dxic-gradient` | Gradien merah→merah gelap→hitam |
| `.dxic-gradient-red` | Gradien merah solid |
| `.dxic-gradient-dark` | Gradien hitam solid |
| `.text-shadow` / `.text-shadow-lg` | Shadow untuk teks di atas gambar |
| `.editor-content` | Styling untuk konten HTML (headings, lists, blockquote, dll) |

---

## 💻 Environment Variables

File `.env`:

```env
DATABASE_URL="mysql://root@localhost:3306/xeniaclub"
```

> Untuk production, tambahkan:
> - `NEXTAUTH_SECRET` — Generate dengan `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
> - `NEXTAUTH_URL` — URL domain production
> - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET` — Google reCAPTCHA (opsional)

---

## 📝 Catatan Pengembangan

### Database
- MySQL berjalan di `localhost:3306`
- Service: MySQL84 (dapat di-start/stop via `net start MySQL84` / `net stop MySQL84`)
- Data directory: `C:\ProgramData\MySQL\MySQL Server 8.4\data`
- Untuk reset database: `npx prisma migrate reset --force`

### Prisma
- Menggunakan Prisma v6 (bukan v7) karena v7 membutuhkan driver adapter yang belum tersedia untuk MySQL
- Konfigurasi ada di `prisma.config.ts` (untuk CLI) dan `schema.prisma` (untuk runtime)
- Migration: `prisma/migrations/20260621084739_init/`, `prisma/migrations/20260622092323_add_partner_model/`, dan `prisma/migrations/20260806000000_add_role_permissions/`
- Sinkronisasi cepat: `npx prisma db push`
- **PascalCase model names**: Semua model menggunakan PascalCase (User, Post, Menu, dll.) — server Linux case-sensitive, Windows case-insensitive
- Semua `@id` fields punya `@default(cuid())`, semua `updatedAt` fields punya `@updatedAt`

### Catatan Migrasi (SQLite → MySQL)
Project ini sebelumnya menggunakan SQLite dan telah dimigrasi ke MySQL. Perubahan utama:
- Schema: `provider = "sqlite"` → `"mysql"` + `@db.Text` / `@db.VarChar()` annotations
- `src/lib/prisma.ts`: Hapus `@prisma/adapter-better-sqlite3`
- `prisma/seed.ts`: Hapus `PrismaBetterSqlite3` adapter
- `.env`: `file:./prisma/dev.db` → `mysql://root@localhost:3306/xeniaclub`

---

## 🔜 Rencana Pengembangan Selanjutnya

- [ ] Upload file/gambar langsung (bukan hanya URL)
- [ ] Image optimization dengan Next.js Image
- [ ] Pagination untuk postingan dan galeri
- [ ] Dark mode
- [ ] Google reCAPTCHA untuk form kontak & login
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Backup database otomatis (cron job)
- [ ] Production deployment ke hosting (pastikan MySQL service berjalan)

---

## 📋 Changelog

### 8 Agustus 2026 (Export Excel Riwayat Barang)
- **Feature**: Tombol **Export Excel** di tabel riwayat Masuk/Keluar Barang — mengekspor **semua** transaksi yang cocok dengan filter aktif (jenis, barang, rentang tanggal), tanpa dibatasi pagination, via server action `exportBarangTransaksis` (dilindungi RBAC)
- **Output**: kolom Nama Barang, Tanggal, Jenis, Jumlah, Keterangan (.xlsx)

### 8 Agustus 2026 (Filter & Pagination Riwayat Barang)
- **Feature**: Tabel riwayat Masuk/Keluar Barang kini punya **filter** (Jenis, Barang, rentang Tanggal) dan **pagination** (10 baris/halaman) — diproses server-side via query params (`page`, `jenis`, `barangId`, `dari`, `sampai`), sehingga riwayat tidak dimuat sekaligus walau data membesar
- **Kartu statistik** (Total Masuk/Keluar) ikut menyesuaikan dengan filter yang aktif

### 8 Agustus 2026 (Properti / Inventaris)
- **Feature**: **Grup Menu baru "Properti"** di panel admin berisi 2 menu:
  - **Master Barang** (`/admin/barang`) — CRUD data barang: Nama Barang, Harga Beli, Harga Jual, Stok, Lokasi Simpan (stok hanya berubah lewat transaksi)
  - **Masuk/Keluar Barang** (`/admin/barang-masuk-keluar`) — catat pergerakan stok: Nama Barang, Tanggal, Masuk/Keluar, Jumlah, Keterangan. **Masuk = stok bertambah, Keluar = stok berkurang** (ditolak bila stok tidak mencukupi). Hapus/edit transaksi otomatis menyesuaikan stok kembali.
- **Database**: tabel baru `Barang` & `BarangTransaksi` (migrasi `20260809000000_add_barang_models`), relasi cascade; sinkronisasi lewat `npx prisma db push`
- **RBAC**: permission baru `barang` & `barang-masuk-keluar`; super-admin otomatis punya akses, role Bendahara ikut di-seed (lihat `scripts/seed-roles.ts`)

### 6 Agustus 2026 (Email SMTP)
- **Feature**: **Pengaturan Email SMTP** di menu admin (Pengaturan → Email SMTP) — langkah awal untuk notifikasi pembayaran ke Bendahara
- **Fitur**: konfigurasi mail server (host, port, SSL/TLS, username, password, email & nama pengirim) + tombol **Kirim Email Uji** untuk memastikan SMTP berfungsi (menguji nilai form sebelum disimpan)
- **Keamanan**: password SMTP tidak pernah dikirim ke browser (hanya placeholder); server action dilindungi permission menu `email-settings`
- **Lib baru**: `src/lib/email.ts` — `getEmailSettings`, `saveEmailSettings`, `sendEmail` (siap dipakai untuk notifikasi berikutnya); dependency: `nodemailer`

### 6 Agustus 2026
- **Feature**: **Role-Based Access Control (RBAC) untuk menu admin** — setiap role bisa diatur menu mana yang boleh diakses
- **4 role default**: Super Admin (semua menu), Editor (konten), Member (dashboard saja), Bendahara (keuangan & register)
- **UI Role baru**: tombol "Atur Akses" per role → modal centang menu per section, bisa pilih semua/bagian; role baru dibuat langsung dengan pilihan akses menu
- **Proteksi berlapis**: sidebar menyaring menu sesuai permission (fresh dari DB per request di `admin/layout.tsx`) + redirect otomatis bila akses ke halaman tidak diizinkan + guard di server action (tidak bisa bypass via request langsung)
- **Database**: tabel baru `RolePermission` (migrasi `20260806000000_add_role_permissions`), script `scripts/seed-roles.ts` untuk sinkronisasi role default (idempotent)

### 30 Juni 2026
- **Fix**: Submenu mobile (dropdown child items) tidak muncul di HP — diperbaiki di `mobile-menu.tsx`
- **Fix**: Prisma schema — restore PascalCase model names, tambah `@default(cuid())` dan `@updatedAt`
- **Fix**: Seed file — perbaiki referensi lowercase ke PascalCase
- **Feature**: Halaman publik jadi **dynamic** (`force-dynamic`) — perubahan menu Footer/Header langsung muncul tanpa rebuild
- **Deploy**: Multiple deployment ke server 192.168.1.53 (via SSH + PM2)

### 1 Juli 2026
- **Fix**: Cover image postingan tidak tersimpan di production — penyebab: API `/api/upload` kurang error handling + hidden input controlled value rawan timing issue di React 19 `useActionState`. Solusi: tambah `try-catch` di upload route, ganti hidden input pakai `useRef` + direct DOM update di `post-form.tsx` dan `edit-form.tsx`
- **Deploy**: Fix cover image ke server 192.168.1.53 (3 file via SFTP + rebuild + PM2 restart)

### 1 Juli 2026 (Deploy Full — File & Database)
- **Deploy**: Full deployment file project (209 file) + database lokal ke server 192.168.1.53
- **Catatan**: Server Linux case-sensitive → dump MySQL dari Windows (lowercase) harus di-fix ke PascalCase sebelum import
- **Dump DB lokal**: `"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump" -u root --databases xeniaclub --routines --triggers --add-drop-database`
- **Fix case**: Gunakan script `fix-dump-case.js` untuk konversi lowercase → PascalCase (19 tabel)
- **Import di server**: `mysql -u root xeniaclub < /tmp/xeniaclub_dump_fixed.sql`
- **Deploy script**: `node deploy.js` untuk upload file + npm install + build + PM2 restart
- **Status**: HTTP 200 OK, 19 tabel aktif, app berjalan di PM2

---

> **Terakhir diupdate:** 8 Agustus 2026
> **Project:** DXIC — Xeniaclub Website & CMS
> **Dibuat dengan:** Next.js 16 · TypeScript · Tailwind CSS v4 · Prisma 6 · MySQL 8.4 · NextAuth v5
