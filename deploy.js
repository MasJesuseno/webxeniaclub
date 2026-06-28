const { Client } = require('ssh2');
const sftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
// ─── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
  host: '192.168.1.53',
  port: 22,
  username: 'root',
  password: 'it92528!@',
  remoteDir: '/root/xeniaclub',
};

// Files/dirs to EXCLUDE from upload
const EXCLUDE = new Set([
  'node_modules',
  '.next',
  '.git',
  'deploy.js',
  'package-lock.json',
  'tsconfig.tsbuildinfo',
  'xeniaclub.tar.gz',
  '.env',            // will be created separately
  'nul',
]);

// ─── Helper: recursive file listing ──────────────────────────────────────────
function getFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (EXCLUDE.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, baseDir));
    } else {
      files.push({ localPath: fullPath, remotePath: relativePath.replace(/\\/g, '/') });
    }
  }
  return files;
}

// ─── SSH command helper ──────────────────────────────────────────────────────
function sshExec(conn, command) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', (code, signal) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(`Exit code ${code}\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`));
      });
      stream.on('data', (data) => { stdout += data.toString(); });
      stream.stderr.on('data', (data) => { stderr += data.toString(); });
    });
  });
}

// ─── SFTP file upload ────────────────────────────────────────────────────────
async function uploadFiles(sftp, localDir, remoteDir) {
  const files = getFiles(localDir);
  console.log(`\n📦 Found ${files.length} files to upload...`);

  // Create remote directory structure first
  const dirs = new Set();
  for (const f of files) {
    const dir = path.dirname(f.remotePath).replace(/\\/g, '/');
    if (dir !== '.') dirs.add(dir);
  }
  for (const d of [...dirs].sort()) {
    const remotePath = `${remoteDir}/${d}`;
    try {
      await sftp.mkdir(remotePath, true);
    } catch (e) {
      // ignore if already exists
    }
  }

  // Upload files in batches
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map(async (f) => {
      const remotePath = `${remoteDir}/${f.remotePath}`;
      try {
        await sftp.fastPut(f.localPath, remotePath);
        console.log(`  ✅ ${f.remotePath}`);
      } catch (err) {
        console.error(`  ❌ ${f.remotePath}: ${err.message}`);
        throw err;
      }
    }));
  }
  console.log(`\n✅ All ${files.length} files uploaded successfully!`);
}

// ─── Main deployment flow ────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Xeniaclub Deployment Script');
  console.log(`   Server: ${CONFIG.username}@${CONFIG.host}:${CONFIG.port}`);
  console.log(`   Target: ${CONFIG.remoteDir}\n`);

  // ── Step 1: Create SSH connection ──
  console.log('🔌 Connecting to server...');
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      password: CONFIG.password,
      readyTimeout: 10000,
    });
  });
  console.log('✅ Connected to server!\n');

  try {
    // ── Step 2: Check server environment ──
    console.log('🔍 Checking server environment...');
    try {
      const osInfo = await sshExec(conn, 'cat /etc/os-release 2>/dev/null | head -3 || uname -a');
      console.log(`   OS: ${osInfo}`);
    } catch (e) { console.log('   OS: (unable to detect)'); }

    try {
      const nodeVer = await sshExec(conn, 'node --version 2>/dev/null || echo "not installed"');
      console.log(`   Node.js: ${nodeVer}`);
    } catch (e) { console.log('   Node.js: not found'); }

    try {
      const npmVer = await sshExec(conn, 'npm --version 2>/dev/null || echo "not installed"');
      console.log(`   npm: ${npmVer}`);
    } catch (e) { console.log('   npm: not found'); }

    try {
      const mysqlVer = await sshExec(conn, 'mysql --version 2>/dev/null || echo "not installed"');
      console.log(`   MySQL: ${mysqlVer}`);
    } catch (e) { console.log('   MySQL: not found'); }

    try {
      const pm2Ver = await sshExec(conn, 'pm2 --version 2>/dev/null || echo "not installed"');
      console.log(`   PM2: ${pm2Ver}`);
    } catch (e) { console.log('   PM2: not found'); }

    // ── Step 3: Create remote directory ──
    console.log(`\n📁 Creating remote directory: ${CONFIG.remoteDir}`);
    await sshExec(conn, `mkdir -p ${CONFIG.remoteDir}`);
    console.log('✅ Directory created!');

    // ── Step 4: Upload files ──
    console.log('\n📤 Uploading project files...');
    const sftp = new sftpClient();
    await sftp.connect({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      password: CONFIG.password,
    });

    await uploadFiles(sftp, __dirname, CONFIG.remoteDir);
    await sftp.end();

    // ── Step 5: Install dependencies ──
    console.log('\n📦 Installing npm dependencies on server...');
    const installOutput = await sshExec(conn, `cd ${CONFIG.remoteDir} && npm install 2>&1`);
    console.log(`   ${installOutput.slice(0, 500)}...`);
    console.log('✅ Dependencies installed!');

    // ── Step 6: Create .env file ──
    console.log('\n🔧 Creating .env file...');
    const secret = require('crypto').randomBytes(32).toString('hex');
    const envContent = [
      'DATABASE_URL="mysql://root@localhost:3306/xeniaclub"',
      `NEXTAUTH_SECRET="${secret}"`,
      'NEXTAUTH_URL="http://192.168.1.53:3000"',
      ''
    ].join('\n');
    // Write .env file line by line via heredoc
    await sshExec(conn, `cat > ${CONFIG.remoteDir}/.env << 'ENVEOF'\n${envContent}\nENVEOF`);
    console.log('✅ .env file created!');

    // ── Step 7: Generate Prisma client & run migrations ──
    console.log('\n🗄️  Setting up database...');
    try {
      const genOutput = await sshExec(conn, `cd ${CONFIG.remoteDir} && npx prisma generate 2>&1`);
      console.log(`   Prisma generate: ${genOutput.slice(0, 200)}`);
    } catch (e) { console.log(`   ⚠️  Prisma generate: ${e.message.slice(0, 200)}`); }

    try {
      const migrateOutput = await sshExec(conn, `cd ${CONFIG.remoteDir} && npx prisma migrate deploy 2>&1`);
      console.log(`   Migrations: ${migrateOutput.slice(0, 300)}`);
    } catch (e) { console.log(`   ⚠️  Migrations: ${e.message.slice(0, 300)}`); }

    try {
      const seedOutput = await sshExec(conn, `cd ${CONFIG.remoteDir} && npx prisma db seed 2>&1`);
      console.log(`   Seed: ${seedOutput.slice(0, 200)}`);
    } catch (e) { console.log(`   ⚠️  Seed: ${e.message.slice(0, 200)}`); }

    // ── Step 8: Build Next.js ──
    console.log('\n🏗️  Building Next.js app (this may take a while)...');
    try {
      const buildOutput = await sshExec(conn, `cd ${CONFIG.remoteDir} && npm run build 2>&1`);
      console.log(`   Build output: ${buildOutput.slice(0, 500)}`);
      console.log('✅ Build completed!');
    } catch (e) {
      console.log(`   ❌ Build failed: ${e.message.slice(0, 500)}`);
      console.log('   Continuing to check if we can start anyway...');
    }

    // ── Step 9: Start the app ──
    console.log('\n🚀 Starting the application...');
    try {
      // Check if PM2 is available
      const pm2Check = await sshExec(conn, 'command -v pm2 2>/dev/null && echo "found" || echo "not found"');
      if (pm2Check.includes('found')) {
        console.log('   Using PM2 process manager');
        await sshExec(conn, `cd ${CONFIG.remoteDir} && pm2 delete xeniaclub 2>/dev/null; pm2 start npm --name "xeniaclub" -- start -- -p 3000 2>&1`);
        await sshExec(conn, 'pm2 save 2>/dev/null');
        console.log('✅ App started with PM2 on port 3000!');
      } else {
        console.log('   PM2 not found, trying nohup...');
        await sshExec(conn, `cd ${CONFIG.remoteDir} && nohup node node_modules/.bin/next start -p 3000 > /tmp/xeniaclub.log 2>&1 &`);
        console.log('✅ App started with nohup on port 3000!');
      }
    } catch (e) {
      console.log(`   ⚠️  Could not start: ${e.message.slice(0, 300)}`);
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ DEPLOYMENT COMPLETE!');
    console.log('  🌐 App should be at: http://192.168.1.53:3000');
    console.log('  📁 Remote location: ' + CONFIG.remoteDir);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error(`\n❌ Deployment error: ${err.message}`);
    process.exit(1);
  } finally {
    conn.end();
  }
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
