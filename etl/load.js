import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

// Load MySQL credentials from file
async function loadCredentials() {
    const creds = await readFile('../connection.json', 'utf-8');
    return Object.fromEntries(
        creds.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => line.split('='))
    );
}

// Insert data into the appropriate table based on category
export async function load(extractedData) {
    const { filename, category, content } = extractedData;
    const credentials = await loadCredentials();

    let connection;
    try {
        connection = await mysql.createConnection({
            host: credentials.host,
            user: credentials.user,
            password: credentials.password,
            database: credentials.database,
        });

        // Use the category to decide the table
        const tableName = `${category}s`; // e.g., 'pdfs', 'images', etc.

        // Example: Insert into the pdfs table
        // Adjust columns and values as needed
        const query = `
            INSERT INTO \`${tableName}\`
            (filename, metadata, created_at)
            VALUES (?, ?, NOW())
        `;
        const values = [filename, JSON.stringify(content)];

        await connection.execute(query, values);
        console.log(`Data inserted into ${tableName} table.`);
    } catch (error) {
        console.error('Error in load:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}
