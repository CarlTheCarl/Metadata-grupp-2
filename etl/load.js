import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

// Load MySQL credentials from file
async function loadCredentials() {
    try {
        // for local development:
        const creds = await readFile('./local_credentials.json', 'utf-8');
        // // for production
        // const creds = await readFile('../connection.json', 'utf-8');
        return JSON.parse(creds);
    } catch (e) {
        console.error(`Something went wrong: \n${e}`);
        throw e;
    }
}

// Create a connection pool (reused for all queries)
const pool = mysql.createPool(await loadCredentials());

// Test the MySQL connection using the pool
export async function testConnection() {
    let connection;
    try {
        console.log("Attempting to connect to MySQL...");
        connection = await pool.getConnection();
        return "connection ok";
    } catch (e) {
        return `The following error occurred: ${e}`;
    } finally {
        if (connection) connection.release(); // Release back to pool
    }
}

// Test-select: Query and output results from `test-names`
export async function testSelect() {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = "SELECT * FROM `test-names`";
        const [rows] = await connection.query(query);
        console.log("Query results from `test-names`:");
        console.table(rows); // Pretty-print the results
    } catch (error) {
        console.error('Error in testSelect:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // Release back to pool
    }
}

// Insert data into the appropriate table based on category
export async function load(transformedData, category) {
    const { content } = transformedData;
    let connection;
    try {
        connection = await pool.getConnection();
        const tableName = `${category}s`;
        // Create table if not exists
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
        if (connection) connection.release(); // Release back to pool
    }
}

// Graceful shutdown on SIGINT (CTRL+C)
process.on('SIGINT', async () => {
    await pool.end();
    console.log('\nPool closed. Exiting.');
    process.exit();
});

// // Uncomment to include testing
// (async () => {
//     const result = await testConnection();
//     console.log(result);
//     await testSelect();
// })();