#!/bin/bash
# ============================================================
# Deploy Fix: Notifikasi Pesan Masih Muncul Walau Sudah Dibuka
# Jalankan di server production via PuTTY/SSH
# ============================================================

set -e

FOLDER="/home/ubuntu/xeniaclub"

echo "=========================================="
echo "  DEPLOY FIX NOTIFIKASI PESAN"
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
    pm2 restart all
    echo "✅ PM2 restart berhasil!"
elif command -v systemctl &> /dev/null; then
    sudo systemctl restart xeniaclub 2>/dev/null || sudo systemctl restart nextjs 2>/dev/null || echo "⚠️  Coba restart manual: sudo systemctl restart <service-name>"
else
    echo "⚠️  Tidak ada PM2/systemctl. Restart manual diperlukan."
fi

echo ""
echo "=========================================="
echo "  ✅ DEPLOY SELESAI!"
echo "=========================================="
echo ""
echo "Perubahan:"
echo "  - fix: notifikasi pesan masih muncul walau sudah dibuka"
echo "  - Update lastReadAt di Ngobrol Bareng"
echo "  - Filter isDeleted di unread endpoint"
echo ""
echo "Cek di: http://localhost:3002"
echo "=========================================="
