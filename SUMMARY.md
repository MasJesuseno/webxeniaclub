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
│   ├── schema.prisma          # Schema database (16 tabel, MySQL)
│   ├── seed.ts                # Data awal (seeder)
│   ├── migrations/            # Riwayat migrasi database
│   │   └── 20260621084739_init/
│   │       └── migration.sql
│   └── seed.sql               # SQL dump untuk import manual
├── scripts/
│   └── seed-mysql.js          # Script seed alternatif
├── src/
│   ├── app/
│   │   ├── (public)/          # Layout publik (HeroNav header + Footer)
│   │   │   ├── page.tsx       # Halaman utama (hero, visi-misi, berita, galeri, testimoni, CTA)
│   │   │   ├── layout.tsx     # Layout publik (HeroNav + Footer + ColorTheme)
│   │   │   ├── home-carousel.tsx     # Client component carousel hero
│   │   │   ├── testimonial-carousel.tsx  # Client component carousel testimoni
│   │   │   ├── [slug]/        # Route dinamis halaman statis (Pages)
│   │   │   ├── profil/        # Halaman profil (tentang, visi, misi, statistik)
│   │   │   ├── berita/        # Halaman berita publik (+ detail [slug])
│   │   │   ├── galeri/        # Halaman galeri publik (+ detail album [slug])
│   │   │   └── kontak/        # Halaman kontak (form + info + medsos)
│   │   ├── admin/             # Panel admin (dilindungi middleware)
│   │   │   ├── page.tsx       # Dashboard (statistik real-time)
│   │   │   ├── layout.tsx     # Layout admin (sidebar + topbar)
│   │   │   ├── admin-sidebar.tsx  # Sidebar navigasi admin
│   │   │   ├── posts/         # ✅ CRUD postingan/berita
│   │   │   ├── categories/    # ✅ CRUD kategori
│   │   │   ├── contacts/      # ✅ Inbox pesan masuk
│   │   │   ├── pages/         # ✅ CRUD halaman statis
│   │   │   ├── menus/         # ✅ Menu builder multilevel
│   │   │   ├── albums/        # ✅ CRUD album galeri
│   │   │   ├── gallery/       # ✅ Upload foto per album
│   │   │   ├── testimonials/  # ✅ CRUD testimoni
│   │   │   ├── users/         # ✅ CRUD pengguna
│   │   │   ├── roles/         # ✅ CRUD role
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
│   │   ├── image-upload.tsx   # Upload gambar via URL
│   │   └── ...
│   ├── lib/
│   │   ├── actions.ts         # Server actions (CRUD semua modul)
│   │   ├── auth.ts            # Konfigurasi NextAuth (Credentials)
│   │   ├── auth-types.ts      # Type definitions untuk auth
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Fungsi utilitas (slugify, formatDate, dll)
│   └── middleware.ts           # Proteksi route /admin (redirect ke /login)
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

## 🗄️ Database Schema (16 Tabel — MySQL)

| Tabel | Key Fields | Deskripsi |
|-------|-----------|-----------|
| **User** | id, name, email, password, isActive | Admin users |
| **Role** | id, name, displayName, isSystem | Hak akses (Super Admin, Editor) |
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
| **Contact** | id, name, email, phone, subject, message (Text), isRead | Pesan dari form kontak |
| **Setting** | id, key (unique), value (Text) | Pengaturan key-value |
| **SiteProfile** | id, clubName, shortName, slogan, description, address, vision, mission, logo, dll. | Profil klub DXIC |

---

## ✅ Status Fitur

### 🌐 Website Publik (Semua ✅)

| Halaman | Fitur |
|---------|-------|
| **Beranda** | Hero carousel (slogan + berita unggulan), Tentang DXIC, Visi & Misi, Statistik, Berita Unggulan, Berita Terbaru, Album Galeri, Testimoni Carousel, CTA Bergabung |
| **Profil** | Tentang klub, statistik (anggota/kota/tahun), Visi & Misi lengkap |
| **Berita** | Daftar berita dengan filter kategori, card grid |
| **Detail Berita** | Breadcrumb, kategori, penulis, tanggal, konten HTML, gambar unggulan, berita terkait |
| **Galeri** | Grid foto terbaru, daftar album dengan cover |
| **Detail Album** | Grid foto per album dengan lightbox preview |
| **Kontak** | Form kirim pesan, info kontak (alamat/telepon/email), media sosial |
| **Halaman Statis** | Route dinamis /[slug] untuk halaman dari CMS |

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
| **Pesan Masuk** | Inbox, read/unread toggle, hapus |
| **Pengguna** | CRUD user, toggle aktif/nonaktif |
| **Role** | CRUD role, proteksi role sistem (tidak bisa dihapus) |
| **Pengaturan** | Form lengkap: info umum, logo/banner, visi-misi, kontak, statistik, media sosial |

### 🔧 Fitur Teknis

| Fitur | Status |
|-------|--------|
| Autentikasi (NextAuth Credentials) | ✅ |
| Proteksi rute admin (middleware) | ✅ |
| Responsive design (mobile/desktop) | ✅ |
| Rich text editor (ContentEditor) | ✅ |
| Upload gambar via URL | ✅ |
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
| **Contacts** | `submitContact`, `getContacts`, `markContactRead`, `deleteContact` |
| **Settings** | `getSetting`, `setSetting`, `getSiteProfile`, `updateSiteProfile` |
| **Users** | `getUsers`, `createUser`, `toggleUserActive`, `deleteUser` |
| **Roles** | `getRoles`, `createRole`, `deleteRole` |

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
- Migration: `prisma/migrations/20260621084739_init/`

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

> **Terakhir diupdate:** 21 Juni 2026
> **Project:** DXIC — Xeniaclub Website & CMS
> **Dibuat dengan:** Next.js 16 · TypeScript · Tailwind CSS v4 · Prisma 6 · MySQL 8.4 · NextAuth v5
