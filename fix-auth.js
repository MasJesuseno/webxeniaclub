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
    console.log('=== 🌐 VIA NGINX (PORT 80) ===');
    console.log('Auth session:', await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/api/auth/session'));
    console.log('Login page:', await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/login'));
    console.log('Homepage:', await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80/'));
    console.log('\n=== 📝 ERROR LOG ===');
    const logs = await sshExec(conn, 'tail -3 /root/.pm2/logs/xeniaclub-error.log 2>/dev/null || echo "empty"');
    console.log(logs || '(no new errors)');
    console.log('\n=== ✅ DONE ===');
  } finally { conn.end(); }
}
main().catch(console.error);
