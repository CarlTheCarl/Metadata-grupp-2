import mysql from 'mysql2/promise';

// Skapar en koppling till databasen
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

// Skapar tabellen books
export async function createTableIfNotExists(pool) {
  const sql = `
    CREATE TABLE IF NOT EXISTS books (
      id INT PRIMARY KEY AUTO_INCREMENT,
      book_title VARCHAR(255),
      author_first_name VARCHAR(100),
      author_last_name VARCHAR(100),
      isbn VARCHAR(20),
      type VARCHAR(50),
      number_of_pages INT,
      revision_number INT,
      number_of_lends INT,
      release_date DATE,
      genre VARCHAR(50)
    );
  `;
  await pool.execute(sql);
}

// Stoppar in datan i databasen
export async function insertMany(pool, books) {
  if (books.length === 0) return { inserted: 0 };

  const sql = `
    INSERT INTO books
    (book_title, author_first_name, author_last_name, isbn, type, number_of_pages, revision_number, number_of_lends, release_date, genre)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let inserted = 0;

  // Loopar igenom alla böcker och lägger till de i databasen
  for (const book of books) {
    try {
      await pool.execute(sql, [
        book.book_title,
        book.author_first_name,
        book.author_last_name,
        book.isbn,
        book.type,
        book.number_of_pages,
        book.revision_number,
        book.number_of_lends,
        book.release_date,
        book.genre
      ]);
      inserted++;
    } catch (e) {
      console.error('Insert error:', e);
    }
  }
  return { inserted };
}
