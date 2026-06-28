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
        else reject(new Error(`Exit code ${code}\nSTDERR: ${stderr.trim()}`));
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
    // ─── STEP 1: Check if cloudflared already installed ─────
    console.log('🔍 Checking if cloudflared is already installed...');
    try {
      const version = await sshExec(conn, 'cloudflared --version 2>&1');
      console.log(`   Found: ${version}`);
    } catch (e) {
      console.log('   cloudflared not found, will install...');
    }

    // ─── STEP 2: Install cloudflared ────────────────────────
    console.log('\n📦 Installing cloudflared...');
    console.log('   Downloading package...');
    try {
      const installOutput = await sshExec(conn, `
        curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb 2>&1 && \
        dpkg -i /tmp/cloudflared.deb 2>&1
      `);
      console.log(`   ${installOutput.slice(0, 500)}`);
      console.log('✅ cloudflared installed!');
    } catch (e) {
      // Maybe already installed via apt
      console.log(`   Note: ${e.message.slice(0, 300)}`);
    }

    // Verify installation
    try {
      const ver = await sshExec(conn, 'cloudflared --version 2>&1');
      console.log(`   Version: ${ver}`);
    } catch (e) {
      console.error('❌ cloudflared installation failed!');
      throw e;
    }

    // ─── STEP 3: Install service with token ─────────────────
    console.log('\n🔧 Installing cloudflared service...');
    try {
      const svcInstall = await sshExec(conn, `cloudflared service install ${TUNNEL_TOKEN} 2>&1`);
      console.log(`   ${svcInstall || '✅ Service installed!'}`);
    } catch (e) {
      console.log(`   ${e.message.slice(0, 500)}`);
    }

    // ─── STEP 4: Start service ──────────────────────────────
    console.log('\n🚀 Starting cloudflared service...');
    try {
      await sshExec(conn, 'systemctl daemon-reload 2>&1');
      await sshExec(conn, 'systemctl start cloudflared 2>&1');
      await sshExec(conn, 'systemctl enable cloudflared 2>&1');
      console.log('✅ Service started & enabled on boot!');
    } catch (e) {
      console.log(`   ${e.message.slice(0, 300)}`);
    }

    // ─── STEP 5: Verify service ─────────────────────────────
    console.log('\n🔍 Verifying service status...');
    await new Promise(r => setTimeout(r, 3000));
    try {
      const status = await sshExec(conn, 'systemctl status cloudflared 2>&1 | head -20');
      console.log(`   ${status}`);
    } catch (e) {
      console.log(`   ${e.message.slice(0, 500)}`);
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅ CLOUDFLARE TUNNEL INSTALLATION COMPLETE!');
    console.log('  🖥️  Server: 192.168.1.53');
    console.log('  🌐 Tunnel: xeniaclub.or.id');
    console.log('═══════════════════════════════════════════════');
    console.log('\n📋 Verify di dashboard Cloudflare:');
    console.log('   https://one.dash.cloudflare.com/ → Networks → Tunnels');

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
