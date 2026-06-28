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
    // ─── 1. Service Status ──────────────────────────────────
    console.log('📋 SERVICE STATUS:');
    console.log('──────────────────────────────────────────');
    const status = await sshExec(conn, 'systemctl status cloudflared 2>&1 | head -12');
    console.log(status);
    console.log('');

    // ─── 2. Recent logs ─────────────────────────────────────
    console.log('📋 RECENT LOGS (last 30 lines):');
    console.log('──────────────────────────────────────────');
    const logs = await sshExec(conn, 'journalctl -u cloudflared -n 30 --no-pager 2>&1');
    console.log(logs);
    console.log('');

    // ─── 3. Error logs only ─────────────────────────────────
    console.log('📋 ERROR LOGS (priority error+):');
    console.log('──────────────────────────────────────────');
    const errors = await sshExec(conn, 'journalctl -u cloudflared -p err -n 20 --no-pager 2>&1');
    console.log(errors || '(no errors found)');
    console.log('');

    // ─── 4. Test tunnel ─────────────────────────────────────
    console.log('📋 CONNECTION TEST:');
    console.log('──────────────────────────────────────────');
    const testLocal = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/ 2>&1');
    console.log(`   Localhost : ${testLocal}`);
    const testTunnel = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" https://xeniaclub.or.id 2>&1 || echo "(tunnel may not resolve inside server)"');
    console.log(`   Tunnel    : ${testTunnel}`);
    console.log('');

    console.log('✅ Done!');

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
  } finally {
    conn.end();
  }
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
