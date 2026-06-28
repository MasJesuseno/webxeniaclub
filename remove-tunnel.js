const { Client } = require('ssh2');

const CONFIG = {
  host: '192.168.1.53',
  port: 22,
  username: 'root',
  password: 'it92528!@',
  readyTimeout: 15000,
};

function sshExec(conn, command) {
  return new Promise((resolve, reject) => {
    let stdout = '', stderr = '';
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', (code, signal) => {
        if (code === 0) resolve(stdout.trim());
        else resolve(`⚠️ Exit ${code}: ${stderr.trim() || stdout.trim()}`);
      });
      stream.on('data', (data) => { stdout += data.toString(); });
      stream.stderr.on('data', (data) => { stderr += data.toString(); });
    });
  });
}

async function main() {
  console.log('🔌 Connecting to server 192.168.1.53...');
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect(CONFIG);
  });
  console.log('✅ Connected!\n');

  try {
    // ─── 1. Stop service ──────────────────────────────────
    console.log('🛑 Stopping cloudflared service...');
    const stop = await sshExec(conn, 'systemctl stop cloudflared 2>&1');
    console.log(`   ${stop || '✅ Service stopped'}`);

    // ─── 2. Disable service ───────────────────────────────
    console.log('🚫 Disabling cloudflared service...');
    const disable = await sshExec(conn, 'systemctl disable cloudflared 2>&1');
    console.log(`   ${disable || '✅ Service disabled'}`);

    // ─── 3. Uninstall service ─────────────────────────────
    console.log('🗑️  Uninstalling cloudflared service...');
    const uninstall = await sshExec(conn, 'cloudflared service uninstall 2>&1');
    console.log(`   ${uninstall || '✅ Service uninstalled'}`);

    // ─── 4. Remove config files ───────────────────────────
    console.log('🗑️  Removing config files...');
    await sshExec(conn, 'rm -rf /root/.cloudflared 2>&1');
    await sshExec(conn, 'rm -f /etc/systemd/system/cloudflared.service 2>&1');
    console.log('   ✅ Config files removed');

    // ─── 5. Reload systemd ────────────────────────────────
    console.log('🔄 Reloading systemd...');
    await sshExec(conn, 'systemctl daemon-reload 2>&1');
    console.log('   ✅ Done');

    // ─── 6. Verify ────────────────────────────────────────
    console.log('\n🔍 Verifying removal...');
    const check = await sshExec(conn, 'systemctl status cloudflared 2>&1 | head -5 || echo "(service removed)"');
    console.log(`   ${check}`);

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅ TUNNEL LAMA BERHASIL DIHAPUS!');
    console.log('═══════════════════════════════════════════════');
    console.log('\n📋 Langkah selanjutnya:');
    console.log('   1. Buka https://one.dash.cloudflare.com/');
    console.log('   2. Networks → Tunnels → Create a tunnel');
    console.log('   3. Beri nama tunnel (e.g. "xeniaclub")');
    console.log('   4. Copy token yang diberikan');
    console.log('   5. Paste token di sini, saya akan install-kan');

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  } finally {
    conn.end();
  }
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
