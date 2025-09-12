import mysql from 'mysql2/promise';

// Skapar anslutning till MySQL
export async function connect(cfg) {
  const pool = mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  return pool;
}

// Skapa tabellen (om den inte finns)
export async function createTableIfNotExists(pool) {
  const sql = `
    CREATE TABLE IF NOT EXISTS pictures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255),
      url TEXT,
      filesize INT,
      picture_width INT,
      picture_height INT,
      creation_date DATE,
      modified_date DATE,
      gps_latitude DOUBLE,
      gps_longitude DOUBLE,
      camera_source VARCHAR(255)
    );
  `;
  await pool.execute(sql);
}

// Insert-funktion
export async function insertMany(pool, pictures) {
  if (pictures.length === 0) return { inserted: 0 };

  const sql = `
    INSERT INTO pictures
    (filename, url, filesize, picture_width, picture_height, creation_date, modified_date, gps_latitude, gps_longitude, camera_source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let inserted = 0;

  for (const pic of pictures) {
    try {
      await pool.execute(sql, [
        pic.filename,
        pic.url,
        pic.filesize,
        pic.picture_width,
        pic.picture_height,
        pic.creation_date,
        pic.modified_date,
        pic.gps_latitude,
        pic.gps_longitude,
        pic.camera_source
      ]);
      inserted++;
    } catch (e) {
      console.error('Insert error:', e.message);
    }
  }

  return { inserted };
}
