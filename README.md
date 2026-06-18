# 🏫 SMA Annajah — Website & CMS

Website dan Content Management System (CMS) modern untuk SMA Annajah. Dibangun dengan **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **Prisma 6** (SQLite), dan **NextAuth v5**.

---

## ✨ Fitur Lengkap

### 🌐 Website Publik

| Halaman | Deskripsi |
|---------|-----------|
| **Beranda** | Hero section, statistik sekolah, berita unggulan, visi-misi, berita terbaru, galeri preview, CTA |
| **Profil** | Tentang kami, visi & misi, sejarah, informasi kontak |
| **Berita** | Daftar artikel dengan filter kategori |
| **Detail Berita** | Konten lengkap, breadcrumb, artikel terkait |
| **Galeri** | Album galeri + foto terbaru |
| **Detail Album** | Galeri per-album |
| **Kontak** | Form kirim pesan + info kontak dinamis dari database |

### 🔐 Panel Admin (`/admin/*`)

| Modul | Fitur |
|-------|-------|
| **Dashboard** | Statistik real-time (total postingan, pesan, pengguna, galeri) |
| **Postingan** | CRUD artikel/berita, kategori, tags, status (draft/published/archived), unggulan |
| **Kategori** | Kelola kategori dengan warna |
| **Tags** | Kelola tag untuk postingan |
| **Halaman** | CRUD halaman statis dengan konten HTML |
| **Menu** | Menu builder multilevel untuk navigasi website |
| **Galeri** | Upload gambar per album |
| **Album** | Kelompokkan galeri ke dalam album |
| **Pengguna** | CRUD pengguna, atur role, aktif/nonaktifkan akun |
| **Roles** | Role management (Super Admin, Editor, Penulis) |
| **Pesan Masuk** | Inbox dengan fitur read/unread, detail pesan |
| **Pengaturan** | Profil sekolah (nama, alamat, kontak, visi-misi, medsos, logo) |

---

## 🛠️ Tech Stack

| Teknologi | Versi |
|-----------|-------|
| **Next.js** | 16.x (App Router) |
| **TypeScript** | 5.x |
| **Tailwind CSS** | v4 |
| **Prisma** | 6.x (ORM) |
| **SQLite** | Database lokal |
| **NextAuth** | v5 (beta) — Autentikasi |
| **bcryptjs** | Enkripsi password |

---

## 🚀 Cara Menjalankan

### 1. Install dependencies

```bash
cd "D:/Web Annajah"
npm install
```

### 2. Setup database

Database sudah siap dengan migrasi dan seed data. Jika ingin mengatur ulang:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Jalankan development server

```bash
npm run dev
```

Buka **http://localhost:3000** di browser.

---

## 👤 Akun Default (Admin)

| Akun | Keterangan |
|------|-----------|
| **Email** | `admin@smaannajah.sch.id` |
| **Password** | `admin123` |
| **Role** | Super Admin + Editor |

> **⚠️ Peringatan:** Ganti password default ini segera setelah deployment ke production!

---

## 📂 Struktur Proyek

```
📁 prisma/
├── schema.prisma          # Schema database
├── seed.ts                # Data awal (seeder)
└── dev.db                 # Database SQLite

📁 src/
├── app/
│   ├── (public)/          # Layout website publik (header, footer)
│   ├── admin/             # Halaman panel admin
│   │   ├── dashboard/
│   │   ├── posts/
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── pages/
│   │   ├── menus/
│   │   ├── gallery/
│   │   ├── albums/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── contacts/
│   │   └── settings/
│   ├── berita/            # Halaman berita publik
│   ├── galeri/            # Halaman galeri publik
│   ├── profil/            # Halaman profil
│   ├── kontak/            # Halaman kontak
│   └── login/             # Halaman login admin
├── lib/
│   ├── auth.ts            # Konfigurasi NextAuth
│   ├── prisma.ts          # Prisma client singleton
│   ├── utils.ts           # Fungsi utilitas
│   └── actions.ts         # Server actions (CRUD)
└── middleware.ts           # Proteksi route /admin
```

---

## 📊 Database Schema

| Tabel | Deskripsi |
|-------|-----------|
| **User** | Admin users |
| **Role** | Role/hak akses |
| **UserRole** | Relasi user ↔ role |
| **Post** | Artikel/berita |
| **Category** | Kategori postingan |
| **Tag** | Tag postingan |
| **PostTag** | Relasi post ↔ tag |
| **Page** | Halaman statis |
| **Menu** | Grup menu navigasi |
| **MenuItem** | Item menu (mendukung multilevel) |
| **Album** | Album galeri |
| **GalleryItem** | Gambar/video galeri |
| **Contact** | Pesan dari form kontak |
| **Setting** | Pengaturan key-value |
| **SiteProfile** | Profil sekolah |

---

## 📦 Scripts

```bash
npm run dev       # Jalankan development server
npm run build     # Build untuk production
npm start         # Jalankan production server
npm run lint      # Cek kode dengan ESLint
npx prisma studio # Buka GUI database browser
npx prisma db seed # Isi ulang data awal
```

---

## 🔜 Pengembangan Selanjutnya

- [ ] Upload file/gambar (bukan hanya URL)
- [ ] Role-based access control di setiap halaman admin
- [ ] Pagination untuk postingan dan galeri
- [ ] Image optimization dengan Next.js Image
- [ ] Mode gelap (dark mode)
- [ ] Manajemen file/media library
- [ ] Statistik & analytics
- [ ] Multi-language (i18n)
- [ ] Backup & restore database

---

## 📝 Catatan

- Database menggunakan **SQLite** (file `prisma/dev.db`) — cocok untuk development.
- Untuk production, ganti ke **PostgreSQL** atau **MySQL** untuk performa lebih baik.
- Ubah `NEXTAUTH_SECRET` di `.env` untuk production.
- Pastikan `prisma/dev.db` dan `.env` masuk dalam `.gitignore`.

---

_Dibuat dengan ❤️ untuk SMA Annajah_
