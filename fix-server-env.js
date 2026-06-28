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
    // Fix 1: Update NEXTAUTH_URL
    console.log('1️⃣ Updating NEXTAUTH_URL...');
    await sshExec(conn, `sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://xeniaclub.or.id|' /root/xeniaclub/.env`);
    const env = await sshExec(conn, 'grep NEXTAUTH_URL /root/xeniaclub/.env');
    console.log(`   ${env}`);

    // Fix 2: Regenerate password for dxic1795
    console.log('\n2️⃣ Regenerating password for dxic1795...');
    const result = await sshExec(conn, `cd /root/xeniaclub && node -e "
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('@Dxic1795', 12);
      const { execSync } = require('child_process');
      execSync('mysql -u root xeniaclub -e \\\"UPDATE User SET password=\\\\\"' + hash + '\\\\\" WHERE username=\\\\\\"dxic1795\\\\\\";\\\"', { stdio: 'inherit' });
      console.log('Password updated with hash:', hash.substring(0, 15) + '...');
    "`);
    console.log(`   ${result || 'OK'}`);

    // Verify
    console.log('\n3️⃣ Verifying...');
    const verify = await sshExec(conn, 'mysql -u root xeniaclub -e "SELECT id, username, LENGTH(password) as pw_len FROM User WHERE username=\'dxic1795\'"');
    console.log(`   ${verify}`);

    // Fix 3: Restart PM2
    console.log('\n4️⃣ Restarting PM2...');
    await sshExec(conn, 'pm2 restart xeniaclub 2>&1');
    console.log('   ✅ Restarted!\n');

    console.log('✅ ALL FIXES APPLIED!');
    console.log('   NEXTAUTH_URL → https://xeniaclub.or.id');
    console.log('   Password dxic1795 → @Dxic1795');

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
