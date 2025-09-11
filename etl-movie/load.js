import mysql from 'mysql2/promise';

/**
 * Upprättar en pool av databasanslutningar.
 * @param {object} cfg Databasens konfigurationsinställningar.
 * @returns {Promise<mysql.Pool>} En Promise som löses med anslutningspoolen.
 */
export async function connect(cfg) {
  const pool = await mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: 10
  });
  return pool;
}

/**
 * Infogar en array av filmer i databasen.
 * @param {mysql.Pool} pool Databasanslutningspoolen.
 * @param {object[]} models En array av filmer som ska infogas.
 * @returns {Promise<object>} Ett objekt som innehåller antalet infogade rader.
 */
export async function insertMovies(pool, models) {
  if (!models.length) return { inserted: 0 };

  const sql = `
    INSERT INTO movies
    (title, release_year, genre, director)
    VALUES (?, ?, ?, ?)
  `;
  let count = 0;
  for (const m of models) {
    try {
      await pool.execute(sql, [
        m.title,
        m.releaseYear,
        m.genre,
        m.director
      ]);
      count++;
    } catch (e) {
      console.error(`Kunde inte infoga rad: ${m.title} - ${e.message}`);
    }
  }
  return { inserted: count };
}