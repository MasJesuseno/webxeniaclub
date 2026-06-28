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
    // Check parent directory permissions
    console.log('=== 📁 PARENT DIR PERMISSIONS ===');
    const dirPerms = await sshExec(conn, "namei -l /root/xeniaclub/public/uploads/1782383034366-7um7p3.jpg 2>&1");
    console.log(dirPerms);

    // Check stat for new vs old files
    console.log('\n=== 📊 STAT COMPARISON ===');
    const statNew = await sshExec(conn, "stat /root/xeniaclub/public/uploads/1782383034366-7um7p3.jpg 2>&1 | grep -E 'Access|Uid|Gid|File'");
    console.log('NEW file:');
    console.log(statNew);
    const statOld = await sshExec(conn, "stat /root/xeniaclub/public/uploads/1782119360658-hgwsbh.jpeg 2>&1 | grep -E 'Access|Uid|Gid|File'");
    console.log('OLD file:');
    console.log(statOld);

    // The REAL fix: rebuild the app so Next.js recognizes the new files
    // OR just copy files to a location that Next.js can serve
    // Actually, the simplest fix: the issue is likely that we need to 
    // REBUILD the app after uploading new files, OR check if there's a different issue
    
    // Let's try: directly serve the file from disk by changing Nginx config
    // Actually, let me just check if the issue is Next.js not serving new files
    // by trying a completely different approach:
    // 1. Read the file directly with node
    console.log('\n=== 🔍 READ FILE WITH NODE AS ROOT ===');
    const nodeRead = await sshExec(conn, "node -e \"const fs=require('fs'); const f='/root/xeniaclub/public/uploads/1782383034366-7um7p3.jpg'; console.log('exists:', fs.existsSync(f)); console.log('size:', fs.statSync(f).size); console.log('readable:', fs.accessSync(f, fs.constants.R_OK)===undefined);\" 2>&1");
    console.log(nodeRead);

    // 2. Try ALTERNATIVE fix: symlink uploads to a better location
    // Actually, the simplest fix - RESTART the Next.js app and the files might work
    // OR REBUILD the app
    
    // Actually, let me check one thing first - maybe there's a case sensitivity issue
    // with the file extension. The DB says .jpg but maybe the file is .jpeg?
    console.log('\n=== 🔍 CHECK EXACT FILENAME ===');
    const exactName = await sshExec(conn, "ls /root/xeniaclub/public/uploads/ | grep 1782383034366");
    console.log('Actual filename on disk:', exactName);
    
    // The files are there. Let me just try a rebuild
    console.log('\n=== 🏗️ REBUILDING APP ===');
    const buildResult = await sshExec(conn, "cd /root/xeniaclub && npm run build 2>&1 | tail -20");
    console.log(buildResult);

    // Restart
    console.log('\n=== 🚀 RESTART ===');
    await sshExec(conn, "cd /root/xeniaclub && pm2 restart xeniaclub 2>&1");
    await new Promise(r => setTimeout(r, 5000));

    // Test
    console.log('\n=== 🌐 TEST AFTER REBUILD ===');
    const t1 = await sshExec(conn, `curl -s -o /dev/null -w "%{http_code}" http://localhost:80/uploads/1782383034366-7um7p3.jpg 2>&1`);
    console.log(`Cover image: HTTP ${t1}`);
    const t2 = await sshExec(conn, `curl -s -o /dev/null -w "%{http_code}" http://localhost:80/uploads/1782383248620-h49x8l.jpg 2>&1`);
    console.log(`Gallery item: HTTP ${t2}`);
    const t3 = await sshExec(conn, `curl -s -o /dev/null -w "%{http_code}" http://localhost:80/uploads/logo-placeholder.svg 2>&1`);
    console.log(`Old file (svg): HTTP ${t3}`);

  } finally { conn.end(); }
}
main().catch(console.error);
