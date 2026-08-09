import { execFile, spawn } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"

const execFileAsync = promisify(execFile)

export interface DbConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

/** Parse DATABASE_URL (mysql://user:pass@host:port/dbname) menjadi konfigurasi. */
export function parseDbUrl(url: string): DbConfig {
  const u = new URL(url)
  return {
    host: u.hostname || "localhost",
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username || "root"),
    password: decodeURIComponent(u.password || ""),
    database: decodeURIComponent(u.pathname.replace(/^\//, "")),
  }
}

/** Ambil konfigurasi DB dari environment (DATABASE_URL). */
export function getDbConfig(): DbConfig {
  const url = process.env.DATABASE_URL || ""
  return parseDbUrl(url)
}

// Lokasi umum binary MySQL di Windows & Linux (fallback bila tidak di PATH).
export function findBinary(name: string): string {
  const exe = process.platform === "win32" ? `${name}.exe` : name
  const baseDirs =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin",
          "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin",
          "C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin",
          "C:\\xampp\\mysql\\bin",
          "C:\\wamp64\\bin\\mysql",
          "C:\\laragon\\bin\\mysql",
        ]
      : ["/usr/bin", "/usr/local/bin", "/usr/local/mysql/bin", "/usr/sbin", "/opt/mysql/bin"]

  for (const dir of baseDirs) {
    const direct = path.join(dir, exe)
    if (fs.existsSync(direct)) return direct
    // Direktori versi (mis. C:\wamp64\bin\mysql\mysql8.0.30\bin)
    if (fs.existsSync(dir)) {
      try {
        for (const sub of fs.readdirSync(dir)) {
          const subBin = path.join(dir, sub, "bin", exe)
          if (fs.existsSync(subBin)) return subBin
        }
      } catch {
        // abaikan folder yang tidak bisa dibaca
      }
    }
  }
  // Fallback: andalkan PATH
  return name
}

/**
 * Dump seluruh database menjadi string SQL (termasuk struktur, data,
 * stored procedure, trigger). Mengembalikan SQL beserta nama file yang disarankan.
 */
export async function dumpDatabase(): Promise<{
  sql: string
  filename: string
  size: number
  db: string
}> {
  const cfg = getDbConfig()
  const bin = findBinary("mysqldump")
  const args = [
    `--host=${cfg.host}`,
    `--port=${cfg.port}`,
    `--user=${cfg.user}`,
    "--single-transaction",
    "--routines",
    "--triggers",
    "--default-character-set=utf8mb4",
    "--no-tablespaces",
    "--databases",
    cfg.database,
  ]

  const { stdout } = await execFileAsync(bin, args, {
    maxBuffer: 200 * 1024 * 1024,
    timeout: 300000,
    env: { ...process.env, MYSQL_PWD: cfg.password },
  })

  const ts = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const filename = `backup-xeniaclub-${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(
    ts.getDate()
  )}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.sql`

  return { sql: stdout, filename, size: Buffer.byteLength(stdout, "utf8"), db: cfg.database }
}

/**
 * Restore database dari string SQL. SQL diumpankan ke stdin proses `mysql`
 * sehingga tidak memakai shell (aman dari injection).
 */
export async function restoreDatabase(
  sql: string
): Promise<{ stdout: string; stderr: string }> {
  const cfg = getDbConfig()
  const bin = findBinary("mysql")
  const args = [
    `--host=${cfg.host}`,
    `--port=${cfg.port}`,
    `--user=${cfg.user}`,
    "--default-character-set=utf8mb4",
  ]

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      env: { ...process.env, MYSQL_PWD: cfg.password },
      stdio: ["pipe", "pipe", "pipe"],
    })
    let stdout = ""
    let stderr = ""
    const timer = setTimeout(() => {
      child.kill()
      reject(new Error("Restore timeout (300 detik)"))
    }, 300000)

    child.stdout.on("data", (d) => (stdout += d.toString()))
    child.stderr.on("data", (d) => (stderr += d.toString()))
    child.on("error", (err) => {
      clearTimeout(timer)
      reject(err)
    })
    child.on("close", (code) => {
      clearTimeout(timer)
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr.slice(-1000) || `mysql exited with code ${code}`))
    })
    try {
      child.stdin.write(sql)
      child.stdin.end()
    } catch (err) {
      // Binary tidak ditemukan / proses gagal start — biarkan event "error" yang menangani.
      clearTimeout(timer)
    }
  })
}
