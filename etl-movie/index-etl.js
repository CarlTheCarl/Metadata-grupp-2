import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractMovies } from './extract.js';
import { transformAll } from './transform.js';
import { connect, insertMovies } from './load.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const cfg = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    movieDataPath: path.join(__dirname, 'mockups', 'mock_movies_data.csv')
  };

  console.log('[ETL] Startar ETL-flöde för filmer...');
  console.log('[ETL] Läser från:', cfg.movieDataPath);

  const extracted = await extractMovies(cfg.movieDataPath);
  console.log('[ETL] Extract klart. Antal rader:', extracted.length);

  const models = transformAll(extracted);
  console.log('[ETL] Transform klart.');

  const pool = await connect(cfg);
  const res = await insertMovies(pool, models);
  await pool.end();

  console.log(`[ETL] Load klart. Infogade rader: ${res.inserted}`);
  console.log('[ETL] Färdigt.');
}

main().catch(err => {
  console.error('ETL-fel:', err);
  process.exit(1);
});