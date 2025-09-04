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
        console.table(rows); // Pretty-print results
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
    const { content } = transformedData;
    let connection;
    try {
        connection = await pool.getConnection();
        const tableName = `${category}s`;

        // Create table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                url VARCHAR(255),
                filesize INT,
                num_pages INT,
                first_part_of_text TEXT,
                pdf_created DATETIME,
                authors VARCHAR(255),
                rest_of_metadata JSON,
                post_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert each PDF's data
        for (const pdf of content) {
            const query = `
                INSERT INTO \`${tableName}\`
                (filename, url, filesize, num_pages, first_part_of_text, pdf_created, authors, rest_of_metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                pdf.filename || null,
                pdf.url || null,
                pdf.filesize || null,
                pdf.num_pages || null,
                pdf.first_part_of_text || null,
                pdf.pdf_created || null,
                pdf.authors || null,
                JSON.stringify(pdf.rest_of_metadata) || null
            ];
            await connection.execute(query, values);
            console.log(`Inserted ${pdf.filename} into ${tableName} table.`);
        }
    } catch (error) {
        console.error('Error in load:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // Release connection back to the pool
    }
}
