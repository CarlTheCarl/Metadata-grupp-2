import 'dotenv/config';
import { extractAll } from './extract.js';
import { transformAll } from './transform.js';
import { connect, insertMany } from './load.js';

async function main() {
  const cfg = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    scanRoot: process.env.SCAN_ROOT || './testdata'
  };

  console.log('[ETL] Startar...');
  console.log('[ETL] Skannar rotmapp:', cfg.scanRoot);

  const extracted = await extractAll(cfg.scanRoot);
  console.log('[ETL] Extract klart. Antal filer:', extracted.length);
  console.log('[ETL] Första 5 filer:', extracted.slice(0,5).map(f => f.filename));

  const models = transformAll(extracted);
  console.log('[ETL] Transform klart.');

  const pool = await connect(cfg);
  const res = await insertMany(pool, models);
  await pool.end();

  console.log(`[ETL] Load klart. Infogade rader: ${res.inserted}`);
  console.log('[ETL] Färdigt.');
}

main().catch(err => {
  console.error('ETL fel:', err);
  process.exit(1);
});
