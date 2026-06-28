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
      stream.on('close', (code, signal) => {
        if (code===0) resolve(stdout.trim());
        else reject(new Error(stderr.trim()));
      });
      stream.on('data', (d) => stdout+=d);
      stream.stderr.on('data', (d) => stderr+=d);
    });
  });
}
async function main() {
  const conn = new Client();
  await new Promise((r,j)=>{conn.on('ready',r);conn.on('error',j);conn.connect(CONFIG);});
  try {
    // Check env
    console.log('=== ENV ===');
    try { console.log(await sshExec(conn, 'cat /root/xeniaclub/.env')); } catch(e) { console.log(e.message); }
    // Check error logs
    console.log('\n=== PM2 ERROR LOG (tail 50) ===');
    try { console.log(await sshExec(conn, 'tail -50 /root/.pm2/logs/xeniaclub-error.log')); } catch(e) { console.log(e.message); }
    // Check if auth API route responds
    console.log('\n=== TEST AUTH API ===');
    try { 
      const r = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000/api/auth/session 2>&1');
      console.log(r);
    } catch(e) { console.log(e.message); }
    // Try logging in via API
    console.log('\n=== TEST LOGIN PAGE ===');
    try {
      const r = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000/login 2>&1');
      console.log(r);
    } catch(e) { console.log(e.message); }
    // Check next.config.ts
    console.log('\n=== NEXT.CONFIG ===');
    try { console.log(await sshExec(conn, 'cat /root/xeniaclub/next.config.ts')); } catch(e) { console.log(e.message); }
  } finally { conn.end(); }
}
main().catch(console.error);
