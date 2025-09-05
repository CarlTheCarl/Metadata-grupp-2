// Import the database driver
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import express from 'express'

// Initilize Express app with port 3000
const app = express();
const port = 3000;

// Reads the credentials JSON file
const jsonText = await readFile('./connection.json', 'utf-8');
const data = JSON.parse(jsonText);

// Logs the the ip and name of the connected MySQL server
console.log(`MySQL Server: ${data.host}`); // output 'testing'
console.log(`Database: ${data.database} `)

// Create a connection 'db' to the database
const db = await mysql.createConnection({
    host: data.host, 
    port: data.port,
    user: data.user, 
    password: data.password,
    database: data.database
});

// Creates a listening routes for incoming searcher: /search?term=[search term]
app.get('/search', async(req, res) => {
  const searchTerm = req.query.term //the .term part determins the url after "search?", also what's being searched for in each table but i assume you already knew that
  const source = req.query.source //detirmnes which table to search on

  if (!searchTerm) {
    return res.status(400).json({ error: 'Missing search term' });
  }

  //Alows the search to be fuzzy instead of strict
  const param = `%${searchTerm}%`; 

  let sql = '';
  let searchParams = [];

  if (!source){
     sql = `
    (SELECT id, firstName AS field1, lastName AS field2, email AS field3, 'test-hbg-grupp2' AS source
     FROM \`test-hbg-grupp2\`
     WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)

    UNION ALL

    (SELECT id, filename AS field1, first_part_of_text AS field2, NULL AS field3, 'pdfs' AS source
     FROM pdfs
     WHERE filename LIKE ? OR first_part_of_text LIKE ?)
  `;
  searchParams = [param, param, param, param, param];
  } else if (source == "test") {
    sql = `
      SELECT *
      FROM \`test-hbg-grupp2\`
      WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?
    `;
    searchParams = [param, param, param];
  }
  else if (source == "pfd") {
      sql = `
      SELECT *
      FROM pdfs
      WHERE filename LIKE ? OR first_part_of_text LIKE ?
    `;
    searchParams = [param, param];
  } else {
    // Invalid source value
    return res.status(400).json({ error: 'Invalid source parameter. Use "test", "pdfs", or omit for both.' });
  }

 try {
    const [results] = await db.execute(sql, searchParams);
    res.json(results);
  } catch (err) {
    console.error('Query failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, 'localhost', () => {
  console.log(`Server is running at http://localhost:${port}`);
});