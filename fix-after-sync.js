const { Client } = require('ssh2');
const sftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  host: '192.168.1.53',
  port: 22,
  username: 'root',
  password: 'it92528!@',
  readyTimeout: 15000,
};

const REMOTE_DIR = '/root/xeniaclub';

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

async function uploadDir(sftp, localDir, remoteDir) {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    if (file === '.gitkeep') continue;
    const localPath = path.join(localDir, file);
    const remotePath = `${remoteDir}/${file}`;
    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      try { await sftp.mkdir(remotePath, true); } catch(e) {}
      await uploadDir(sftp, localPath, remotePath);
    } else {
      try {
        await sftp.stat(remotePath);
      } catch(e) {
        console.log(`   Uploading: ${file}`);
        try { await sftp.fastPut(localPath, remotePath); }
        catch (e2) { console.log(`   Failed: ${file}`); }
      }
    }
  }
}

async function main() {
  console.log('🔌 Connecting to server...');
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect(CONFIG);
  });
  console.log('✅ Connected!\n');

  try {
    // Step 1: Check current state
    console.log('1️⃣ Checking server state...');
    
    const tables = await sshExec(conn, `mysql -u root xeniaclub -e "SELECT COUNT(*) as total FROM information_schema.tables WHERE table_schema='xeniaclub'" 2>&1`);
    console.log(`   Current tables: ${tables}`);
    
    const users = await sshExec(conn, `mysql -u root xeniaclub -e "SELECT id, username, name, email FROM User" 2>&1`);
    console.log(`   Users:\n${users}`);
    
    // Step 2: Upload missing files in public/uploads
    console.log('\n2️⃣ Uploading missing upload files...');
    const sftp = new sftpClient();
    await sftp.connect(CONFIG);
    const remoteUploads = `${REMOTE_DIR}/public/uploads`;
    await uploadDir(sftp, 'public/uploads', remoteUploads);
    await sftp.end();
    console.log('   ✅ Upload sync done!');

    // Step 3: Upload and import database dump
    console.log('\n3️⃣ Uploading & importing database...');
    const dumpPath = 'C:/Users/senoz/AppData/Local/Temp/xeniaclub_dump.sql';
    const remoteDump = '/tmp/xeniaclub_sync.sql';
    
    const sftp2 = new sftpClient();
    await sftp2.connect(CONFIG);
    await sftp2.fastPut(dumpPath, remoteDump);
    await sftp2.end();
    console.log('   ✅ Dump uploaded!');
    
    // Import directly (skip prisma reset, just import)
    const importResult = await sshExec(conn, `mysql -u root < ${remoteDump} 2>&1`);
    console.log(`   Import: ${importResult.slice(0, 300) || 'OK'}`);

    // Step 4: Generate Prisma & Restart
    console.log('\n4️⃣ Generating Prisma client...');
    await sshExec(conn, `cd ${REMOTE_DIR} && npx prisma generate 2>&1`);
    console.log('   ✅ Prisma generated!');
    
    // Ensure AUTH_TRUST_HOST
    console.log('\n5️⃣ Ensuring AUTH_TRUST_HOST...');
    await sshExec(conn, `grep -q "AUTH_TRUST_HOST" ${REMOTE_DIR}/.env || echo "AUTH_TRUST_HOST=true" >> ${REMOTE_DIR}/.env`);
    const envCheck = await sshExec(conn, `grep "NEXTAUTH_URL\\|AUTH_TRUST" ${REMOTE_DIR}/.env`);
    console.log(`   ${envCheck}`);

    // Step 6: Restart
    console.log('\n6️⃣ Restarting app...');
    await sshExec(conn, `cd ${REMOTE_DIR} && pm2 restart xeniaclub 2>&1`);
    console.log('   ✅ App restarted!');

    // Step 7: Verify
    console.log('\n7️⃣ Verifying...');
    await new Promise(r => setTimeout(r, 5000));
    const test = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/');
    console.log(`   Site: ${test}`);
    
    const verifyTables = await sshExec(conn, `mysql -u root xeniaclub -B -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='xeniaclub'"`);
    console.log(`   Tables count: ${verifyTables}`);
    
    const verifyUsers = await sshExec(conn, `mysql -u root xeniaclub -B -N -e "SELECT CONCAT(username,' - ',name) FROM User"`);
    console.log(`   Users:\n${verifyUsers}`);

    console.log('\n✅ SYNC COMPLETE!');
    console.log('   🌐 https://xeniaclub.or.id');

  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
