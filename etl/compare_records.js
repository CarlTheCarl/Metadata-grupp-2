import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';

// File paths
const datafile_directory = 'datafiles/';
const metadata_json_filename = 'pdf_metadata_1757011672019.json';
const metadata_filePath = datafile_directory + metadata_json_filename;
const url_file_list = datafile_directory + "pdfs.csv";

async function debugUrlMatching() {
    try {
        // 1.1 Read the CSV file
        const csvContent = await readFile(url_file_list, 'utf-8');
        const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);

        // 1.2 Extract the header (first line)
        const header = lines[0];
        console.log('CSV Header: ', header);

        // 1.3 Extract the URLs (assuming the second column is the URL)
        const urls = lines.slice(1).map(line => {
            const fields = line.split(',').map(field => field.trim().replace(/^"|"$/g, ''));
            return fields[0]; // Assuming the URL is the first (and only) field
        });

        console.log('Extracted URLs:');
        console.table(urls);

        // 2.1 Read the JSON metadata file
        const metadataContent = await readFile(metadata_filePath, 'utf-8');
        const metadata = JSON.parse(metadataContent);

        // 3. Match URLs to filenames
        console.log('\nURL Matching Results:');
        for (const pdf of metadata) {
            const url = urls.find(u => u.includes(pdf.filename));
            console.log(`- ${pdf.filename}: ${url || 'NO MATCH'}`);
        }

        // // 4. List any PDFs without a URL match
        // const unmatched = metadata.filter(pdf => {
        //     return !records.some(r => r.filename.trim().toLowerCase() === pdf.filename.trim().toLowerCase());
        // });
        // if (unmatched.length > 0) {
        //     console.log('\nPDFs without a URL match:');
        //     console.table(unmatched.map(m => ({ filename: m.filename })));
        // } else {
        //     console.log('\nAll PDFs have a URL match!');
        // }
    } catch (error) {
        console.error('Error in debugUrlMatching:', error);
    }
}

// Run the debug function
debugUrlMatching().catch(console.error);
