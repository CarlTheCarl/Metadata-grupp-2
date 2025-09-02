import { extract } from './extract.js';
import { transform } from './transform.js';

const filePath = 'csv/pdf_metadata_1756802965122.json'; // Replace with your file path

async function runETL() {
    try {
        // Stage 1: Extract
        const extractedData = await extract(filePath);

        // Stage 2: Transform
        transform(extractedData);

        console.log('ETL process completed!');
    } catch (error) {
        console.error('ETL process failed:', error);
    }
}

runETL();
