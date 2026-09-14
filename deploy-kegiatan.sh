#!/bin/bash
set -e

echo "=== DEPLOY KEGIATAN ==="
echo "Masuk ke folder project..."
cd /home/ubuntu/xeniaclub

echo "=== Git Pull ==="
git pull origin main

echo "=== Install Dependencies ==="
npm install

echo "=== Push Database Schema (Kegiatan + canUpdateKegiatan) ==="
npx prisma db push --accept-data-loss

echo "=== Generate Prisma Client ==="
npx prisma generate

echo "=== Build Production ==="
npm run build

echo "=== Restart PM2 ==="
pm2 restart xeniaclub || pm2 start npm --name xeniaclub -- run start

echo ""
echo "=== DEPLOY SELESAI! ==="
echo "Aplikasi berjalan di port 3002"
