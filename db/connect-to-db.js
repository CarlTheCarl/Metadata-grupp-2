// Import the database driver
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';

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

// A small function for a query
async function query(sql){
   let result = await db.execute(sql);
   return result[0];
}

let allPersons = await query('SELECT * FROM`test-hbg-grupp2`');

// Show the result
 console.log('allPersons',allPersons);

 let personsWithLongerNames = await query("SELECT * FROM `test-hbg-grupp2` WHERE LENGTH(firstName) %2 = 0 ");

console.log('personsWithLongerNames', personsWithLongerNames);

 db.end(err => {
    if (err) {
      console.error('Error closing the connection:', err);
    } else {
      console.log('Connection closed.');
    }
  });
// let allPersons = await query('SELECT * FROM persons');

// // Show the result
// console.log('allPersons',allPersons);

// let personsWithLongerNames = await query(`
//     SELECT * 
//     FROM persons 
//     WHERE LENGTH(name) >= 10
// `);

// console.log('personsWithLongerNames', personsWithLongerNames);