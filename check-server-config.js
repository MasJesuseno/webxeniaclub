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
    // ─── 1. Nginx config ──────────────────────────────────
    console.log('📋 NGINX CONFIG:');
    console.log('──────────────────────────────────────────');
    const nginxConf = await sshExec(conn, 'cat /etc/nginx/sites-available/xeniaclub 2>/dev/null || echo "(no xeniaclub config found)"');
    console.log(nginxConf);
    console.log('');

    // enabled sites
    console.log('📋 NGINX ENABLED SITES:');
    console.log('──────────────────────────────────────────');
    const enabled = await sshExec(conn, 'ls -la /etc/nginx/sites-enabled/ 2>&1');
    console.log(enabled);
    console.log('');

    // ─── 2. Check what's running on ports ─────────────────
    console.log('📋 ACTIVE PORTS:');
    console.log('──────────────────────────────────────────');
    const ports = await sshExec(conn, 'ss -tlnp 2>/dev/null | grep -E ":80|:443|:3000" || netstat -tlnp 2>/dev/null | grep -E ":80|:443|:3000"');
    console.log(ports || '(none found)');
    console.log('');

    // ─── 3. PM2 status ────────────────────────────────────
    console.log('📋 PM2 PROCESSES:');
    console.log('──────────────────────────────────────────');
    const pm2 = await sshExec(conn, 'pm2 list 2>&1');
    console.log(pm2);
    console.log('');

    // ─── 4. Next.js running? ──────────────────────────────
    console.log('📋 NEXT.JS / NODE PROCESSES:');
    console.log('──────────────────────────────────────────');
    const nodePs = await sshExec(conn, 'ps aux | grep -E "node|next" | grep -v grep 2>&1');
    console.log(nodePs || '(no node/next processes running)');
    console.log('');

    // ─── 5. Test local services ───────────────────────────
    console.log('📋 LOCAL SERVICE TESTS:');
    console.log('──────────────────────────────────────────');
    const t80 = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/ 2>&1');
    console.log(`   Port 80 (Nginx): ${t80}`);

    const t3000 = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000/ 2>&1');
    console.log(`   Port 3000 (Next.js): ${t3000}`);
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
