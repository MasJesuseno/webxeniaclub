const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Map model names to table names
const MODELS = [
  'user', 'role', 'userRole', 'post', 'category', 'tag', 'postTag',
  'page', 'menu', 'menuItem', 'album', 'galleryItem',
  'testimonial', 'partner', 'contact', 'comment', 'setting', 'siteProfile'
];

function escapeSQL(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return "'" + val.toISOString().slice(0, 19).replace('T', ' ') + "'";
  const s = String(val)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
  return "'" + s + "'";
}

async function main() {
  // Get table info first
  const tableNames = [];
  for (const model of MODELS) {
    try {
      // Try to find the table name using Prisma introspection or raw query
      const [raw] = await prisma.$queryRawUnsafe(`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='xeniaclub' AND TABLE_NAME LIKE '%${model}%' LIMIT 1`);
      if (raw) {
        const tname = Object.values(raw)[0];
        const tableNames = Object.values(raw)[0];
        console.log('Found:', tableNames);
      }
    } catch(e) {
      // skip
    }
  }

  // Get all tables from information_schema
  const tables = await prisma.$queryRawUnsafe("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='xeniaclub' ORDER BY TABLE_NAME");
  
  let sql = '-- Xeniaclub Database Dump\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';
  sql += 'DROP DATABASE IF EXISTS xeniaclub;\n';
  sql += 'CREATE DATABASE xeniaclub;\n';
  sql += 'USE xeniaclub;\n\n';

  for (const t of tables) {
    const tableName = Object.values(t)[0];
    console.log('Exporting:', tableName);

    // Get CREATE TABLE
    const [createResult] = await prisma.$queryRawUnsafe('SHOW CREATE TABLE `' + tableName + '`');
    const createStmt = Object.values(createResult)[1];
    
    sql += 'DROP TABLE IF EXISTS `' + tableName + '`;\n';
    sql += createStmt + ';\n\n';

    // Get data
    const rows = await prisma.$queryRawUnsafe('SELECT * FROM `' + tableName + '`');
    
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = cols.map(c => escapeSQL(row[c]));
      sql += 'INSERT INTO `' + tableName + '` (`' + cols.join('`, `') + '`) VALUES (' + vals.join(', ') + ');\n';
    }
    sql += '\n';
  }

  const outPath = 'C:/Users/senoz/AppData/Local/Temp/xeniaclub_dump.sql';
  fs.writeFileSync(outPath, sql);
  console.log('\n✅ Database exported to:', outPath);
  const stats = fs.statSync(outPath);
  console.log('   Size:', (stats.size / 1024).toFixed(1), 'KB');
  console.log('   Tables:', tables.length);
  
  await prisma.$disconnect();
}

main().catch(e => { 
  console.error('Error:', e.message); 
  process.exit(1); 
});
