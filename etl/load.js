import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

// Load MySQL credentials from file
async function loadCredentials() {
    try {
        const creds = await readFile('./local_credentials.json', 'utf-8');
        return JSON.parse(creds);
    } catch (e) {
        console.error(`Something went wrong: \n${e}`);
        throw e;
    }
}

// Main function to run all operations and close the pool
async function main() {
    const pool = mysql.createPool(await loadCredentials());
    try {
        const result = await testConnection(pool);
        console.log(result);
        // Uncomment to test the select query
        // await testSelect(pool);
        // Example: await load(transformedData, 'pdf', pool);
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await pool.end();
        console.log('Pool closed.');
    }
}

// Test the MySQL connection using the pool
async function testConnection(pool) {
    let connection;
    try {
        console.log("Attempting to connect to MySQL...");
        connection = await pool.getConnection();
        return "connection ok";
    } catch (e) {
        return `The following error occurred: ${e}`;
    } finally {
        if (connection) connection.release();
    }
}

// Test-select: Query and output results from `test-names`
async function testSelect(pool) {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = "SELECT * FROM `test-names`";
        const [rows] = await connection.query(query);
        console.log("Query results from `test-names`:");
        console.table(rows);
    } catch (error) {
        console.error('Error in testSelect:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

// Insert data into the appropriate table based on category
export async function load(transformedData, category, pool) {
    const { content } = transformedData;
    let connection;
    try {
        connection = await pool.getConnection();
        const tableName = `${category}s`;
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
        for (const pdf of content) {
            const query = `
                INSERT INTO \`${tableName}\`
                (filename, url, filesize, num_pages, first_part_of_text, pdf_created, authors, rest_of_metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                pdf.filename,
                pdf.url,
                pdf.filesize,
                pdf.num_pages,
                pdf.first_part_of_text,
                pdf.pdf_created,
                pdf.authors,
                JSON.stringify(pdf.rest_of_metadata)
            ];
            await connection.execute(query, values);
            console.log(`Inserted ${pdf.filename} into ${tableName} table.`);
        }
    } catch (error) {
        console.error('Error in load:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

// Run the main function
main().catch(console.error);
