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

async function main() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect(CONFIG);
  });

  try {
    // Rename remaining tables using single-quoted heredoc for SQL
    console.log('=== 🔄 RENAME REMAINING TABLES ===');
    
    // Use single quotes around the SQL to avoid bash backtick issues
    const cmds = [
      `mysql -u root xeniaclub -e 'RENAME TABLE \`page\` TO \`Page\`' 2>&1`,
      `mysql -u root xeniaclub -e 'RENAME TABLE \`role\` TO \`Role\`' 2>&1`,
      `mysql -u root xeniaclub -e 'RENAME TABLE \`setting\` TO \`Setting\`' 2>&1`,
      `mysql -u root xeniaclub -e 'RENAME TABLE \`user\` TO \`User\`' 2>&1`,
    ];
    
    for (const cmd of cmds) {
      try {
        await sshExec(conn, cmd);
        console.log(`  ✅ ${cmd.substring(0, 60)}...`);
      } catch (e) {
        console.log(`  ⚠️ ${e.message.slice(0, 150)}`);
      }
    }

    // Verify
    console.log('\n=== ✅ VERIFY ALL TABLES ===');
    try {
      const tables = await sshExec(conn, `mysql -u root xeniaclub -e "SHOW TABLES;" 2>&1`);
      console.log(tables);
    } catch (e) { console.log('Error:', e.message); }

    // Prisma generate
    console.log('\n=== 🔧 PRISMA GENERATE ===');
    try {
      await sshExec(conn, `cd /root/xeniaclub && npx prisma generate 2>&1`);
      console.log('✅ Prisma generated!');
    } catch (e) { console.log('Error:', e.message); }

    // Restart app
    console.log('\n=== 🚀 RESTART APP ===');
    try {
      await sshExec(conn, `cd /root/xeniaclub && pm2 restart xeniaclub 2>&1`);
      console.log('App restarted!');
    } catch (e) { console.log('Error:', e.message); }

    await new Promise(r => setTimeout(r, 5000));

    // Test
    console.log('\n=== 🌐 TEST SITE ===');
    try {
      const test = await sshExec(conn, 'curl -s -o /dev/null -w "HTTP %{http_code}\\n" http://localhost:80/ 2>&1');
      console.log(`Site: ${test}`);
    } catch (e) { console.log('Error:', e.message); }

    // Check content
    console.log('\n=== 📄 PAGE TITLE ===');
    try {
      const content = await sshExec(conn, "curl -s http://localhost:80/ 2>&1 | grep -o '<title>[^<]*</title>'");
      console.log(content);
    } catch (e) { console.log('Error:', e.message); }

    // Check error logs
    console.log('\n=== 📝 PM2 ERROR LOGS ===');
    try {
      const logs = await sshExec(conn, `tail -30 /root/.pm2/logs/xeniaclub-error.log 2>/dev/null || echo "No error log"`);
      console.log(logs);
    } catch (e) { console.log('Error:', e.message); }

  } finally {
    conn.end();
  }
}

main().catch(console.error);
