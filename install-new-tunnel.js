const { Client } = require('ssh2');

const CONFIG = {
  host: '192.168.1.53',
  port: 22,
  username: 'root',
  password: 'it92528!@',
  readyTimeout: 15000,
};

const TUNNEL_TOKEN = 'eyJhIjoiZmZlNDZhZjg0MDliZWQ0M2FkNDA0Nzk5NWEwYjhjZDUiLCJ0IjoiNDhlYWM3YjUtOThmNi00OWQ1LTljNTEtOTFjZjM0NjI4OWNjIiwicyI6IlpXUTNPVEk0TVdJdE5XSTBPQzAwT0Raa0xUZzNOMll0WWpKa09UaGpOemRpTldSaiJ9';

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
  console.log('🔌 Connecting to 192.168.1.53...');
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect(CONFIG);
  });
  console.log('✅ Connected!\n');

  try {
    // ─── Install service ───────────────────────────────────
    console.log('🔧 Installing new tunnel service...');
    const install = await sshExec(conn, `cloudflared service install ${TUNNEL_TOKEN} 2>&1`);
    console.log(`   ${install || '✅ Service installed'}`);

    // ─── Start service ─────────────────────────────────────
    console.log('🚀 Starting service...');
    await sshExec(conn, 'systemctl daemon-reload 2>&1');
    await sshExec(conn, 'systemctl start cloudflared 2>&1');
    await sshExec(conn, 'systemctl enable cloudflared 2>&1');
    console.log('✅ Service started & enabled!');

    // ─── Verify ────────────────────────────────────────────
    console.log('\n🔍 Verifying...');
    await new Promise(r => setTimeout(r, 3000));
    const status = await sshExec(conn, 'systemctl status cloudflared 2>&1 | head -15');
    console.log(status);

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅ TUNNEL BARU TERINSTALL!');
    console.log('═══════════════════════════════════════════════');
    console.log('\n📋 Jangan lupa set Public Hostname di dashboard:');
    console.log('   1. https://one.dash.cloudflare.com/');
    console.log('   2. Networks → Tunnels → klik tunnel');
    console.log('   3. Public Hostname → Add');
    console.log('   4. Domain: xeniaclub.or.id');
    console.log('   5. Service: HTTP → localhost:80');
    console.log('   6. Save');

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
