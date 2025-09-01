// Import the database driver
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import express from 'express'

// Initilize Express app with port 3000
const app = express();
const port = 3000;

// Reads the credentials JSON file
const jsonText = await readFile('../connection.json', 'utf-8');
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
  const searchTerm = req.query.term

  if (!searchTerm) {
    return res.status(400).json({ error: 'Missing search term' });
  }

  const sql = `
  SELECT * FROM \`test-hbg-grupp2\`
  WHERE firstName LIKE ?
  OR lastName LIKE ?
  OR email LIKE ?
  `;

  //Alows the search to be fuzzy instead of strict
  const param = `%${searchTerm}%`; 

 try {
    const [results] = await db.execute(sql, [param, param, param]);
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