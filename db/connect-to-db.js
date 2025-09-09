// Import the database driver
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import express from 'express'

// Initilize Express app with port 3000
const app = express();
const port = 3000;
// use a static html-file, set new root
app.use(express.static("presentation"));

// Reads the credentials JSON file
const jsonText = await readFile('./connection.json', 'utf-8');
const data = JSON.parse(jsonText);

// Logs the the ip and name of the connected MySQL server
console.log(`MySQL Server: ${data.host}`); // output 'testing'
console.log(`Database: ${data.database} `);

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
  const searchTerm = req.query.term //the .term part determins the url after "search?"

  if (!searchTerm) {
    return res.status(400).json({ error: 'Missing search term' });
  }

    const sql = `
    (SELECT id, firstName AS field1, lastName AS field2, email AS field3, 'test-hbg-grupp2' AS source
     FROM \`test-hbg-grupp2\`
     WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)

    UNION ALL

    (SELECT id, filename AS field1, first_part_of_text AS field2, NULL AS field3, 'pdfs' AS source
     FROM pdfs
     WHERE filename LIKE ? OR first_part_of_text LIKE ?)
  `;

  //Alows the search to be fuzzy instead of strict
  const param = `%${searchTerm}%`; 

 try {
    const [results] = await db.execute(sql, [
  param, param, param, // for test-hbg-grupp2
  param, param         // for pdfs
]);
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