const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const conn = await mysql.createConnection('mysql://root@localhost:3306/xeniaclub');
  
  const [tables] = await conn.execute('SHOW TABLES');
  let sql = '-- Xeniaclub Database Dump\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';
  sql += 'DROP DATABASE IF EXISTS xeniaclub;\n';
  sql += 'CREATE DATABASE xeniaclub;\n';
  sql += 'USE xeniaclub;\n\n';
  
  for (const t of tables) {
    const tableName = Object.values(t)[0];
    console.log('Exporting:', tableName);
    
    const [create] = await conn.execute('SHOW CREATE TABLE `' + tableName + '`');
    sql += 'DROP TABLE IF EXISTS `' + tableName + '`;\n';
    sql += create[0]['Create Table'] + ';\n\n';
    
    const [rows] = await conn.execute('SELECT * FROM `' + tableName + '`');
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = cols.map(c => {
        const v = row[c];
        if (v === null) return 'NULL';
        if (typeof v === 'number') return String(v);
        const escaped = String(v)
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        return "'" + escaped + "'";
      });
      sql += 'INSERT INTO `' + tableName + '` (`' + cols.join('`, `') + '`) VALUES (' + vals.join(', ') + ');\n';
    }
    sql += '\n';
  }
  
  const outPath = 'C:/Users/senoz/AppData/Local/Temp/xeniaclub_dump.sql';
  fs.writeFileSync(outPath, sql);
  console.log('\n✅ Database exported to:', outPath);
  console.log('   Size:', fs.statSync(outPath).size, 'bytes');
  console.log('   Tables:', tables.length);
  
  await conn.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
