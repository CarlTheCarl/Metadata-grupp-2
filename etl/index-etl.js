import { extract } from './extract.js';
import { transform } from './transform.js';
import { load, testConnection, testSelect } from './load.js';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

// File paths and metadata
const datafile_directory = 'datafiles/';
const metadata_json_filename = 'pdf_metadata_1756802965122.json';
const metadata_filePath = datafile_directory + metadata_json_filename;
const metadata_first_ = metadata_json_filename.indexOf("_");
const category = metadata_json_filename.substring(0, metadata_first_);
const url_file_list = datafile_directory + "pdfs.csv";

/**
 * Main ETL (Extract, Transform, Load) function.
 * Creates a connection pool, runs ETL, and closes the pool.
 */
async function runETL() {
    // Load credentials and create a connection pool
    const creds = JSON.parse(await readFile('./local_credentials.json', 'utf-8'));
    const pool = mysql.createPool(creds);

    try {
        // Test the MySQL connection
        const result = await testConnection(pool);
        console.log(result);

        // Optional: Test a SELECT query
        await testSelect(pool);

        // Stage 1: Extract metadata from JSON file
        const extractedData = await extract(metadata_filePath);

        // Stage 2: Transform extracted data
        const transformedData = await transform(extractedData, url_file_list);

        // Stage 3: Load transformed data into MySQL
        await load(transformedData, category, pool);

        console.log('ETL process completed!');
    } catch (error) {
        console.error('ETL process failed:', error);
    } finally {
        // Always close the pool when done
        await pool.end();
        console.log('Pool closed.');
    }
}

// Run the ETL process
runETL().catch(console.error);
