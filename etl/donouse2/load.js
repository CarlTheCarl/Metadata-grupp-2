import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { parse } from 'csv-parse/sync'; // Install with: npm install csv-parse

// Load MySQL credentials from file
async function loadCredentials() {
    try {
        const creds = await readFile('../connection.json', 'utf-8');
        // console.log(JSON.parse(creds));
        return JSON.parse(creds);
    } catch(e) {
        console.error(`something went wrong: \n${e}`)
    }
}

// Retrieve urls matching each filename
// TODO: Move to extract.js
async function getUrlFromCsv(csvFilePath, pdfFilename) {
    try {
        const csvContent = await readFile(csvFilePath, 'utf-8');
        const records = parse(csvContent, { columns: true });
        const record = records.find(r => r.filename === pdfFilename);
        return record ? record.url : null;
    } catch (error) {
        console.error('Error reading CSV:', error);
        return null;
    }
}

// Clean and extract first 250 words or less from pdf_text
// TODO: Move to extract.js
function getFirst250Words(text) {
    const cleanedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanedText.split(' ');
    return words.slice(0, 250).join(' ');
}

// Test the MySQL connection
export async function testConnection() {
    // Load the credentials through function call
    const credentials = await loadCredentials();

    // Initialise connection variable
    let connection;
    
    // Let's try to connect!
    try {
        connection = await mysql.createConnection({
            host: credentials.host,
            user: credentials.user,
            password: credentials.password,
            database: credentials.database,
        });
        return "connection ok";
    } catch (e) {
        return `the following error occurred: ${e}`;
    } finally {
        // Connection only ends when the test is complete
        // That is, in this case, if it fails or succeeded
        if (connection) await connection.end();
    }
}

// Insert data into the appropriate table based on category
// Better description in testConnection()
export async function load(extractedData, category) {
    // Create connection
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
        
            
        // extract information
        const { filename, content } = extractedData;

        // For testing purposes
        // console.log("PDF filename: ", content[0].filename);
        // console.log("category: ", category);
        // console.log("number of pages: ", content[0].metadata.numpages);

        // Query for insert into given table
        // Adjust columns and values as needed
        const query = `
            INSERT INTO \`${tableName}\`
            (filename, url, metadata, post_created_at)
            VALUES (?, ?, ?, NOW())
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

process.on('SIGINT', async () => {
  if (connection) await connection.end();
  process.exit();
});

// const result = await testConnection();
// console.log(result);