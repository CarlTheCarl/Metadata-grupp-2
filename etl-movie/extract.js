import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';

/**
 * Läser och parsar en CSV-fil.
 * @param {string} filePath Sökvägen till CSV-filen.
 * @returns {Promise<object[]>} En Promise som löses med en array av objekt.
 */
export async function extractMovies(filePath) {
  const records = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => records.push(data))
      .on('end', () => {
        console.log(`[Extract] Har läst in ${records.length} rader från ${path.basename(filePath)}.`);
        resolve(records);
      })
      .on('error', (err) => reject(err));
  });
}