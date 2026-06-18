#!/usr/bin/env bash
# ============================================================
# 🗄️ Backup Database MySQL — SMA Annajah
# ============================================================
# Script untuk backup otomatis database MySQL webannajah
# Menggunakan mysqldump dengan kompresi gzip
#
# Penggunaan:
#   ./scripts/backup-db.sh              # Backup dengan konfigurasi default
#   ./scripts/backup-db.sh --keep 14    # Simpan backup 14 hari
#   ./scripts/backup-db.sh --output custom/path  # Tentukan direktori output
#   ./scripts/backup-db.sh --quiet      # Mode diam (hanya error)
#   ./scripts/backup-db.sh --dry-run    # Simulasi tanpa backup
# ============================================================

set -euo pipefail

# ----------------------
# 🔧 KONFIGURASI
# ----------------------
# Default: ambil dari DATABASE_URL di .env jika ada
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"

# Parsing DATABASE_URL: mysql://user:pass@host:port/db
# Default values (digunakan jika .env tidak tersedia)
DB_USER="root"
DB_PASS=""
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="webannajah"

# Load DATABASE_URL dari .env (lebih aman daripada source)
DATABASE_URL=""
if [ -f "$ENV_FILE" ]; then
    DATABASE_URL="$(grep -o 'DATABASE_URL=.*' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'" | head -1)"
fi

# Parse DATABASE_URL jika ada
if [ -n "$DATABASE_URL" ]; then
    # Format: mysql://user:pass@host:port/db?params
    # Hapus prefix mysql://
    url="${DATABASE_URL#mysql://}"

    # Ambil nama database (setelah / terakhir)
    DB_NAME="${url##*/}"
    DB_NAME="${DB_NAME%%\?*}"  # buang query params

    # Ambil bagian auth@host:port (sebelum / pertama)
    auth="${url%%/*}"

    # Pisahkan user:pass dari host:port (split by @)
    case "$auth" in
        *@*)
            userpass="${auth%@*}"
            hostport="${auth#*@}"
            ;;
        *)
            userpass=""
            hostport="$auth"
            ;;
    esac

    # Parse user:pass
    if [ -n "$userpass" ]; then
        DB_USER="${userpass%%:*}"
        case "$userpass" in
            *:*) DB_PASS="${userpass#*:}" ;;
        esac
    fi

    # Parse host:port
    DB_HOST="${hostport%%:*}"
    case "$hostport" in
        *:*) DB_PORT="${hostport#*:}" ;;
    esac
fi

# ----------------------
# 📁 PATH MYSQLDUMP
# ----------------------
# Cari mysqldump di berbagai lokasi umum
MYSQLDUMP=""
for cmd in \
    "C:/Program Files/MySQL/MySQL Server 8.4/bin/mysqldump" \
    "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump" \
    "C:/Program Files/MySQL/MySQL Server 9.0/bin/mysqldump" \
    "/usr/bin/mysqldump" \
    "/usr/local/bin/mysqldump" \
    "mysqldump"; do
    if command -v "$cmd" &>/dev/null || [ -f "$cmd" ]; then
        MYSQLDUMP="$cmd"
        break
    fi
done

if [ -z "$MYSQLDUMP" ]; then
    echo "❌ ERROR: mysqldump tidak ditemukan. Install MySQL atau tambahkan ke PATH."
    exit 1
fi

# ----------------------
# 📂 DIREKTORI BACKUP
# ----------------------
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backups/database"
KEEP_DAYS=7
QUIET=false
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --keep)
            KEEP_DAYS="$2"
            shift 2
            ;;
        --output)
            BACKUP_DIR="$2"
            shift 2
            ;;
        --quiet|-q)
            QUIET=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "📖 Penggunaan: $(basename "$0") [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --keep DAYS       Simpan backup N hari (default: 7)"
            echo "  --output DIR      Direktori output backup"
            echo "  --quiet, -q       Mode diam (hanya tampilkan error)"
            echo "  --dry-run         Simulasi tanpa benar-benar backup"
            echo "  --help, -h        Tampilkan bantuan ini"
            exit 0
            ;;
        *)
            echo "❌ Opsi tidak dikenal: $1"
            echo "Gunakan --help untuk bantuan."
            exit 1
            ;;
    esac
done

# Buat direktori backup
mkdir -p "$BACKUP_DIR"

# ----------------------
# 🏷️ NAMA FILE
# ----------------------
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}-${TIMESTAMP}.sql"
BACKUP_GZ="${BACKUP_FILE}.gz"

# ----------------------
# 🧹 HAPUS BACKUP LAMA
# ----------------------
cleanup_old_backups() {
    if [ "$DRY_RUN" = true ]; then
        echo "🔍 [DRY-RUN] Akan hapus backup > ${KEEP_DAYS} hari di: ${BACKUP_DIR}"
        return
    fi

    local count=0
    while IFS= read -r -d '' f; do
        rm -f "$f"
        count=$((count + 1))
    done < <(find "$BACKUP_DIR" -name "${DB_NAME}-*.sql.gz" -type f -mtime "+${KEEP_DAYS}" -print0 2>/dev/null || true)

    if [ "$count" -gt 0 ] && [ "$QUIET" = false ]; then
        echo "🧹 Membersihkan ${count} backup lama (> ${KEEP_DAYS} hari)..."
    fi
}

# ----------------------
# 💾 PROSES BACKUP
# ----------------------
do_backup() {
    local start_time
    start_time=$(date +%s)

    if [ "$QUIET" = false ]; then
        echo "============================================"
        echo "🗄️  Backup Database MySQL"
        echo "============================================"
        echo "Database  : ${DB_NAME}"
        echo "Host      : ${DB_HOST}:${DB_PORT}"
        echo "User      : ${DB_USER}"
        echo "Waktu     : $(date +'%Y-%m-%d %H:%M:%S')"
        echo "Output    : ${BACKUP_GZ}"
        echo "============================================"
    fi

    if [ "$DRY_RUN" = true ]; then
        echo "🔍 [DRY-RUN] mysql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        echo "🔍 [DRY-RUN] ${MYSQLDUMP} -> ${BACKUP_GZ}"
        echo "✅ [DRY-RUN] Backup akan berhasil (simulasi)"
        return 0
    fi

    # Bangun argumen password
    local PASS_ARG=""
    if [ -n "$DB_PASS" ]; then
        PASS_ARG="-p${DB_PASS}"
    fi

    # Backup dengan mysqldump
    # Gunakan --routines --events untuk backup stored procedures & events
    # --single-transaction untuk konsistensi tanpa lock (InnoDB)
    # --skip-lock-tables agar tidak mengganggu aplikasi
    if "$MYSQLDUMP" \
        -h "$DB_HOST" \
        -P "$DB_PORT" \
        -u "$DB_USER" \
        $PASS_ARG \
        --single-transaction \
        --routines \
        --events \
        --triggers \
        --skip-lock-tables \
        --set-charset \
        --add-drop-table \
        --complete-insert \
        --quote-names \
        "$DB_NAME" > "$BACKUP_FILE" 2>>"${BACKUP_DIR}/backup-error.log"; then

    # Kompres dengan gzip
    if command -v gzip &>/dev/null; then
        gzip -f "$BACKUP_FILE"
    elif command -v pigz &>/dev/null; then
        pigz -f "$BACKUP_FILE"
    fi

    # Verifikasi file hasil
    local final_file
    if [ -f "$BACKUP_GZ" ]; then
        final_file="$BACKUP_GZ"
    else
        final_file="$BACKUP_FILE"
    fi

        local file_size
        file_size=$(du -h "$final_file" 2>/dev/null | cut -f1 || echo "unknown")
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))

        if [ "$QUIET" = false ]; then
            echo ""
            echo "✅ Backup BERHASIL!"
            echo "   File    : ${final_file}"
            echo "   Size    : ${file_size}"
            echo "   Durasi  : ${duration} detik"
            echo ""
            echo "📊 Ringkasan:"
            echo "   Lokasi  : ${BACKUP_DIR}"
            echo "   Disimpan: ${KEEP_DAYS} hari terakhir"
        fi

        # Log sukses
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ SUCCESS | ${DB_NAME} | ${final_file} | ${file_size} | ${duration}s" >> "${BACKUP_DIR}/backup-history.log"

    else
        local exit_code=$?
        local error_msg
        error_msg=$(tail -1 "${BACKUP_DIR}/backup-error.log" 2>/dev/null || echo "Unknown error")

        echo ""
        echo "❌ Backup GAGAL!" >&2
        echo "   Error: ${error_msg}" >&2
        echo "   Exit code: ${exit_code}" >&2

        # Log error
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ FAILED | ${DB_NAME} | exit=${exit_code} | ${error_msg}" >> "${BACKUP_DIR}/backup-history.log"

        # Hapus file sampah
        rm -f "$BACKUP_FILE" "${BACKUP_FILE}.gz"
        return 1
    fi
}

# ----------------------
# 🚀 EKSEKUSI
# ----------------------
cleanup_old_backups
do_backup
exit_code=$?

if [ "$QUIET" = false ]; then
    echo "============================================"
    echo "💡 Tips: Backup dijadwalkan otomatis?"
    echo "   Lihat AGENTS.md untuk setup cron / Task Scheduler"
    echo "============================================"
fi

exit $exit_code
