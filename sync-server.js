const { Client } = require('ssh2');
const sftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  host: '192.168.1.53',
  port: 22,
  username: 'root',
  password: 'it92528!@',
  readyTimeout: 10000,
};

const REMOTE_DIR = '/root/xeniaclub';

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

async function uploadDir(sftp, localDir, remoteDir) {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const remotePath = `${remoteDir}/${file}`;
    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      await sftp.mkdir(remotePath, true);
      await uploadDir(sftp, localPath, remotePath);
    } else {
      try { await sftp.fastPut(localPath, remotePath); }
      catch (e) { throw new Error(`Failed to upload ${file}: ${e.message}`); }
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
    // ─── STEP 1: Upload foto ────────────────────────────────
    console.log('📸 Uploading public/uploads/ files...');
    const sftp = new sftpClient();
    await sftp.connect(CONFIG);
    const remoteUploads = `${REMOTE_DIR}/public/uploads`;
    
    // Count local files
    const localFiles = fs.readdirSync('public/uploads').filter(f => f !== '.' && f !== '..');
    console.log(`   Local files: ${localFiles.length}`);

    // Upload
    await uploadDir(sftp, 'public/uploads', remoteUploads);
    console.log('✅ All upload files synced!\n');

    // ─── STEP 2: Upload database dump ──────────────────────
    console.log('🗄️  Uploading database dump...');
    const dumpPath = 'C:/Users/senoz/AppData/Local/Temp/xeniaclub_dump.sql';
    const remoteDump = '/tmp/xeniaclub_dump.sql';
    await sftp.fastPut(dumpPath, remoteDump);
    console.log('✅ Database dump uploaded!\n');
    
    await sftp.end();

    // ─── STEP 3: Import database ────────────────────────────
    console.log('🗄️  Importing database on server...');
    
    // First reset the database
    try {
      await sshExec(conn, `cd ${REMOTE_DIR} && npx prisma migrate reset --force 2>&1`);
      console.log('   Database reset!');
    } catch (e) {
      console.log(`   ⚠️ Reset note: ${e.message.slice(0, 200)}`);
    }

    // Then import the dump
    try {
      const importResult = await sshExec(conn, `mysql -u root < /tmp/xeniaclub_dump.sql 2>&1`);
      console.log(`   Import: ${importResult || '✅ Database imported!'}`);
    } catch (e) {
      console.log(`   ⚠️ Import note: ${e.message.slice(0, 200)}`);
    }

    // Generate Prisma client
    try {
      const genResult = await sshExec(conn, `cd ${REMOTE_DIR} && npx prisma generate 2>&1`);
      console.log(`   Prisma generate: ${genResult.slice(0, 200)}`);
    } catch (e) {
      console.log(`   ⚠️ Generate: ${e.message.slice(0, 200)}`);
    }

    // Run migrations to make sure schema is up to date
    try {
      const migrateResult = await sshExec(conn, `cd ${REMOTE_DIR} && npx prisma migrate deploy 2>&1`);
      console.log(`   Migrations: ${migrateResult.slice(0, 200)}`);
    } catch (e) {
      console.log(`   ⚠️ Migrations: ${e.message.slice(0, 200)}`);
    }

    // ─── STEP 4: Restart app ────────────────────────────────
    console.log('\n🚀 Restarting the app...');
    try {
      await sshExec(conn, `cd ${REMOTE_DIR} && pm2 restart xeniaclub 2>&1`);
      console.log('✅ App restarted!');
    } catch (e) {
      console.log(`   ⚠️ Restart: ${e.message.slice(0, 200)}`);
    }

    // ─── STEP 5: Verify ─────────────────────────────────────
    console.log('\n🔍 Verifying...');
    try {
      const test = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/');
      console.log(`   Site: ${test}`);
    } catch (e) {
      console.log(`   ⚠️ Check: ${e.message.slice(0, 200)}`);
    }
    
    try {
      const tables = await sshExec(conn, `mysql -u root xeniaclub -e "SELECT COUNT(*) as total FROM information_schema.tables WHERE table_schema='xeniaclub'" 2>&1`);
      console.log(`   Tables: ${tables}`);
    } catch (e) {
      console.log(`   ⚠️ Tables: ${e.message.slice(0, 200)}`);
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅ SYNC COMPLETE!');
    console.log('  🌐 http://192.168.1.53');
    console.log('═══════════════════════════════════════════════');

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
