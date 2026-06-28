const bcrypt = require('bcryptjs');
const { Client } = require('ssh2');
const CONFIG = {
  host: '192.168.1.53', port: 22, username: 'root',
  password: 'it92528!@', readyTimeout: 10000,
};

function sshExec(conn, command) {
  return new Promise((resolve, reject) => {
    let stdout='', stderr='';
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', (code) => {
        if (code===0) resolve(stdout.trim());
        else reject(new Error(stderr.trim()));
      });
      stream.on('data', d => stdout+=d);
      stream.stderr.on('data', d => stderr+=d);
    });
  });
}

async function main() {
  const conn = new Client();
  await new Promise((r,j)=>{conn.on('ready',r);conn.on('error',j);conn.connect(CONFIG);});
  try {
    // 1. Check stored password hash
    console.log('=== 🔍 CEK HASH PASSWORD ===');
    const hexResult = await sshExec(conn, "mysql -u root xeniaclub -B -N -e \"SELECT HEX(password) FROM User WHERE username='admin';\"");
    const storedHash = Buffer.from(hexResult, 'hex').toString('utf-8');
    console.log('Stored hash:', storedHash);
    console.log('Length:', storedHash.length);
    
    const match = bcrypt.compareSync('@Dxic1795', storedHash);
    console.log('Password match @Dxic1795:', match);
    
    if (!match) {
      console.log('\n⚠️ Hash tidak cocok! Update ulang...');
      const newHash = bcrypt.hashSync('@Dxic1795', 12);
      console.log('New hash:', newHash);
      
      // Use SQL file approach to avoid $ escaping issues
      await sshExec(conn, `cat > /tmp/update_pw.sql << 'SQLEOF'\nUPDATE User SET password='${newHash}' WHERE username='admin';\nSQLEOF`);
      await sshExec(conn, 'mysql -u root xeniaclub < /tmp/update_pw.sql');
      
      // Verify
      const verifyHex = await sshExec(conn, "mysql -u root xeniaclub -B -N -e \"SELECT HEX(password) FROM User WHERE username='admin';\"");
      const verifyHash = Buffer.from(verifyHex, 'hex').toString('utf-8');
      const verifyMatch = bcrypt.compareSync('@Dxic1795', verifyHash);
      console.log('After re-update - match:', verifyMatch);
    } else {
      console.log('✅ Hash sudah benar!');
    }

    // 2. Also try recreating user to be safe
    console.log('\n=== 🔄 PASTIKAN USER AKTIF ===');
    const userStatus = await sshExec(conn, "mysql -u root xeniaclub -e \"SELECT id, username, name, email, isActive FROM User WHERE username='admin';\"");
    console.log(userStatus);

    // 3. Restart PM2 app
    console.log('\n=== 🚀 RESTART APP ===');
    await sshExec(conn, 'cd /root/xeniaclub && pm2 restart xeniaclub 2>&1');
    console.log('App restarted!');
    await new Promise(r => setTimeout(r, 5000));

    // 4. Test login via curl POST
    console.log('\n=== 🌐 TEST LOGIN VIA API ===');
    try {
      // First get CSRF token
      const csrfResult = await sshExec(conn, "curl -s http://localhost:80/api/auth/csrf 2>&1");
      console.log('CSRF response:', csrfResult);
    } catch(e) { console.log('CSRF error:', e.message); }

    // Test auth session
    try {
      const sessionResult = await sshExec(conn, 'curl -s -w "\\nHTTP %{http_code}" http://localhost:80/api/auth/session 2>&1');
      console.log('Session check:', sessionResult);
    } catch(e) { console.log('Session error:', e.message); }

    // 5. Check error logs
    console.log('\n=== 📝 ERROR LOGS (tail 15) ===');
    try {
      const logs = await sshExec(conn, 'tail -15 /root/.pm2/logs/xeniaclub-error.log 2>/dev/null');
      console.log(logs || '(empty - no new errors)');
    } catch(e) { console.log('No error log:', e.message); }

  } finally { conn.end(); }
}
main().catch(console.error);
