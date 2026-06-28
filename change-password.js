const bcrypt = require('bcryptjs');
const { Client } = require('ssh2');
const CONFIG = {
  host: '192.168.1.53', port: 22, username: 'root',
  password: 'it92528!@', readyTimeout: 10000,
};
const NEW_PASSWORD = '@Dxic1795';

async function main() {
  // Hash locally
  console.log('🔐 Hashing password...');
  const hashed = await bcrypt.hash(NEW_PASSWORD, 12);
  console.log(`Hash: ${hashed}\n`);

  // Connect to server
  console.log('🔌 Connecting to server...');
  const conn = new Client();
  await new Promise((r,j)=>{conn.on('ready',r);conn.on('error',j);conn.connect(CONFIG);});
  
  try {
    // Escape single quotes in hash for SQL
    const escapedHash = hashed.replace(/'/g, "''");
    
    // Update password in database
    console.log('🔄 Updating admin password...');
    const result = await new Promise((resolve, reject) => {
      let stdout='', stderr='';
      conn.exec(
        `mysql -u root xeniaclub -e "UPDATE User SET password='${escapedHash}' WHERE username='admin' OR email='admin@xeniaclub.or.id';" 2>&1`,
        (err, stream) => {
          if (err) return reject(err);
          stream.on('close', (code) => {
            if (code===0) resolve(stdout.trim());
            else reject(new Error(stderr.trim()));
          });
          stream.on('data', d => stdout+=d);
          stream.stderr.on('data', d => stderr+=d);
        }
      );
    });
    console.log('✅ Password updated!');

    // Verify password was updated
    console.log('\n🔍 Verifying...');
    const verify = await new Promise((resolve, reject) => {
      let stdout='', stderr='';
      conn.exec(
        `mysql -u root xeniaclub -e "SELECT id, username, name, email FROM User WHERE username='admin';" 2>&1`,
        (err, stream) => {
          if (err) return reject(err);
          stream.on('close', (code) => {
            if (code===0) resolve(stdout.trim());
            else reject(new Error(stderr.trim()));
          });
          stream.on('data', d => stdout+=d);
          stream.stderr.on('data', d => stderr+=d);
        }
      );
    });
    console.log(verify);

    console.log('\n✅ Password berhasil diubah menjadi: @Dxic1795');
    console.log('📝 Username: admin');
    console.log('🌐 Login di: http://192.168.1.53/login');
    
  } finally {
    conn.end();
  }
}

main().catch(console.error);
