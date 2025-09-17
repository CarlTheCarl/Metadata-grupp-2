import { extractMetadata } from './extract.js';
// import { transform } from './transform.js';
import { load, testConnection, testSelect } from './load.js';
import mysql from 'mysql2/promise';
import { readFile, readdir } from 'node:fs/promises';
// import { join } from 'path';
// import csv from 'csv-parser';
// import fs from 'fs';
// import { connect } from 'node:http2';

// // File paths and metadata
// const datafile_directory = '../../retrieval/practice_code/mockups/combined_sources/fake_media_scraping_1/';
// const _links = "media_links_anonymous-users.csv";
// const path_links = join(datafile_directory, _links);
// const _objects = "object_bounding_table_anonymous_users.csv";
// const path_objects = join(datafile_directory, _objects);
// // console.log(path_detect_object);
// // console.log(path_links);

// // Retrieve category/table name
// const first_ = _links.indexOf("_");
// const category = _links.substring(0, first_);
// // console.log(category);

// // Retrieve file-type (ugly version)
// const lastDot_links = _links.indexOf(".");
// const filetype_links = _links.substring(lastDot_links + 1, _links.length);
// const lastDot_objects = _objects.indexOf(".");
// const filetype_objects = _objects.substring(lastDot_objects + 1, _objects.length);
// // console.log(filetype_links, " ", filetype_objects);

// GLOBAL VARS
let pool;

/**
 * Loads MySQL credentials from a JSON file.
 * @returns {Promise<Object>} Credentials object.
 */
async function loadCredentials() {
    try {
        // // Load credentials from local file
        // const creds = await readFile('etl/etl-pictures/local_credentials.json', 'utf-8');

        // Load credentials from remote server file
        const creds = await readFile('connection.json', 'utf-8');

        return JSON.parse(creds);
    } catch (e) {
        console.error(`Failed to load credentials: \n${e}`);
        throw e;
    }
}

async function runEtl(){
  try {
    // extract metadata
    const extractedMetadata = await extractMetadata();
    // console.log(metadata_json);

    //--- INSERT METADATA into mySQL server ---
    // Create a connection pool
    // const credentials = await loadCredentials()
    pool = await mysql.createPool(credentials);
    
    // test MySQL connection
    const connectionResult = await testConnection(pool);
    console.log(connectionResult);

    const testReadResults = await testSelect(pool);
    console.table(testReadResults);

    // Load data into mySQL
    await load(extractedMetadata, "pictures", pool);

  } catch(etlRunningErr) {
    console.log("ETL process failed: ", etlRunningErr);
  } finally { 
    // --- Finally close pool ---
    try {
      if (pool) {
        await pool.end();
        console.log("From runETL: Pool closed successfully!");
      }
    } catch(poolClosingErr) {
      console.err("ETL process error closing pool: ", poolClosingErr);
    }
  }
}

// Handle SIGINT (CTRL+C)
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, Closing pool gracefully...');
  try {
    if (pool) {
      await pool.end();
      console.log('Pool closed. Exiting');
    }
  } catch(err) {
    console.error('Error closing pool: ', err);
  } finally {
    process.exit = 0;
  }
});

runEtl();
// console.log(await runEtl());

// async function importCsvToMySql() {
//   let connection;
//   try {
//     // Connect to MySQL
//     console.log(await loadCredentials())
//     connection = await mysql.createConnection(await loadCredentials());
    
//     // Read and parse CSV file
//     const results = [];
//     fs.createReadStream(path_links)
//       .pipe(csv())
//       .on('data', (data) => results.push(data))
//       .on('end', async () => {
//         try {
//           // Insert each row into MySQL
//             const headlines = fs.readFileSync(path_links, 'utf8').split('\n')[0];
//             console.log(headlines.slice(3));

//           for (const row of results) {
//             const query_create_table = `CREATE TABLE IF NOT EXISTS ${category}
//                 (${headlines});
//             `;
//             await connection.query(query_create_table);

//             const query = `INSERT INTO ${category} SET ?;`;
//             await connection.query(query, row);
//           }
//           console.log('CSV data imported to MySQL successfully!');
//         } catch (error) {
//           console.error('Error inserting data:', error);
//         } finally {
//           // Close the connection
//           if (connection) await connection.end();
//         }
//       });
//   } catch (error) {
//     console.error('Error connecting to MySQL:', error);
//   }
// }

// Run the import
// importCsvToMySql();

// /**
//  * Main ETL (Extract, Transform, Load) function.
//  * Creates a connection pool, runs ETL, and closes the pool.
//  */
// async function runETL() {
//     // Load credentials and create a connection pool
//     const creds = JSON.parse(await readFile('./local_credentials.json', 'utf-8'));
//     const pool = mysql.createPool(creds);

//     try {
//         // Test the MySQL connection
//         const result = await testConnection(pool);
//         console.log(result);

//         // Optional: Test a SELECT query
//         await testSelect(pool);

//         // // Stage 1: Extract metadata from JSON file
//         // // const extractedData = await extract(metadata_filePath);
//         // const extract_links = await extract(path_links, filetype_links);
//         // const extract_objects = await extract(path_objects, filetype_objects);

//         // // // Stage 2: Transform extracted data
//         // // const transformedData = await transform(extractedData, url_file_list);
//         // const transform_links = await transform(extract_links)

//         // Stage 3: Load transformed data into MySQL
//         // await load(transformedData, category, pool);


//         console.log('ETL process completed!');
//     } catch (error) {
//         console.error('ETL process failed:', error);
//     } finally {
//         // Always close the pool when done
//         await pool.end();
//         console.log('Pool closed.');
//     }
// }

// // Run the ETL process
// runETL().catch(console.error);
