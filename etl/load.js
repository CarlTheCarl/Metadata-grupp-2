import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

async function loadCredentials() {
    try {
        // for local development:
        const creds = await readFile('./local_credentials.json', 'utf-8');


        // const creds = await readFile('../connection.json', 'utf-8');
        return JSON.parse(creds);
    } catch (e) {
        console.error(`Something went wrong: \n${e}`);
        throw e;
    }
}

export async function testConnection() {
    const credentials = await loadCredentials();
    console.log(credentials.host, credentials.user, credentials.password, credentials.database)
    let connection;
    try {
        console.log("Attempting connect to MySQL...")
        connection = await mysql.createConnection({
            host: credentials.host,
            user: credentials.user,
            password: credentials.password,
            database: credentials.database,
        });



        return "connection ok";
    } catch (e) {
        return `The following error occurred: ${e}`;
    } finally {
        if (connection) await connection.end();
    }
}

export async function load(transformedData, category) {
    const { content } = transformedData;
    const credentials = await loadCredentials();
    let connection;

    try {
        connection = await mysql.createConnection({
            host: credentials.host,
            port: credentials.port,
            user: credentials.user,
            password: credentials.password,
            database: credentials.database,
        });

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
        if (connection) await connection.end();
    }
}

// testConnection();
