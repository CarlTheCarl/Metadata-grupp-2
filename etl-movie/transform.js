/**
 * Normaliserar en enskild post från CSV-filen till en enhetlig datamodell.
 * @param {object} record En post från CSV-filen.
 * @returns {object} Den transformerade datamodellen.
 */
export function toMovieModel(record) {
    return {
      title: record.title || '',
      releaseYear: record.year ? parseInt(record.year, 10) : null,
      genre: record.genre || '',
      director: record.director || ''
    };
  }
  
  /**
   * Transformerar en array av råa poster från CSV-filen till en array av datamodeller.
   * @param {object[]} records En array av poster från CSV-filen.
   * @returns {object[]} En array av transformerade datamodeller.
   */
  export function transformAll(records) {
    return records.map(toMovieModel);
  }