import 'dotenv/config';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { connect, insertMany } from './load.js';

const csvPath = process.argv[2] || './MOCK_DATA.csv';

function mapRow(r) {
  // Anpassa fältnamn efter er CSV-struktur
  return {
    filename: r.filename || r.name || 'unknown',
    path: r.path || r.filepath || r.url || '/csv',
    mimeType: r.mimeType || null,
    size_bytes: r.size_bytes ? Number(r.size_bytes) : null,
    createdAt: r.createdAt || null,
    modifiedAt: r.modifiedAt || null,
    latitude: r.latitude ? Number(r.latitude) : null,
    longitude: r.longitude ? Number(r.longitude) : null,
    meta: r // spara hela raden i JSON för spårbarhet
  };
}

async function main() {
  const text = await fs.readFile(csvPath, 'utf8');
  const rows = parse(text, { columns: true, skip_empty_lines: true });
  const models = rows.map(mapRow);

  const pool = await connect({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  const res = await insertMany(pool, models);
  await pool.end();
  console.log('CSV import klar, antal rader:', res.inserted);
}

main().catch(console.error);

