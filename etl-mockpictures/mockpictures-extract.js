import fs from 'fs';
import csv from 'csv-parser';

// Läser in CSV och returnerar en array med objekt
export function extract(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ skipLines: 0, trim: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}
