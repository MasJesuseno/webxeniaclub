const { Client } = require('ssh2');

const CONFIG = {
  host: '43.129.43.213',
  port: 22,
  username: 'ubuntu',
  password: 'ninja-94$-panda',
};

const DB_PASS = '487a1beddafd0e63';
const MYSQL = `mysql -u root -p'${DB_PASS}' xeniaclub`;

function sshExec(conn, command) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', (code) => {
        resolve({ stdout, stderr, code });
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

async function main() {
  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn.on('ready', async () => {
      console.log('SSH connected to server\n');

      try {
        // Step 1: Backup
        console.log('📦 STEP 1: Backup data sebelum hapus...');
        const backupCmd = `${MYSQL} -e "
          CREATE TABLE IF NOT EXISTS backup_registrationdata_test2025 AS
          SELECT rd.* FROM RegistrationData rd
          INNER JOIN RegistrationPeriod rp ON rd.registrationPeriodId = rp.id
          WHERE rp.period = 'TEST-2025';

          CREATE TABLE IF NOT EXISTS backup_registrationperiod_test2025 AS
          SELECT * FROM RegistrationPeriod WHERE period = 'TEST-2025';
        "`;
        const backup = await sshExec(conn, backupCmd);
        console.log(backup.stdout || backup.stderr);
        console.log('✅ Backup selesai\n');

        // Step 2: Delete RegistrationData
        console.log('🗑️  STEP 2: Menghapus RegistrationData...');
        const deleteData = await sshExec(conn,
          `${MYSQL} -e "DELETE rd FROM RegistrationData rd INNER JOIN RegistrationPeriod rp ON rd.registrationPeriodId = rp.id WHERE rp.period = 'TEST-2025';"`
        );
        console.log(deleteData.stdout || deleteData.stderr);
        if (deleteData.stderr && deleteData.stderr.includes('Error')) {
          console.log('❌ Error saat hapus RegistrationData');
          conn.end();
          resolve();
          return;
        }
        console.log('✅ RegistrationData terhapus\n');

        // Step 3: Delete RegistrationPeriod
        console.log('🗑️  STEP 3: Menghapus RegistrationPeriod...');
        const deletePeriod = await sshExec(conn,
          `${MYSQL} -e "DELETE FROM RegistrationPeriod WHERE period = 'TEST-2025';"`
        );
        console.log(deletePeriod.stdout || deletePeriod.stderr);
        if (deletePeriod.stderr && deletePeriod.stderr.includes('Error')) {
          console.log('❌ Error saat hapus RegistrationPeriod');
          conn.end();
          resolve();
          return;
        }
        console.log('✅ RegistrationPeriod terhapus\n');

        // Step 4: Verify
        console.log('🔍 STEP 4: Verifikasi...');
        const verify1 = await sshExec(conn,
          `${MYSQL} -e "SELECT COUNT(*) as sisa_data FROM RegistrationData WHERE registrationPeriodId = 'cms2tuznj0000qwvo1rwakwov';"`
        );
        console.log('Sisa RegistrationData:', verify1.stdout);

        const verify2 = await sshExec(conn,
          `${MYSQL} -e "SELECT COUNT(*) as sisa_periode FROM RegistrationPeriod WHERE period = 'TEST-2025';"`
        );
        console.log('Sisa RegistrationPeriod:', verify2.stdout);

        console.log('\n🎉 SELESAI! Semua data Register periode TEST-2025 berhasil dihapus dari server production.');

      } catch (err) {
        console.error('❌ Error:', err.message);
      }

      conn.end();
      resolve();
    });

    conn.on('error', (err) => {
      console.error('SSH Error:', err.message);
      reject(err);
    });

    conn.connect(CONFIG);
  });
}

main().catch(console.error);
