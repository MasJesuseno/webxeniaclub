# 🏫 SMA Annajah — Website & CMS — Project Summary

> **Proyek:** Website + Content Management System (CMS) untuk SMA Annajah
> **Dibuat dengan:** Next.js 16 · TypeScript · Tailwind CSS v4 · Prisma 6 (MySQL) · NextAuth v5

---

## 📋 Informasi Proyek

| Item | Detail |
|------|--------|
| **Nama Proyek** | SMA Annajah Website & CMS |
| **Direktori** | `D:\\Web Annajah` |
| **Database** | MySQL 8.0.30 (`localhost:3306` / `webannajah`) |
| **User Database** | `root` (tanpa password) |
| **Port Development** | `http://localhost:3000` |

---

## 🛠️ Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 16.2.9 | Framework React (App Router) |
| **TypeScript** | ^5 | Bahasa pemrograman |
| **Tailwind CSS** | v4 | Styling & utility classes |
| **Prisma** | 6.19.3 | ORM Database |
| **MySQL** | 8.0.30 | Database (`localhost:3306` / `webannajah`) |
| **NextAuth** | ^5.0.0-beta.31 | Autentikasi admin |
| **bcryptjs** | ^3.0.3 | Enkripsi password |
| **React** | 19.2.4 | Library UI |
| **react-google-recaptcha** | - | Google reCAPTCHA v2 (keamanan form) |

---

## 🚀 Perintah Penting

```bash
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm start            # Jalankan production server
npx tsc --noEmit     # Typecheck
npx prisma studio    # Buka GUI database browser
npx prisma db seed   # Isi ulang data awal
npx prisma migrate dev --name <nama>  # Migrasi database
npx prisma generate  # Generate Prisma client

# MySQL
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql" -u root webannajah -e "SELECT * FROM user;"
```

---

## 👤 Akun Default Admin

| Field | Value |
|-------|-------|
| **Email** | `admin@smaannajah.sch.id` |
| **Password** | `admin123` |
| **Role** | Super Admin + Editor |

> ⚠️ **Wajib ganti password** sebelum deployment ke production!

---

## 📁 Struktur Proyek

```
📁 Web Annajah/
├── prisma/
│   ├── schema.prisma          # Schema database (16 tabel, MySQL)
│   ├── seed.ts                # Data awal (seeder)
│   └── migrations/            # Riwayat migrasi database (2 migrasi MySQL)
├── src/
│   ├── app/
│   │   ├── (public)/          # Layout publik (HeroNav header + Footer)
│   │   │   ├── [slug]/        # Route dinamis halaman statis (Pages)
│   │   │   ├── profil/        # Halaman profil
│   │   │   ├── berita/        # Halaman berita publik
│   │   │   ├── galeri/        # Halaman galeri publik
│   │   │   └── kontak/        # Halaman kontak (+ Google Maps, Google reCAPTCHA)
│   │   ├── admin/             # Panel admin
│   │   │   ├── dashboard/     # Dashboard statistik
│   │   │   ├── posts/         # CRUD postingan/berita
│   │   │   ├── categories/    # Kelola kategori
│   │   │   ├── tags/          # Kelola tag
│   │   │   ├── pages/         # Halaman statis (dengan ContentEditor)
│   │   │   ├── menus/         # Menu builder multilevel
│   │   │   ├── gallery/       # Galeri foto (dengan edit mode)
│   │   │   ├── albums/        # Album galeri
│   │   │   ├── alumni/        # ✅ Testimoni Alumni (CRUD + foto)
│   │   │   ├── users/         # Manajemen pengguna
│   │   │   ├── roles/         # Role management
│   │   │   ├── contacts/      # Inbox pesan
│   │   │   └── settings/      # Pengaturan website (3 tab + Jam Operasional + URL PPDB)
│   │   ├── login/             # Halaman login admin (+ Google reCAPTCHA)
│   │   ├── page.tsx           # Halaman utama (hero, visi-misi, berita, galeri, ALUMNI, CTA + Footer)
│   │   ├── layout.tsx         # Root layout (font, color theme)
│   │   └── globals.css        # Global styles + section utilities
│   ├── components/
│   │   ├── footer.tsx         # Footer 3 kolom (self-contained, ambil data dari DB)
│   │   ├── hero-nav.tsx       # Header seragam (HeroNav + slogan) + tombol Daftar (URL dari DB)
│   │   ├── mobile-menu.tsx    # Client component menu mobile
│   │   ├── color-theme.tsx    # Inject CSS variable warna
│   │   ├── font-style.tsx     # Inject CSS variable font
│   │   ├── breadcrumb.tsx     # Breadcrumb component
│   │   ├── content-editor.tsx # Rich text editor (toolbar B,I,U,H2,H3,list,link,gambar,HR,kode)
│   │   ├── image-upload.tsx   # Reusable upload gambar (drag-drop, preview, validasi)
│   │   └── gallery-image.tsx  # Client component gambar galeri (fix onError Server Component)
│   ├── lib/
│   │   ├── actions.ts         # Server actions (CRUD semua modul)
│   │   ├── auth.ts            # Konfigurasi NextAuth (+ verifikasi Google reCAPTCHA)
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── utils.ts           # Fungsi utilitas (slugify, dll)
│   │   ├── recaptcha.ts       # ✅ Utility verifikasi Google reCAPTCHA server-side
│   │   └── color-palette.ts   # Preset warna untuk tema
│   └── middleware.ts           # Proteksi route /admin
├── public/uploads/            # Folder upload gambar
├── .env.local                 # Environment variables (reCAPTCHA keys, NextAuth)
├── SUMMARY.md                 # File ini
├── README.md                  # Dokumentasi proyek
├── package.json               # Dependencies & scripts
├── next.config.ts             # Konfigurasi Next.js
├── tsconfig.json              # Konfigurasi TypeScript
├── postcss.config.mjs         # Konfigurasi PostCSS/Tailwind
└── eslint.config.mjs          # Konfigurasi ESLint
```

---

## 🗄️ Database Schema (16 Tabel)

| Tabel | Key Fields | Deskripsi |
|-------|-----------|-----------|
| **User** | id, name, email, password, isActive | Admin users |
| **Role** | id, name, displayName, isSystem | Hak akses |
| **UserRole** | userId, roleId | Relasi user ↔ role |
| **Post** | id, title, slug, content, image, status, featured, authorId, categoryId, publishedAt | Artikel/berita |
| **Category** | id, name, slug, color | Kategori postingan |
| **Tag** | id, name, slug | Tag postingan |
| **PostTag** | postId, tagId | Relasi post ↔ tag |
| **Page** | id, title, slug, content, layout, status | Halaman statis (route: /[slug]) |
| **Menu** | id, name, location | Grup menu navigasi |
| **MenuItem** | id, label, url, pageId, parentId, menuId, order, isActive | Item menu multilevel |
| **Album** | id, title, slug, coverImage | Album galeri |
| **GalleryItem** | id, title, image, description, albumId, type | Gambar/video galeri |
| **Alumni** | id, name, photo, testimonial, graduationYear, order, isActive | ✅ Testimoni alumni |
| **Contact** | id, name, email, phone, subject, message, isRead | Pesan kontak |
| **Setting** | id, key, value | Pengaturan key-value |
| **SiteProfile** | id, schoolName, shortName, slogan, description, address, phone, email, logo, favicon, vision, mission, about, history, primaryColor, homeBanner, homeBannerBrightness, teacherCount, studentCount, establishedYears, achievementCount, youtubeUrl, instagramUrl, facebookUrl, twitterUrl, headingFont, bodyFont, baseFontSize, headingWeight, feature1Title, feature1Description, feature2Title, feature2Description, feature3Title, feature3Description, operationalHours, ppdbUrl | Profil sekolah + semua pengaturan (termasuk jam operasional & URL PPDB) |

---

## ✨ Fitur Lengkap

### 🌐 Website Publik

| Halaman | Route | Fitur |
|---------|-------|-------|
| **Beranda** | `/` | Hero banner (constrained width), berita unggulan, visi-misi + 3 poin unggulan, berita terbaru, galeri preview, **✅ testimoni alumni**, CTA, Footer |
| **Profil** | `/profil` | Tentang, visi-misi, sejarah, kontak (HTML dari ContentEditor) |
| **Berita** | `/berita` | Daftar artikel dengan filter kategori |
| **Detail Berita** | `/berita/[slug]` | Konten lengkap + breadcrumb + artikel terkait |
| **Galeri** | `/galeri` | Album galeri + foto terbaru |
| **Detail Album** | `/galeri/[slug]` | Galeri per-album |
| **Kontak** | `/kontak` | ✅ Form kirim pesan + Google reCAPTCHA + Google Maps + info kontak + jam operasional dari database |
| **Halaman Statis** | `/[slug]` | Route dinamis untuk halaman dari Menu Pages (Dewan Guru, Ekstrakurikuler, dll) |

### 🔐 Panel Admin (`/admin/*`)

| Modul | Route | Fitur |
|-------|-------|-------|
| **Dashboard** | `/admin` | Statistik: total postingan, pesan, pengguna, galeri |
| **Postingan** | `/admin/posts` | CRUD artikel, kategori, tags, status (draft/published/archived), unggulan. Rich text editor dengan toolbar formatting + insert gambar langsung dari editor |
| **Kategori** | `/admin/categories` | CRUD kategori dengan warna kustom |
| **Tags** | `/admin/tags` | CRUD tag |
| **Halaman** | `/admin/pages` | CRUD halaman statis dengan ContentEditor + layout options |
| **Menu** | `/admin/menus` | Menu builder multilevel (terintegrasi dengan footer) |
| **Galeri** | `/admin/gallery` | Upload gambar + edit mode (update title, image, description, album) |
| **Album** | `/admin/albums` | CRUD album dengan upload cover image |
| **Alumni** | `/admin/alumni` | ✅ CRUD testimoni alumni dengan upload foto, nama, tahun lulus, testimoni |
| **Pengguna** | `/admin/users` | CRUD pengguna, atur role, aktif/nonaktifkan |
| **Roles** | `/admin/roles` | Role management (Super Admin, Editor, Penulis) |
| **Pesan Masuk** | `/admin/contacts` | Inbox dengan fitur read/unread, detail, hapus |
| **Pengaturan** | `/admin/settings` | **3 tab:** Informasi Umum (data sekolah, kontak, **✅ jam operasional**, **✅ URL PPDB**, visi-misi, statistik, 3 poin unggulan, logo, favicon, banner), Tampilan & Warna (primary color, preview), Font & Tipografi (heading/body font, ukuran, ketebalan, preview) |

### 🧩 Komponen Reusable

| Komponen | File | Fungsi |
|----------|------|--------|
| **HeroNav** | `src/components/hero-nav.tsx` | Header seragam di semua halaman — logo + nama + slogan, menu statis, mobile menu, **✅ tombol Daftar Sekarang (URL dari database)** |
| **Footer** | `src/components/footer.tsx` | Footer 3 kolom: Ringkasan + Navigasi (dari Menu Builder) + Kontak (dari database). Self-contained async Server Component |
| **MobileMenu** | `src/components/mobile-menu.tsx` | Client component untuk menu mobile (dengan onClick handler) |
| **ContentEditor** | `src/components/content-editor.tsx` | Rich text editor dengan toolbar: **B**, *I*, <u>U</u>, H2, H3, list, OL, link, insert gambar, HR, code. Upload gambar langsung dari editor |
| **ImageUpload** | `src/components/image-upload.tsx` | Upload gambar dengan drag-drop, preview, validasi tipe/ukuran, toggle URL fallback, hapus gambar existing di mode edit |
| **GalleryImage** | `src/components/gallery-image.tsx` | Client component untuk `<img>` dengan onError handler (solusi Next.js 16 Server Component) |
| **FontStyle** | `src/components/font-style.tsx` | Inject CSS variables font dari database |
| **ColorTheme** | `src/components/color-theme.tsx` | Inject CSS variables warna dari database |
| **Breadcrumb** | `src/components/breadcrumb.tsx` | Breadcrumb navigasi |

---

## 🎨 Fitur Kustomisasi

### Warna
- **Primary Color**: Bisa diubah dari Pengaturan > Tampilan & Warna
- **11 Preset Warna**: Biru, Hijau, Merah, Ungu, Orange, Teal, Pink, Cyan, Abu-abu, Emerald, Indigo
- **Color Picker Kustom**: Warna bebas
- **Live Preview**: Pratinjau langsung di form pengaturan

### Font & Tipografi
- **Font Judul (Heading)**: 6 pilihan (Inter, Plus Jakarta Sans, Poppins, Roboto, Merriweather, Lora)
- **Font Body**: 6 pilihan yang sama
- **Ukuran Font Dasar**: 14px - 18px
- **Ketebalan Heading**: 600 - 900
- **Live Preview**: Pratinjau font di form pengaturan

### Banner
- **Upload banner** untuk halaman utama
- **Brightness control** (0-100%) untuk overlay gelap
- **✅ Constrained width** — banner selebar area konten header (max-w-7xl, terpusat)
- **✅ Tinggi dikurangi** — padding hero content diperkecil

### 3 Poin Unggulan
- **Judul & Deskripsi** masing-masing poin bisa diedit dari Pengaturan
- Default: Pendidikan Berkualitas, Pengembangan Karakter, Prestasi & Inovasi

### ✅ Jam Operasional
- Bisa diedit dari **Pengaturan > Informasi Umum > Kontak > Jam Operasional**
- Tampil di halaman Kontak (fallback: "Senin - Jumat: 07:00 - 16:00 WIB")

### ✅ URL PPDB / Daftar Sekarang
- Tombol "Daftar Sekarang" URL bisa diubah dari **Pengaturan > Informasi Umum > Tombol Daftar Sekarang**
- Berlaku di HeroNav (desktop & mobile) dan CTA section

### ✅ Testimoni Alumni
- **Admin panel**: CRUD dengan foto, nama, tahun lulus, testimoni
- **Halaman utama**: Section "Kata Alumni" (di bawah Galeri) — menampilkan foto + nama + testimoni + bintang

### ✅ Keamanan Form
- **Google reCAPTCHA v2** di halaman **Login** (cek brute-force bot)
- **Google reCAPTCHA v2** di form **Kontak** (cegah spam pesan)
- Verifikasi token server-side di `src/lib/recaptcha.ts`

### ✅ Google Maps
- Embedded map lokasi **Yayasan Keluarga Besar Annajah** di halaman Kontak
- Tombol "Buka di Google Maps" (link ke Google Maps)

### Header (HeroNav)
- **Seragam** di semua halaman publik
- **Logo + Nama + Slogan** — tata letak rapi
- **Menu statis**: Beranda, Profil, Berita, Galeri, Kontak
- **✅ Tombol CTA**: Daftar Sekarang (link ke URL PPDB dari database)
- **Mobile responsive**: Fullscreen mobile menu

### Footer
- **3 Kolom**: Ringkasan SMA Annajah, Navigasi (dari Menu Builder), Kontak (dari database)
- **Navigasi dinamis**: Mengambil menu items dari Menu Builder — jika ada halaman baru ditambahkan, otomatis muncul
- **Fallback**: Jika belum ada menu, tampilkan link Profil, Berita, Galeri, Kontak
- **Social Media Icons**: Facebook, Instagram, YouTube
- **Contact Info**: Alamat, Telepon (link tel:), Email (link mailto:), Website

---

## 📝 Catatan Penting

### Database
- Menggunakan **MySQL 8.0.30** di `localhost:3306`
- **Nama database:** `webannajah`
- **User:** `root` (tanpa password)
- Untuk **production**, ganti user & password atau gunakan PostgreSQL
- Data lama dari SQLite sudah dimigrasikan ke MySQL
- Jangan lupa tambahkan `.env` ke `.gitignore`

### Environment Variables (`.env`)
```env
# Database (MySQL)
DATABASE_URL="mysql://root@localhost:3306/webannajah"

# Google reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lf...
RECAPTCHA_SECRET=6Lf...

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### MySQL Server
- MySQL Server 8.4.9 terinstall di `C:\Program Files\MySQL\MySQL Server 8.4\`
- **Service:** `MySQL84` (register sebagai Windows service)
- **Data directory:** `D:\Web Annajah\mysql-data\`
- **Client:** `"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql" -u root`

### Keamanan
- Ganti `NEXTAUTH_SECRET` di `.env` untuk production
- Ganti password admin default (`admin123`) segera
- Route `/admin/*` diproteksi oleh `middleware.ts`
- ✅ Google reCAPTCHA v2 melindungi login dan form kontak dari spam

### Upload File
- File gambar diupload ke `/public/uploads/`
- Melalui endpoint API `/api/upload`
- Format didukung: JPG, PNG, WebP, GIF, SVG
- Maksimal ukuran: 5MB

### Next.js 16 Notes
- **Server Components** tidak bisa punya event handler (onClick, onError, dll)
- Gunakan **Client Component** terpisah untuk interaktivitas
- **Dynamic route `[slug]`** — explicit route (profil, berita, dll) prioritas di atas slug dinamis
- **Params harus `Promise`**: `params: Promise<{ slug: string }>` + `await params` (Next.js 16)

---

## 🔜 Rencana Pengembangan

- [ ] Image optimization dengan `next/image`
- [ ] Pagination untuk postingan dan galeri
- [ ] Role-based access control per halaman admin
- [ ] Mode gelap (dark mode)
- [ ] Media library / file manager
- [ ] Statistik & analytics dashboard
- [ ] Multi-language (i18n)
- [ ] Backup & restore database
- [ ] Deployment ke production (Vercel / hosting sendiri)

---

## 📊 Migrasi Database (Riwayat)

| No | Nama Migrasi | Perubahan |
|----|-------------|-----------|
| 1 | `init_mysql` | ✅ Migrasi dari SQLite → MySQL. Inisialisasi semua tabel (16 tabel) |
| 2 | `fix_text_columns` | ✅ Perbaikan kolom VARCHAR menjadi TEXT untuk menampung konten HTML panjang (Post.content, Page.content, Setting.value, SiteProfile.*, Contact.message, Alumni.testimonial) |

---

_Dibuat dengan ❤️ untuk SMA Annajah · Last updated: June 2026_
