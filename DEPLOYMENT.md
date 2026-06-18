# 🚀 Panduan Deployment — SMA Annajah ke Hostinger / Niagahoster

> **Panduan langkah demi langkah untuk deploy Website + CMS SMA Annajah ke hosting Hostinger atau Niagahoster (cPanel/hPanel)**

---

## 📋 Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Persiapan Environment Variables](#2-persiapan-environment-variables)
3. [Persiapan Database di Hostinger](#3-persiapan-database-di-hostinger)
4. [Upload Kode ke Hostinger](#4-upload-kode-ke-hostinger)
5. [Konfigurasi Node.js App di hPanel](#5-konfigurasi-nodejs-app-di-hpanel)
6. [Migrasi Database Production](#6-migrasi-database-production)
7. [Setup Domain & SSL](#7-setup-domain--ssl)
8. [Pengaturan Awal (Pertama Kali)](#8-pengaturan-awal-pertama-kali)
9. [Update Konten Berkala](#9-update-konten-berkala)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prasyarat

Sebelum mulai, pastikan Anda sudah memiliki:

### ✅ Akun Hostinger / Niagahoster

- **Paket**: **Business** atau **Cloud** (Node.js Web App hanya tersedia di paket ini)
- Jika masih pakai paket Premium/Basic, Anda perlu **upgrade** ke Business/Cloud
- Login ke hPanel: `https://hpanel.hostinger.com` (atau niagahoster.co.id untuk Niagahoster)

### ✅ Domain

- Domain sudah terdaftar (misal: `smaannajah.sch.id`)
- DNS sudah mengarah ke Hostinger (nameserver Hostinger)
- Bisa cek di hPanel > Domains

### ✅ Persiapan Lokal

```bash
# Pastikan project bisa build di lokal
npm run build

# Pastikan typecheck lulus
npx tsc --noEmit
```

### ✅ Git Repository (Opsional, tapi direkomendasikan)

Buat repository di GitHub/GitLab untuk memudahkan deployment:

```bash
# Di direktori project
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/sma-annajah.git
git push -u origin main
```

---

## 2. Persiapan Environment Variables

Buat file `.env.production` di project lokal sebagai referensi. **Jangan commit file ini ke git!**

```env
# ============================================
# DATABASE — MySQL Hostinger
# ============================================
# Ganti dengan credential MySQL dari Hostinger (lihat step 3)
DATABASE_URL="mysql://username:password@hostinger-mysql-host:3306/u123456789_webannajah"

# ============================================
# GOOGLE reCAPTCHA v2
# ============================================
# Buat di https://www.google.com/recaptcha/admin
# Pilih reCAPTCHA v2 > "I'm not a robot" Checkbox
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Ld...
RECAPTCHA_SECRET=6Ld...

# ============================================
# NEXTAUTH — Security untuk session admin
# ============================================
# Generate random string: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET=your-random-secret-key-minimum-32-chars
# Ganti dengan URL domain production
NEXTAUTH_URL=https://smaannajah.sch.id
```

### 🔑 Cara Generate `NEXTAUTH_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6... (64 karakter hex)
```

---

## 3. Persiapan Database di Hostinger

### 3.1 Buat Database MySQL

1. Login ke **hPanel** Hostinger
2. Buka **Websites** → Pilih website Anda
3. Di sidebar kiri, cari **Database** → **MySQL Databases**
4. Klik **Create Database**
5. Isi form:
   - **Database Name**: `webannajah` (atau `u123456789_webannajah`)
   - **Username**: Buat username baru (misal: `u123456789_annajah`)
   - **Password**: Buat password kuat (min 8 karakter, kombinasi huruf & angka)
   - Biarkan **Remote Access**: `Local` saja (lebih aman)
6. Klik **Create**

### 3.2 Catat Credential Database

Setelah database dibuat, catat informasi ini — akan dipakai di `DATABASE_URL`:

| Field | Contoh Value |
|-------|-------------|
| **Host** | `localhost` atau `mysql.hostinger.com` |
| **Port** | `3306` |
| **Database** | `u123456789_webannajah` |
| **Username** | `u123456789_annajah` |
| **Password** | `P@ssw0rd123!` |

### 3.3 DATABASE_URL Final

Gabungkan menjadi:

```
DATABASE_URL="mysql://u123456789_annajah:P@ssw0rd123!@localhost:3306/u123456789_webannajah"
```

> ⚠️ **Catatan Penting**: Jika ada karakter spesial di password (seperti `@`, `:`, `/`, `%`, `#`), Anda perlu **URL-encode** karakter tersebut:
> - `@` → `%40`
> - `:` → `%3A`
> - `/` → `%2F`
> - `#` → `%23`
> - `%` → `%25`
>
> Contoh: Password `P@ssw0rd!` → `DATABASE_URL="mysql://u123456789_annajah:P%40ssw0rd%21@localhost:3306/u123456789_webannajah"`

---

## 4. Upload Kode ke Hostinger

Ada **2 cara** upload kode ke Hostinger:

### 🔶 Cara A: GitHub Integration (Rekomendasi)

Cara termudah karena Hostinger akan auto-deploy setiap kali push ke GitHub.

1. Di **hPanel** → **Websites** → Klik **Add Website**
2. Pilih **Node.js Web App** → **Import Git Repository**
3. Login ke GitHub dan authorize Hostinger
4. Pilih repository `sma-annajah`
5. Pilih branch `main`
6. Hostinger akan otomatis clone repository Anda

### 🔶 Cara B: Upload ZIP (Manual)

1. Di **lokal**, build project:

```bash
npm run build
```

2. Buat file ZIP dari project (kecuali `node_modules`, `.next`, `dev.db`):

```bash
# Di Windows (PowerShell):
Compress-Archive -Path .\* -DestinationPath ..\sma-annajah.zip -Exclude node_modules,.next,dev.db,.env

# Atau manual: hapus node_modules dan .next dulu
rm -rf node_modules .next
# lalu zip semua file
```

3. Di **hPanel** → **Websites** → Pilih website
4. Klik **Add Website** → **Node.js Web App** → **Upload ZIP**
5. Drag & drop file ZIP Anda
6. Hostinger akan extract dan setup project

> ⚠️ **PENTING**: Pastikan file `.env` TIDAK ikut terupload! Hostinger akan pakai environment variables dari hPanel.

---

## 5. Konfigurasi Node.js App di hPanel

Setelah kode terupload, atur konfigurasi Node.js:

### 5.1 Setup Node.js App

1. Di **hPanel** → **Websites** → Pilih website
2. Sidebar kiri → **Node.js** (atau **Advanced** → **Node.js Web Apps**)
3. Jika sudah ada app dari step upload, klik **Manage**
4. Atau klik **Create Node.js App** jika belum

### 5.2 Pengaturan Dasar

| Setting | Value |
|---------|-------|
| **Node.js Version** | Pilih **20.x** (atau 22.x) |
| **Application Mode** | `Production` |
| **Application Root** | `/` (root domain) atau kustom path |
| **Entry file** | `node_modules/next/dist/bin/next` (default) |
| **Application URL** | Domain Anda (misal `smaannajah.sch.id`) |

### 5.3 Build Settings (Jika Auto-detect Gagal)

Jika Hostinger tidak auto-detect Next.js:

| Field | Value |
|-------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Start Command** | `npm start` |

### 5.4 Environment Variables di hPanel

1. Cari bagian **Environment Variables** atau **Env Vars**
2. Klik **Add Variable** dan masukkan satu per satu:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `mysql://u123456789_annajah:P@ssw0rd123!@localhost:3306/u123456789_webannajah` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `6Ld...` |
| `RECAPTCHA_SECRET` | `6Ld...` |
| `NEXTAUTH_SECRET` | `a1b2c3d4...` |
| `NEXTAUTH_URL` | `https://smaannajah.sch.id` |
| `NODE_ENV` | `production` |

3. Klik **Save & Deploy**

### 5.5 Install Dependencies & Build

Hostinger akan otomatis menjalankan:

```bash
npm install
npm run build
npx prisma generate
```

Proses ini memakan waktu 1-3 menit tergantung koneksi.

### 5.6 Deploy Aplikasi

Setelah dependencies terinstall dan build selesai:
1. Klik **Start** atau **Deploy** untuk menjalankan aplikasi
2. Aplikasi akan berjalan di port internal (biasanya port 3000 atau port acak)
3. Hostinger akan menghubungkan port internal ke domain Anda via reverse proxy

---

## 6. Migrasi Database Production

Setelah Node.js app berjalan, database masih kosong. Jalankan migrasi dan seed:

### 6.1 Melalui Terminal hPanel (Jika Tersedia)

Beberapa paket Hostinger menyediakan akses terminal. Jika ada:

```bash
# Masuk ke direktori app
cd /home/u123456789/htdocs/smaannajah.sch.id

# Jalankan migrasi
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

### 6.2 Melalui SSH (Jika Tersedia)

```bash
ssh u123456789@hostinger-ssh-server.com
cd /home/u123456789/htdocs/smaannajah.sch.id
npx prisma migrate deploy
npx prisma db seed
```

### 6.3 Melalui phpMyAdmin (Metode Manual)

Jika tidak ada terminal/SSH, Anda bisa import data via phpMyAdmin:

**Langkah 1: Export data dari lokal**

```bash
# Backup database lokal ke SQL file
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump" -u root webannajah \
  --no-create-info \
  --complete-insert \
  --skip-lock-tables \
  > production-seed.sql
```

Atau, cara lebih praktis — export hanya schema:

```bash
# Buat schema dump (struktur tabel saja)
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump" -u root \
  --no-data \
  webannajah \
  > schema.sql
```

**Langkah 2: Import ke Hostinger**

1. Login ke **hPanel** → **Websites**
2. Sidebar kiri → **Database** → **phpMyAdmin**
3. Pilih database `u123456789_webannajah`
4. Buka tab **SQL**
5. Copy-paste isi file `schema.sql` dan klik **Go**
6. Ulangi untuk `production-seed.sql` (data awal)

**Langkah 3: Generate Prisma Client**

Setelah import, pastikan Prisma client sudah digenerate:
- Halaman pertama akan memicu Prisma generate di build step
- Atau jalankan via terminal jika tersedia: `npx prisma generate`

---

## 7. Setup Domain & SSL

### 7.1 Pastikan DNS Mengarah

Di hPanel:
1. **Websites** → Pilih website
2. **Settings** → **Domain**
3. Pastikan domain Anda sudah terdaftar
4. Jika belum, klik **Add Domain**

Nameserver Hostinger:
```
ns1.hostinger.com
ns2.hostinger.com
```

### 7.2 Aktifkan SSL (HTTPS)

1. **hPanel** → **Websites** → Pilih website
2. Sidebar kiri → **SSL**
3. Klik **Install SSL**
4. Pilih **Auto SSL** (Let's Encrypt — gratis)
5. Centang **Force HTTPS** (redirect HTTP → HTTPS)
6. Klik **Install**

SSL aktif dalam 1-5 menit.

---

## 8. Pengaturan Awal (Pertama Kali)

Setelah semua berjalan, akses website Anda:

### 🌐 Website Publik
```
https://smaannajah.sch.id
```

### 🔐 Panel Admin
```
https://smaannajah.sch.id/login
```

Login dengan akun default:
| Field | Value |
|-------|-------|
| **Email** | `admin@smaannajah.sch.id` |
| **Password** | `admin123` |

### ⚠️ WAJIB: Ganti Password Admin!

1. Login ke admin panel
2. Buka menu **Users** (atau **Settings** jika ada opsi ganti password)
3. Ganti password admin segera
4. Juga ganti `NEXTAUTH_SECRET` di environment variables jika pernah terekspos

### ✅ Cek Halaman Publik
Pastikan semua halaman berfungsi:
- [ ] `/` — Beranda
- [ ] `/profil` — Profil
- [ ] `/berita` — Berita
- [ ] `/galeri` — Galeri
- [ ] `/kontak` — Kontak & form
- [ ] Halaman statis (Ekstrakurikuler, Dewan Guru, PPDB)

### ✅ Cek Panel Admin
- [ ] `/admin` — Dashboard
- [ ] `/admin/posts` — Postingan
- [ ] `/admin/settings` — Pengaturan
- [ ] Upload gambar berfungsi

---

## 9. Update Konten Berkala

### 🔄 Update Konten Admin

Cukup login ke panel admin seperti biasa. Semua perubahan langsung tersimpan di database.

### 🚀 Update Kode Aplikasi

**Via GitHub Integration (otomatis):**

```bash
git add .
git commit -m "Update fitur X"
git push origin main
```

Hostinger otomatis deploy. Proses biasanya 2-5 menit.

**Via ZIP (manual):**

1. Build ulang di lokal: `npm run build`
2. Buat ZIP (tanpa node_modules, .next)
3. Upload ZIP melalui hPanel
4. Hostinger akan install dependencies & build

> ⚠️ **Catatan**: Hati-hati saat update via ZIP — pastikan file `.env` tidak ikut terupload dan file `uploads/` (gambar) tidak terhapus.

### 📦 Backup Database Berkala

Buat cron job rutin:

1. Di **hPanel** → **Advanced** → **Cron Jobs**
2. Buat cron job harian:

```
# Contoh script backup via mysqldump di hosting
mysqldump -u USER -pPASSWORD DATABASE_NAME | gzip > /home/u123456789/backups/annajah-$(date +\%Y-\%m-\%d).sql.gz
```

Atau pakai script backup yang sudah dibuat (`scripts/backup-db.sh`) — untuk menjalankannya di hosting, butuh node + akses ke mysqldump yang path-nya sesuai lingkungan hosting.

---

## 10. Troubleshooting

### ❌ Aplikasi Error 500 / Blank Page

**Penyebab umum & solusi:**

| Masalah | Solusi |
|---------|--------|
| **Database tidak terkoneksi** | Cek `DATABASE_URL` di environment variables hPanel. Pastikan host, user, password benar |
| **Prisma client belum generate** | Jalankan `npx prisma generate` via terminal hosting |
| **Migrasi belum jalan** | Jalankan `npx prisma migrate deploy` |
| **Node.js versi salah** | Ganti ke Node.js 20.x di hPanel > Node.js settings |
| **File upload tidak muncul** | Folder `public/uploads` harus ada. Cek permission folder (755) |

### ❌ Cannot find module '@prisma/client'

```bash
# Jalankan via terminal hosting
npx prisma generate
```

### ❌ Form Kontak Tidak Terkirim

- Cek Google reCAPTCHA key — pastikan `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` dan `RECAPTCHA_SECRET` benar
- Cek apakah domain sudah terdaftar di Google reCAPTCHA admin console

### ❌ Login Gagal / Redirect Loop

1. Cek `NEXTAUTH_URL` — harus persis URL production (dengan https://)
2. Cek `NEXTAUTH_SECRET` — harus string random yang konsisten
3. Cek database: apakah user admin ada?

### ❌ Gambar Tidak Muncul

- Cek folder `public/uploads` — pastikan ada dan isinya
- Cek permission folder: `755` untuk directory, `644` untuk file
- File path di database mungkin masih指向 path lokal (contoh: `/uploads/gambar.jpg`)

### ❌ Build Gagal di Hostinger

- Cek errors di hPanel → **Node.js** → **Logs**
- Common issue: Memory tidak cukup untuk build. Solusi: tambahkan `NODE_OPTIONS=--max-old-space-size=512` di environment variables

### ❌ "TypeError: Cannot read properties of undefined"

Ini biasanya masalah Prisma schema yang tidak sesuai dengan database. Jalankan:

```bash
npx prisma generate
npx prisma migrate deploy
```

### 📖 Melihat Log Aplikasi

Di hPanel:
1. **Websites** → Pilih website
2. Sidebar kiri → **Node.js** → **Logs**
3. Pilih **Application Log** atau **Error Log**

---

## 📊 Ringkasan Checklist

### Sebelum Deployment
- [ ] `npm run build` sukses di lokal
- [ ] `npx tsc --noEmit` lulus (tidak ada type error)
- [ ] Database MySQL production sudah dibuat di Hostinger
- [ ] Environment variables sudah disiapkan

### Saat Deployment
- [ ] Kode terupload (via GitHub atau ZIP)
- [ ] Node.js app dikonfigurasi (versi, entry, env vars)
- [ ] Database migration berjalan
- [ ] SSL/HTTPS aktif
- [ ] Domain terhubung

### Setelah Deployment
- [ ] Website publik bisa diakses
- [ ] Admin login berfungsi
- [ ] Password admin sudah diganti
- [ ] Upload gambar berfungsi
- [ ] Form kontak berfungsi (reCAPTCHA)
- [ ] Backup database sudah dijadwalkan

---

## 🔗 Referensi

- [Hostinger Node.js Web App Docs](https://support.hostinger.com/en/articles/9497155-how-to-set-up-a-node-js-web-application)
- [Hostinger MySQL Database Guide](https://support.hostinger.com/en/articles/1585133-how-to-create-a-mysql-database)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [NextAuth Production Guide](https://next-auth.js.org/deployment)

---

> **Terakhir diupdate:** Juni 2026  
> **Project:** SMA Annajah Website & CMS  
> Butuh bantuan? Buka issue di repository GitHub atau hubungi developer.
