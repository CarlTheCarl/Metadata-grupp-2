import fs from 'fs';
import csv from 'csv-parser';

// Funktion som läser CSV-filen och returnerar en Promise med data som array av objekt
export function extract(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath) // öppnar filen för läsning
      .pipe(csv()) // läser varje rad som objekt
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}
