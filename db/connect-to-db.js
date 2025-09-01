// Import the database driver
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
//import promptSync from 'prompt-sync';
import express from 'express'

const app = express();
const port = 3000;

//const prompt = promptSync();

// Read the JSON file manually
const jsonText = await readFile('../connection.json', 'utf-8');
const data = JSON.parse(jsonText);

console.log(`hostname ${data.host}`); // output 'testing'

// Create a connection 'db' to the database
const db = await mysql.createConnection({
    host: data.host, 
    port: data.port,
    user: data.user, 
    password: data.password,
    database: data.database
});

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

// // A small function for a query
// async function query(sql){
//    let result = await db.execute(sql);
//    return result[0];
// }

// //const searchTerm = prompt("enter search term: ")

// const sql = `
//   SELECT * FROM \`test-hbg-grupp2\`
//   WHERE firstName LIKE ?
//      OR lastName LIKE ?
//      OR email LIKE ?
// `;

// const param = `%${searchTerm}%`;

// const [allPersons] = await db.execute(sql, [param, param, param]);
// console.log('allPersons', allPersons);

//  db.end(err => {
//     if (err) {
//       console.error('Error closing the connection:', err);
//     } else {
//       console.log('Connection closed.');
//     }
//   });