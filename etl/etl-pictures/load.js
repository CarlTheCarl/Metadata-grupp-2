import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

/**
 * Loads MySQL credentials from a JSON file.
 * @returns {Promise<Object>} Credentials object.
 */
async function loadCredentials() {
    try {
        // Load credentials from local file
        const creds = await readFile('./local_credentials.json', 'utf-8');
        return JSON.parse(creds);
    } catch (e) {
        console.error(`Failed to load credentials: \n${e}`);
        throw e;
    }
}

/**
 * Tests the MySQL connection using a connection pool.
 * @param {Object} pool - MySQL connection pool.
 * @returns {Promise<string>} "connection ok" or error message.
 */
export async function testConnection(pool) {
    let connection;
    try {
        console.log("Attempting to connect to MySQL...");
        connection = await pool.getConnection(); // Get a connection from the pool
        return "connection ok";
    } catch (e) {
        return `The following error occurred: ${e}`;
    } finally {
        if (connection) connection.release(); // Release connection back to the pool
    }
}

/**
 * Queries the `test-names` table and outputs results to the terminal.
 * @param {Object} pool - MySQL connection pool.
 */
export async function testSelect(pool) {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = "SELECT * FROM `test-names`";
        const [rows] = await connection.query(query);
        console.log("Query results from `test-names`:");
        // console.table(rows); // Pretty-print results
        return rows;
    } catch (error) {
        console.error('Error in testSelect:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // Release connection back to the pool
    }
}

/**
 * Loads transformed data into the appropriate MySQL table.
 * @param {Object} transformedData - Data to insert.
 * @param {string} category - Table category (e.g., 'pdf').
 * @param {Object} pool - MySQL connection pool.
 */
export async function load(transformedData, category, pool) {
    // const { content } = transformedData;
    // console.log(transformedData);
    let connection;
    try {
        connection = await pool.getConnection();
        const tableName = category;

        // Create table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                url VARCHAR(255),
                filesize INT,
                picture_height INT,
                picture_width INT,
                created_locally DATETIME,
                modified_locally DATETIME,
                gps_latitude FLOAT,
                gps_longitude FLOAT,
                all_metadata JSON,
                post_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX gps_data_index (gps_latitude, gps_longitude)
            )
        `);


    //     // Insert each PDF's data
        for (let file of transformedData) {
            const query = `
                INSERT INTO ${tableName}
                (filename, url, filesize, picture_height, picture_width, created_locally,
                modified_locally, gps_latitude, gps_longitude, all_metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                file.filename || null,
                file.url || null,
                file.filesize || null,
                file.picture_height || null,
                file.picture_width || null,
                file.created_locally || null,
                file.modified_locally || null,
                file.gps_latitude || null,
                file.gps_longitude || null,
                JSON.stringify(file.metadata) || null
            ];
            await connection.execute(query, values);

            console.log(`Inserted ${file.filename} into ${tableName} table.`);
        }
    } catch (error) {
        console.error('Error in load:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // Release connection back to the pool
    }
}
