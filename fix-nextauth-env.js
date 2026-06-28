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
      stream.on('close', (code) => {
        if (code === 0) resolve(stdout.trim());
        else resolve(`Exit ${code}: ${stderr.trim() || stdout.trim()}`);
      });
      stream.on('data', (data) => { stdout += data.toString(); });
      stream.stderr.on('data', (data) => { stderr += data.toString(); });
    });
  });
}

async function main() {
  console.log('🔌 Connecting...');
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect(CONFIG);
  });
  console.log('✅ Connected!\n');

  try {
    // Add AUTH_TRUST_HOST=true to .env
    console.log('1️⃣ Adding AUTH_TRUST_HOST to .env...');
    await sshExec(conn, 'echo "AUTH_TRUST_HOST=true" >> /root/xeniaclub/.env');
    const env = await sshExec(conn, 'cat /root/xeniaclub/.env');
    console.log(env);
    console.log('');

    // Restart PM2
    console.log('2️⃣ Restarting PM2...');
    await sshExec(conn, 'pm2 delete xeniaclub 2>/dev/null');
    await sshExec(conn, 'cd /root/xeniaclub && pm2 start npm --name "xeniaclub" -- start -- -p 3000 2>&1');
    console.log('✅ PM2 restarted!\n');

    // Wait and test
    console.log('3️⃣ Testing...');
    await new Promise(r => setTimeout(r, 5000));
    const t80 = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/');
    console.log(`   Port 80: ${t80}`);

    console.log('\n✅ FIXES APPLIED!');
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
