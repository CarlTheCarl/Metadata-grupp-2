import dotenv from 'dotenv';
dotenv.config();

import { extract } from './mockpictures-extract.js';
import { transformAll } from './mockpictures-transform.js';
import { connect, createTableIfNotExists, insertMany } from './mockpictures-load.js';

async function main() {
  const cfg = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    csvPath: './image_metadata_100_rows_quoted.csv'
  };

  console.log('[ETL] Startar...');

  // Anslut till databasen
  const pool = await connect(cfg);

  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    console.log('[ETL] Databasen svarade:', rows[0].now);
  } catch (err) {
    console.error('[ETL] Fel vid databaskoppling:', err.message);
    process.exit(1);
  }

  // Läser in CSV-filen
  const raw = await extract(cfg.csvPath);
  console.log('[ETL] Extract klart. Antal rader:', raw.length);

  // Transformera datan
  const models = transformAll(raw);
  console.log('[ETL] Transform klart.');

  // Skapa tabell (om den inte finns)
  await createTableIfNotExists(pool);

  // Ladda in datan i databasen
  const result = await insertMany(pool, models);
  console.log(`[ETL] Load klart. Infogade rader: ${result.inserted}`);

  // Stäng anslutning
  await pool.end();
  console.log('[ETL] Färdigt.');
}

// Kör
main().catch(err => {
  console.error('ETL fel:', err);
  process.exit(1);
});
