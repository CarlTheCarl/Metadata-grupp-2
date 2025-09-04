import mysql from 'mysql2/promise';

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

export async function insertMany(pool, models) {
  if (!models.length) return { inserted: 0 };

  const sql = `
    INSERT INTO files_metadata
    (filename, path, mimeType, size_bytes, createdAt, modifiedAt, latitude, longitude, meta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON))
  `;
  let count = 0;
  for (const m of models) {
    try {
      const metaJson = JSON.stringify(m.meta || {});
      await pool.execute(sql, [
        m.filename, m.path, m.mimeType, m.size_bytes, m.createdAt, m.modifiedAt,
        m.latitude, m.longitude, metaJson
      ]);
      count++;
    } catch (e) {
      // hoppa över felaktiga rader men fortsätt
    }
  }
  return { inserted: count };
}
