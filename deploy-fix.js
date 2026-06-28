const { Client } = require('ssh2');
const sftpClient = require('ssh2-sftp-client');
const fs = require('fs');
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
    // Upload fixed file
    console.log('📤 Uploading fixed galeri page...');
    const sftp = new sftpClient();
    await sftp.connect(CONFIG);
    await sftp.fastPut(
      'src/app/(public)/galeri/page.tsx',
      '/root/xeniaclub/src/app/(public)/galeri/page.tsx'
    );
    await sftp.end();
    console.log('✅ File uploaded!');

    // Rebuild
    console.log('\n🏗️ Rebuilding app (this takes a moment)...');
    const build = await sshExec(conn, 'cd /root/xeniaclub && npm run build 2>&1 | tail -5');
    console.log(build);

    // Restart
    console.log('\n🚀 Restarting...');
    await sshExec(conn, 'cd /root/xeniaclub && pm2 restart xeniaclub 2>&1');
    await new Promise(r => setTimeout(r, 5000));

    // Test
    console.log('\n🌐 Testing galeri page...');
    const test = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/galeri 2>&1');
    console.log(`Galeri page: HTTP ${test}`);

    // Check for errors
    console.log('\n📝 Error log (tail 5):');
    try {
      const logs = await sshExec(conn, 'tail -5 /root/.pm2/logs/xeniaclub-error.log 2>/dev/null');
      console.log(logs || '(no new errors)');
    } catch(e) { console.log('(empty)'); }

    console.log('\n✅ Done!');
  } finally { conn.end(); }
}
main().catch(console.error);
