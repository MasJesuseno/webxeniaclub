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
    // Generate hash
    const hash = bcrypt.hashSync('@Dxic1795', 12);
    console.log('Generated hash:', hash);

    // Escape $ signs for bash by writing to a temp SQL file, then sourcing it
    // This avoids bash interpreting $ signs
    const sqlContent = `UPDATE User SET password='${hash}' WHERE username='admin';`;
    
    // Write SQL file via SSH, then execute it
    console.log('\n=== Writing SQL file on server... ===');
    await sshExec(conn, `cat > /tmp/update_pw.sql << 'SQLEOF'\n${sqlContent}\nSQLEOF`);
    
    console.log('=== Executing SQL file... ===');
    const result = await sshExec(conn, 'mysql -u root xeniaclub < /tmp/update_pw.sql 2>&1');
    console.log('Result:', result || '✅ Password updated!');

    // Verify by getting hex and decoding locally
    console.log('\n=== Verifying... ===');
    const hexResult = await sshExec(conn, "mysql -u root xeniaclub -B -N -e \"SELECT HEX(password) FROM User WHERE username='admin';\"");
    const storedHash = Buffer.from(hexResult, 'hex').toString('utf-8');
    console.log('Stored hash:', storedHash);
    console.log('Length:', storedHash.length);
    
    const match = bcrypt.compareSync('@Dxic1795', storedHash);
    console.log('Password "@Dxic1795" matches:', match);
    
    const oldMatch = bcrypt.compareSync('admin123', storedHash);
    console.log('Password "admin123" matches:', oldMatch);

    if (!match) {
      console.log('\n❌ MASIH GAGAL! Stored hash tidak cocok.');
      console.log('Coba update langsung dengan hex value...');
      
      // Alternative: use hex-encoded password value
      const hexHash = Buffer.from(hash).toString('hex').toUpperCase();
      await sshExec(conn, `mysql -u root xeniaclub -e "UPDATE User SET password=UNHEX('${hexHash}') WHERE username='admin';"`);
      
      // Verify again
      const verifyResult = await sshExec(conn, "mysql -u root xeniaclub -B -N -e \"SELECT HEX(password) FROM User WHERE username='admin';\"");
      const finalHash = Buffer.from(verifyResult, 'hex').toString('utf-8');
      const finalMatch = bcrypt.compareSync('@Dxic1795', finalHash);
      console.log('After HEX update - Password matches:', finalMatch);
      console.log('Stored hash:', finalHash);
    } else {
      console.log('\n✅ PASSWORD BERHASIL DIUPDATE!');
    }

    // Show user record
    console.log('\n=== User record ===');
    const userInfo = await sshExec(conn, "mysql -u root xeniaclub -e \"SELECT id, username, name, email, isActive FROM User WHERE username='admin';\"");
    console.log(userInfo);

  } finally { conn.end(); }
}
main().catch(console.error);
