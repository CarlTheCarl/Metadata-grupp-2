import dotenv from 'dotenv';
dotenv.config();

import { extract } from './books-extract.js';
import { transformAll } from './books-transform.js';
import { connect, createTableIfNotExists, insertMany } from './books-load.js';

// hämtar inställningar från miljövariabler och sätter sökväg till CSV
async function main() {
  const cfg = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    csvPath: './mock_books_data_with_genre.csv'
  };

  console.log('[ETL] Startar...');

  // Kopplar till databasen
  const pool = await connect(cfg);

  // Testar om databasen svarar
  try {
    const [rows] = await pool.query('SELECT NOW() as now');
    console.log('[ETL] Databasen svarade:', rows[0].now);
  } catch (err) {
    console.error('[ETL] Fel vid databaskoppling:', err.message);
    process.exit(1);
  }

  // Läser in rådata från CSV-filen
  const raw = await extract(cfg.csvPath);
  console.log('[ETL] Extract klart. Antal rader:', raw.length);

  // Transformera datan
  const models = transformAll(raw);
  console.log('[ETL] Transform klart.');

  // Skapa tabell
  await createTableIfNotExists(pool);

  // Ladda datan i databasen
  const result = await insertMany(pool, models);
  console.log(`[ETL] Load klart. Infogade rader: ${result.inserted}`);

  // Stäng koppling
  await pool.end();
  console.log('[ETL] Färdigt.');
}

// Fånga oväntade fel
main().catch(err => {
  console.error('ETL fel:', err);
  process.exit(1);
});











