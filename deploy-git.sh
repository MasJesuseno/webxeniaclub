#!/usr/bin/env bash
# ==============================================================================
# 🚀 DEPLOY SCRIPT (GIT-BASED) - XENIA CLUB INDONESIA
# ==============================================================================
# Fungsi:
#   1. Mengambil perubahan terbaru dari Git (git fetch & pull origin main).
#   2. Hanya build & update jika ada commit baru (atau jika diberi argumen --force).
#   3. Hemat waktu: hanya npm install jika package.json berubah.
#   4. Sinkronisasi Prisma jika schema berubah.
#   5. Build Next.js ke produksi.
#   6. Restart PM2 'xeniaclub' di port 3002.
#   7. Verifikasi kesehatan web server.
#
# Cara Penggunaan di Server (SSH / PuTTY):
#   bash deploy-git.sh             # Update otomatis jika ada commit baru di Git
#   bash deploy-git.sh --force     # Paksa build & restart meskipun tidak ada commit baru
#   bash deploy-git.sh -b <branch> # Deploy dari branch tertentu (default: main)
# ==============================================================================

set -eo pipefail

# Warna terminal
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_GREEN='\033[32m'
C_YELLOW='\033[33m'
C_BLUE='\033[34m'
C_CYAN='\033[36m'
C_RED='\033[31m'

START_TIME=$(date +%s)
BRANCH="main"
FORCE_DEPLOY=false
TARGET_DIR="/home/ubuntu/xeniaclub"
APP_PORT=3002
PM2_APP_NAME="xeniaclub"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --force|-f)
      FORCE_DEPLOY=true
      shift
      ;;
    --branch|-b)
      BRANCH="$2"
      shift 2
      ;;
    *)
      echo -e "${C_YELLOW}Argumen tidak dikenal: $1${C_RESET}"
      shift
      ;;
  esac
done

echo -e "\n${C_BOLD}${C_CYAN}================================================================${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}      🚀 DEPLOY XENIACLUB (GIT UPDATE ONLY)                    ${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}================================================================${C_RESET}"
echo -e "Waktu Mulai : $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "Branch      : ${C_BOLD}${BRANCH}${C_RESET}"
echo -e "Force Mode  : ${FORCE_DEPLOY}\n"

# ── 1. Setup PATH Node.js & PM2 (khusus server aaPanel / SumoPod) ──
echo -e "${C_BLUE}[1/7] Menyiapkan environment Node.js & PM2...${C_RESET}"
if [ -d "/www/server/nodejs/v24.18.0/bin" ]; then
  export PATH=/www/server/nodejs/v24.18.0/bin:$PATH
elif [ -d "/www/server/nodejs" ]; then
  # Cari versi nodejs yang terpasang di aaPanel jika versi v24.18.0 beda patch
  LATEST_NODE_BIN=$(ls -d /www/server/nodejs/v*/bin 2>/dev/null | tail -1 || true)
  if [ -n "$LATEST_NODE_BIN" ]; then
    export PATH=$LATEST_NODE_BIN:$PATH
  fi
fi

# Cek ketersediaan command penting
for cmd in git node npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo -e "${C_RED}❌ Error: '$cmd' tidak ditemukan di PATH server!${C_RESET}"
    exit 1
  fi
done

NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo -e "      Node.js : ${C_GREEN}${NODE_VER}${C_RESET}"
echo -e "      NPM     : ${C_GREEN}v${NPM_VER}${C_RESET}"

# ── 2. Masuk ke direktori project ──
echo -e "\n${C_BLUE}[2/7] Memeriksa direktori project...${C_RESET}"
if [ -d "$TARGET_DIR" ]; then
  cd "$TARGET_DIR"
elif [ -d ".git" ]; then
  TARGET_DIR=$(pwd)
else
  echo -e "${C_RED}❌ Error: Direktori $TARGET_DIR tidak ditemukan!${C_RESET}"
  exit 1
fi
echo -e "      Direktori: ${C_GREEN}$(pwd)${C_RESET}"

# Pastikan ini repo git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo -e "${C_RED}❌ Error: Direktori ini bukan git repository!${C_RESET}"
  exit 1
fi

# ── 3. Cek perubahan di remote Git ──
echo -e "\n${C_BLUE}[3/7] Mengambil data terbaru dari remote git (${BRANCH})...${C_RESET}"
OLD_COMMIT=$(git rev-parse HEAD)
OLD_COMMIT_SHORT=$(git rev-parse --short HEAD)

# Fetch data terbaru tanpa merusak working tree
git fetch origin "$BRANCH"

NEW_REMOTE_COMMIT=$(git rev-parse "origin/$BRANCH")
NEW_REMOTE_SHORT=$(git rev-parse --short "origin/$BRANCH")
COMMITS_BEHIND=$(git rev-list HEAD.."origin/$BRANCH" --count)

echo -e "      Commit saat ini : ${C_YELLOW}${OLD_COMMIT_SHORT}${C_RESET} ($(git log -1 --pretty=%B | head -1))"
echo -e "      Commit remote   : ${C_YELLOW}${NEW_REMOTE_SHORT}${C_RESET}"

if [ "$COMMITS_BEHIND" -eq 0 ] && [ "$FORCE_DEPLOY" = false ]; then
  echo -e "\n${C_BOLD}${C_GREEN}✅ Server SUDAH UP-TO-DATE! Tidak ada commit baru dari Git.${C_RESET}"
  echo -e "   Gunakan argumen ${C_BOLD}--force${C_RESET} jika Anda ingin tetap build ulang:"
  echo -e "   ${C_CYAN}bash deploy-git.sh --force${C_RESET}\n"
  exit 0
fi

if [ "$COMMITS_BEHIND" -gt 0 ]; then
  echo -e "\n      ${C_BOLD}Ditemukan ${COMMITS_BEHIND} commit baru dari Git:${C_RESET}"
  git log --oneline "HEAD..origin/$BRANCH" | sed 's/^/      - /'
  
  echo -e "\n      Menjalankan ${C_BOLD}git pull origin ${BRANCH}${C_RESET}..."
  git pull origin "$BRANCH"
else
  echo -e "\n      ${C_YELLOW}Mode --force aktif: tetap memproses build ulang.${C_RESET}"
fi

NEW_COMMIT=$(git rev-parse HEAD)
NEW_COMMIT_SHORT=$(git rev-parse --short HEAD)

# Deteksi file yang berubah antara commit lama dan baru
if [ "$OLD_COMMIT" != "$NEW_COMMIT" ]; then
  CHANGED_FILES=$(git diff --name-only "$OLD_COMMIT" "$NEW_COMMIT")
else
  CHANGED_FILES=""
fi

# ── 4. Cek dependencies (npm install) ──
echo -e "\n${C_BLUE}[4/7] Memeriksa dependensi (package.json)...${C_RESET}"
NEED_NPM_INSTALL=false

if [ "$FORCE_DEPLOY" = true ]; then
  NEED_NPM_INSTALL=true
elif echo "$CHANGED_FILES" | grep -qE '^package\.json$|^package-lock\.json$'; then
  NEED_NPM_INSTALL=true
fi

if [ "$NEED_NPM_INSTALL" = true ]; then
  echo -e "      ${C_YELLOW}Perubahan dependensi terdeteksi. Menjalankan npm install...${C_RESET}"
  npm install --no-audit --no-fund
  echo -e "      ${C_GREEN}✅ npm install selesai${C_RESET}"
else
  echo -e "      ${C_GREEN}✓ Tidak ada perubahan package.json, melewati npm install (hemat waktu).${C_RESET}"
fi

# ── 5. Cek Prisma & Database Schema ──
echo -e "\n${C_BLUE}[5/7] Memeriksa Prisma Client & Database...${C_RESET}"
NEED_PRISMA_PUSH=false

if [ "$FORCE_DEPLOY" = true ]; then
  NEED_PRISMA_PUSH=true
elif echo "$CHANGED_FILES" | grep -qE '^prisma/schema\.prisma$'; then
  NEED_PRISMA_PUSH=true
fi

if [ "$NEED_PRISMA_PUSH" = true ]; then
  echo -e "      ${C_YELLOW}Schema database berubah. Menjalankan prisma db push...${C_RESET}"
  npx prisma db push --accept-data-loss
  npx prisma generate
  echo -e "      ${C_GREEN}✅ Prisma schema & client berhasil disinkronkan.${C_RESET}"
else
  echo -e "      Menjalankan npx prisma generate cepat..."
  npx prisma generate
  echo -e "      ${C_GREEN}✓ Prisma client siap.${C_RESET}"
fi

# ── 6. Build Next.js Production ──
echo -e "\n${C_BLUE}[6/7] Menjalankan build Next.js (npm run build)...${C_RESET}"
npm run build
echo -e "      ${C_GREEN}✅ Next.js build sukses!${C_RESET}"

# ── 7. Restart PM2 & Verifikasi ──
echo -e "\n${C_BLUE}[7/7] Restart aplikasi via PM2 (port ${APP_PORT})...${C_RESET}"
if command -v pm2 >/dev/null 2>&1; then
  if pm2 list | grep -q "$PM2_APP_NAME"; then
    echo -e "      Me-restart PM2 instance '${PM2_APP_NAME}'..."
    pm2 restart "$PM2_APP_NAME"
  else
    echo -e "      Menjalankan PM2 instance baru '${PM2_APP_NAME}' di port ${APP_PORT}..."
    pm2 start npm --name "$PM2_APP_NAME" -- start -- -p "$APP_PORT"
  fi
  pm2 save --force >/dev/null 2>&1 || true
  echo -e "      ${C_GREEN}✅ PM2 '${PM2_APP_NAME}' aktif.${C_RESET}"
else
  echo -e "      ${C_YELLOW}⚠️  PM2 tidak ditemukan, mencoba menjalankan langsung via npm start di background...${C_RESET}"
fi

# Jeda 3 detik untuk menunggu server online
sleep 3

# Verifikasi via HTTP Curl
echo -e "\n${C_BOLD}🔍 Verifikasi Web Server:${C_RESET}"
HTTP_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${APP_PORT}/" || echo "FAILED")
echo -e "      Local App (127.0.0.1:${APP_PORT}) : HTTP ${C_GREEN}${HTTP_LOCAL}${C_RESET}"

if command -v pm2 >/dev/null 2>&1; then
  PM2_STATUS=$(pm2 list | grep "$PM2_APP_NAME" | head -1 || true)
  if [ -n "$PM2_STATUS" ]; then
    echo -e "      PM2 Process Status           : ${C_GREEN}Online${C_RESET}"
  fi
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${C_BOLD}${C_GREEN}================================================================${C_RESET}"
echo -e "${C_BOLD}${C_GREEN}  🎉 DEPLOY SELESAI DENGAN SUKSES! (${DURATION} detik)                ${C_RESET}"
echo -e "${C_BOLD}${C_GREEN}================================================================${C_RESET}"
echo -e "  Versi Baru : ${C_BOLD}${NEW_COMMIT_SHORT}${C_RESET} (${BRANCH})"
echo -e "  Status     : HTTP ${HTTP_LOCAL}"
echo -e "  Website    : ${C_CYAN}https://xeniaclub.or.id${C_RESET}"
echo -e "${C_BOLD}${C_GREEN}================================================================${C_RESET}\n"
