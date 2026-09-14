#!/bin/bash
# ============================================================
# Deploy: Hapus Menu Chat & Notifikasi Chat dari Member Area
# Jalankan di server production via PuTTY/SSH
# ============================================================

set -e

FOLDER="/home/ubuntu/xeniaclub"

echo "=========================================="
echo "  DEPLOY: HAPUS MENU & NOTIFIKASI CHAT"
echo "=========================================="

# 1. Masuk ke folder project
echo ""
echo "[1/4] Masuk ke folder project..."
cd "$FOLDER" || { echo "ERROR: Folder $FOLDER tidak ditemukan!"; exit 1; }

# 2. Pull latest code
echo "[2/4] Pull latest code dari GitHub..."
git pull origin main
echo "✅ Pull berhasil!"

# 3. Install dependencies (jika perlu)
echo "[3/4] Cek dependencies..."
npm install --omit=dev 2>/dev/null || npm install

# 4. Restart aplikasi
echo "[4/4] Restart aplikasi..."
if command -v pm2 &> /dev/null; then
    pm2 restart xeniaclub
    echo "✅ PM2 restart berhasil!"
else
    echo "⚠️  PM2 tidak ditemukan. Restart manual diperlukan."
fi

echo ""
echo "=========================================="
echo "  ✅ DEPLOY SELESAI!"
echo "=========================================="
echo ""
echo "Perubahan:"
echo "  - Menu Chat dihapus dari bottom navigation"
echo "  - Notifikasi Chat (unread badge, toast) dihapus dari top bar"
echo "  - Halaman /member/chat TETAP ADA (tidak dihapus)"
echo ""
echo "Cek di: http://localhost:3002"
echo "=========================================="
