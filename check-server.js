const { Client } = require('ssh2');
const CONFIG = {
  host: '192.168.1.53',
  port: 22,
  username: 'root',
  password: 'it92528!@',
  readyTimeout: 10000,
};

function sshExec(conn, command) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
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

async function main() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect(CONFIG);
  });

  try {
    // Step 1: Update xeniaclub nginx config
    console.log('=== 📝 Updating xeniaclub nginx config ===');
    
    const newConfig = `server {
    listen 80 default_server;
    server_name 192.168.1.53 xeniaclub.or.id www.xeniaclub.or.id _;
 
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
 
    client_max_body_size 50M;
}
`;
    
    // Escape special chars for heredoc
    const escapedConfig = newConfig
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`');
    
    await sshExec(conn, `cat > /etc/nginx/sites-available/xeniaclub << 'NGINXEOF'\n${newConfig}\nNGINXEOF`);
    console.log('✅ Config written!');

    // Step 2: Test nginx config
    console.log('\n=== 🔍 Testing nginx config ===');
    const testResult = await sshExec(conn, 'nginx -t 2>&1');
    console.log(testResult);

    // Step 3: Reload nginx
    console.log('\n=== 🔄 Reloading nginx ===');
    const reloadResult = await sshExec(conn, 'nginx -s reload 2>&1');
    console.log(reloadResult || '✅ Nginx reloaded!');

    // Step 4: Test the site
    console.log('\n=== 🌐 Testing http://localhost:80 ===');
    try {
      const testSite = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP Status: %{http_code}\\nContent-Type: %{content_type}\\n" http://localhost:80/');
      console.log(testSite);
    } catch (e) { console.log('Error:', e.message); }

    console.log('\n✅ DONE! Site should now work at http://192.168.1.53');
    
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
