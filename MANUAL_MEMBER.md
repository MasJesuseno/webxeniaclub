# 📘 Manual Penggunaan Area Member — DXIC

**Website:** [xeniaclub.or.id](https://xeniaclub.or.id)  
**Versi Dokumen:** 1.0 — Juli 2026

---

## 📋 Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Cara Login](#2-cara-login)
3. [Halaman Utama Member (Dashboard)](#3-halaman-utama-member-dashboard)
4. [Edit Profil Member](#4-edit-profil-member)
5. [Tagihan Saya](#5-tagihan-saya)
6. [Benefit Mitra](#6-benefit-mitra)
7. [Laporan Keuangan](#7-laporan-keuangan)
8. [Member Near Me](#8-member-near-me)
9. [Cari Member](#9-cari-member)
10. [Refresh Lokasi](#10-refresh-lokasi)
11. [Logout](#11-logout)
12. [FAQ](#12-faq)

---

## 1. Pendahuluan

Area Member adalah portal khusus untuk anggota DXIC yang sudah terdaftar dan memiliki **ID Member** serta **Password**. Melalui portal ini, anggota dapat:

- Melihat dan memperbarui data diri
- Mengecek tagihan iuran
- Melihat benefit dari mitra kerjasama
- Mengakses laporan keuangan klub
- Mencari dan melihat lokasi sesama member
- Menghubungi member lain via WhatsApp

---

## 2. Cara Login

### 2.1 Akses Halaman Login

1. Buka website **[xeniaclub.or.id](https://xeniaclub.or.id)**
2. Klik tombol **"Login Member"** yang ada di menu navigasi (atas atau menu mobile)
3. Atau langsung buka: `https://xeniaclub.or.id/member/login`

### 2.2 Form Login

Halaman login akan menampilkan:

| Field | Keterangan |
|-------|-----------|
| **ID Member** | ID member yang diberikan saat pendaftaran (huruf besar/kecil tidak masalah) |
| **Password** | Password yang sudah didaftarkan |

### 2.3 Ambil Lokasi Login (Disarankan)

Sebelum menekan tombol **"Masuk"**, disarankan untuk mengambil lokasi terlebih dahulu:
1. Klik tombol **"Ambil Lokasi Login"**
2. Izinkan browser mengakses lokasi GPS Anda
3. Status lokasi akan muncul (berhasil/gagal)

> **Catatan:** Lokasi login digunakan untuk fitur **Member Near Me** dan absensi kehadiran.

### 2.4 Tombol Masuk

Setelah mengisi ID Member, Password, dan mengambil lokasi:
1. Klik tombol **"Masuk"**
2. Tunggu proses verifikasi
3. Jika berhasil, akan masuk ke halaman **Dashboard Member**

### 2.5 Jika Gagal Login

| Pesan Error | Solusi |
|-------------|--------|
| "ID Member tidak ditemukan" | Periksa kembali ID Member Anda |
| "Akun belum memiliki password" | Hubungi admin untuk membuat password |
| "Password salah" | Coba ingat kembali password Anda |
| "Akun belum aktif" | Status member Anda belum aktif, hubungi admin |

---

## 3. Halaman Utama Member (Dashboard)

Setelah login, Anda akan melihat halaman utama yang terdiri dari beberapa bagian:

### 3.1 Kartu Profil (Header)

Menampilkan:
- **Foto profil** (jika sudah diupload, atau inisial nama)
- **Nama Lengkap**
- **ID Member**
- **Status Online/Offline** (lingkaran hijau = online, abu-abu = offline)

### 3.2 Statistik Cepat

Dua kotak statistik yang menampilkan:
- **Total Tagihan**: Jumlah seluruh tagihan yang pernah diterbitkan
- **Belum Lunas**: Jumlah tagihan yang masih menunggu pembayaran

### 3.3 Data Profil

Menampilkan data lengkap member dalam mode baca. Data yang ditampilkan:
- Nama Lengkap
- Nama Panggilan
- ID Member
- No. WhatsApp
- Email
- Provinsi
- Kota/Kabupaten
- Region
- Mobil (Jenis + Tipe + Tahun)
- No. Polisi
- Warna
- Ukuran Kaos
- Status Member

### 3.4 Lokasi Login

Menampilkan:
- Label lokasi terakhir login
- Waktu terakhir lokasi diperbarui
- Tombol **"Refresh Lokasi"** untuk memperbarui posisi GPS

### 3.5 Tombol Keluar

Tombol **"Keluar"** berwarna merah di bagian bawah untuk logout dari area member.

---

## 4. Edit Profil Member

### 4.1 Masuk ke Mode Edit

1. Pada halaman Dashboard, di bagian **"Data Profil"**
2. Klik tombol **"Edit"** di pojok kanan atas

### 4.2 Field yang Bisa Diedit

| No | Field | Tipe Input | Keterangan |
|----|-------|-----------|------------|
| 1 | Nama Lengkap | Text | Nama lengkap sesuai KTP |
| 2 | Nama Panggilan | Text | Nama panggilan sehari-hari |
| 3 | Jenis Kendaraan | Select (Xenia / Non Xenia) | Pilih jenis kendaraan |
| 4 | No. WhatsApp | Text | Nomor telepon yang bisa dihubungi |
| 5 | Email | Email | Alamat email aktif |
| 6 | Tempat Lahir | Text | Kota tempat lahir |
| 7 | Tanggal Lahir | Date (kalender) | Tanggal lahir |
| 8 | Golongan Darah | Select (A/B/AB/O) | Pilih golongan darah |
| 9 | Ukuran Kaos | Text | Tulis ukuran kaos bebas (S, M, L, XL, XXL, 5XL, dll) |
| 10 | Alamat Lengkap | Textarea (multiline) | Alamat lengkap |
| 11 | Kota/Kabupaten | Text | Kota tempat tinggal |
| 12 | Provinsi | Text | Provinsi tempat tinggal |
| 13 | No. Polisi | Text (otomatis huruf besar) | Nomor polisi kendaraan |
| 14 | Warna | Text | Warna kendaraan |

### 4.3 Ubah Password

Di bagian **"Ubah Password"** (setelah field Warna):

| Field | Keterangan |
|-------|-----------|
| **Password Baru** | Masukkan password baru (minimal 6 karakter) |
| **Konfirmasi Password** | Ketik ulang password baru |

> **Penting:** Kosongkan kedua field jika tidak ingin mengubah password.

### 4.4 Upload Foto

Di bagian **"Upload Foto"** (setelah Ubah Password):

Ada 2 cara upload:
1. **Via URL** — Masukkan URL gambar langsung
2. **Via File** — Klik area upload, pilih file gambar, atau drag & drop gambar

**Ketentuan Foto:**
- Format: PNG, JPG, WebP
- Ukuran maksimal: 5 MB
- Rekomendasi: 400×400px (persegi), foto wajah jelas

> Untuk menghapus foto, klik tombol X di pojok kanan atas preview foto.

### 4.5 Simpan Perubahan

1. Setelah selesai mengisi, klik tombol **"Simpan Perubahan"**
2. Tunggu proses menyimpan
3. Jika berhasil akan muncul pesan hijau **"Profil berhasil diperbarui!"**
4. Mode edit akan otomatis tertutup dan data profil akan dimuat ulang

### 4.6 Batalkan Edit

Klik tombol **"Batal"** (berubah dari tombol "Edit") untuk membatalkan perubahan.

---

## 5. Tagihan Saya

### 5.1 Akses Halaman Tagihan

Buka menu **"Tagihan"** dari navigasi bawah (bottom navigation).

### 5.2 Melihat Tagihan

Halaman ini menampilkan daftar tagihan/periode iuran yang diterbitkan untuk Anda:

Setiap kartu tagihan menampilkan:
- **Nama Periode** (contoh: "Iuran Juli 2026")
- **Tanggal Jatuh Tempo**
- **Status Tagihan**: Belum / Menunggu Verifikasi / Lunas / Ditolak
- **Jumlah Biaya** (dalam Rupiah)

### 5.3 Upload Bukti Transfer

Untuk tagihan yang **belum dibayar**:

1. Klik tombol **"Upload Bukti Transfer"**
2. Isi form yang muncul:
   - **Upload Bukti Transfer** — Pilih file bukti (gambar/PDF)
   - **Tanggal Transfer** — Pilih tanggal Anda melakukan transfer
3. Klik **"Upload Bukti"**
4. Status akan berubah menjadi **"Menunggu Verifikasi"**

> **Catatan:** Status akan diperbarui oleh admin setelah bukti diverifikasi.

### 5.4 Melihat Bukti yang Sudah Diupload

Jika sudah pernah upload bukti, akan muncul:
- Link **"Lihat Bukti"** — Klik untuk melihat bukti transfer
- **Tanggal Bayar** — Tanggal transfer yang Anda input

---

## 6. Benefit Mitra

### 6.1 Akses Halaman Benefit

Buka menu **"Benefit"** dari navigasi bawah.

### 6.2 Melihat Daftar Mitra

Halaman ini menampilkan daftar mitra kerjasama DXIC yang memberikan benefit khusus untuk member.

Setiap kartu mitra menampilkan:
- **Logo** mitra
- **Nama Mitra**
- **Deskripsi** singkat
- **Benefit khusus** untuk member DXIC (di dalam kotak hijau)
- **Tombol "Kunjungi"** — Buka website mitra
- **Tombol "Lokasi"** — Buka peta lokasi mitra (jika tersedia)

---

## 7. Laporan Keuangan

### 7.1 Akses Halaman Laporan

Buka menu **"Laporan"** dari navigasi bawah.

### 7.2 Melihat Laporan Keuangan

Halaman ini menampilkan laporan keuangan DXIC yang dapat diakses oleh member.

Setiap laporan menampilkan:
- **Preview** — Gambar preview atau ikon dokumen
- **Periode Laporan** (contoh: "Laporan Keuangan Juni 2026")
- **Deskripsi** laporan
- **Tanggal Publikasi**
- **Tombol "Lihat"** — Buka file laporan (PDF/Gambar)

---

## 8. Member Near Me

### 8.1 Akses Halaman Near Me

Buka menu **"Near Me"** dari navigasi bawah.

### 8.2 Cara Kerja

Fitur ini menampilkan member lain yang sedang online dan berada di sekitar lokasi Anda (radius 100 km).

### 8.3 Tampilan Daftar

Mode **"Daftar"** (default):
- Menampilkan kartu-kartu member
- Setiap kartu menampilkan:
  - Nama member
  - ID Member
  - Label lokasi
  - Region, jenis mobil, no polisi
  - **Jarak** dari lokasi Anda (dalam km)
  - Tombol WhatsApp — Klik untuk chat via WhatsApp

### 8.4 Tampilan Peta

Mode **"Peta"**:
- Menampilkan peta interaktif
- Marker merah = lokasi Anda
- Marker biru = lokasi member lain
- Klik marker untuk melihat nama member

### 8.5 Refresh

Klik ikon **refresh** (panah melingkar) di pojok kanan atas untuk memperbarui lokasi dan daftar member.

---

## 9. Cari Member

### 9.1 Akses Halaman Cari

Buka menu **"Cari"** dari navigasi bawah.

### 9.2 Mode Pencarian

**Mode Nama:**
- Pilih tab **"Nama"**
- Ketik minimal 2 huruf dari nama yang dicari
- Hasil akan muncul otomatis setelah Anda berhenti mengetik

**Mode ID Member:**
- Pilih tab **"ID Member"**
- Ketik ID member yang dicari
- Hasil akan muncul otomatis

### 9.3 Hasil Pencarian

Setiap hasil menampilkan:
- Nama lengkap dan nama panggilan
- ID Member
- Region, Kota, Provinsi
- Info mobil (jenis, tipe, no polisi, warna)
- Tombol WhatsApp — Klik untuk menghubungi via WhatsApp

> **Fitur Khusus:** Klik ikon WhatsApp hijau di setiap kartu untuk langsung chat dengan member tersebut.

---

## 10. Refresh Lokasi

Lokasi GPS Anda digunakan untuk:
1. **Login** — Mencatat lokasi saat login
2. **Member Near Me** — Menampilkan member di sekitar
3. **Statistik kehadiran** online

**Cara refresh lokasi:**
1. Di Dashboard, scroll ke bagian **"Lokasi Login"**
2. Klik tombol **"Refresh Lokasi"**
3. Izinkan browser mengakses GPS
4. Lokasi akan diperbarui dan label lokasi baru akan muncul

---

## 11. Logout

1. Di halaman Dashboard, scroll ke bagian paling bawah
2. Klik tombol **"Keluar"** (border merah)
3. Anda akan dialihkan ke halaman login

> **Tips:** Selalu logout jika menggunakan perangkat bersama atau publik.

---

## 12. FAQ

### Q: Saya lupa password, bagaimana?
A: Hubungi admin DXIC melalui kontak yang tersedia di website untuk reset password.

### Q: Saya belum punya ID Member, bagaimana cara daftar?
A: Klik tombol **"Gabung Member"** di halaman utama website atau hubungi admin.

### Q: Data saya tidak bisa diperbarui, kenapa?
A: Pastikan koneksi internet stabil. Jika masih bermasalah, hubungi admin.

### Q: Berapa lama bukti transfer diverifikasi?
A: Proses verifikasi dilakukan oleh admin. Hubungi admin jika sudah lebih dari 2 hari.

### Q: Fitur Near Me tidak menampilkan member lain?
A: Pastikan GPS aktif dan ada member lain yang sedang online di sekitar lokasi Anda.

### Q: Apakah data saya aman?
A: Ya, semua data dilindungi dengan password dan koneksi aman (HTTPS).

### Q: Bisa ganti foto profil?
A: Bisa. Masuk ke mode Edit Profil, upload foto baru, lalu simpan.

### Q: Kok HP saya tidak bisa login?
A: Pastikan browser Anda mendukung cookies (diperlukan untuk session login).

---

## 📞 Kontak & Bantuan

Jika mengalami kendala teknis, hubungi:

- **WhatsApp Admin:** — (tersedia di website)
- **Email:** — (tersedia di website)
- **Form Kontak:** — Kunjungi halaman Kontak di website

---

*Dokumen ini diperbarui secara berkala. Terakhir diperbarui: Juli 2026.*  
*DXIC — Xeniaclub Indonesia*
