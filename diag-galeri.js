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
    console.log('=== 📝 PM2 ERROR LOG (tail 30) ===');
    const logs = await sshExec(conn, 'tail -30 /root/.pm2/logs/xeniaclub-error.log 2>/dev/null');
    console.log(logs);

    console.log('\n=== 🌐 TEST GALERI PAGE ===');
    const test = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/galeri 2>&1');
    console.log(`Galeri page: HTTP ${test}`);

    console.log('\n=== 📝 CHECK GALERI CONTENT ===');
    const content = await sshExec(conn, 'curl -s http://localhost:80/galeri 2>&1 | head -20');
    console.log(content);

  } finally { conn.end(); }
}
main().catch(console.error);
