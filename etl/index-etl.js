import { extract } from './extract.js';
import { transform } from './transform.js';

// Replace with your file path
const CSV_DIRECTORY = 'csv/'; // Relative to this file location
const CSV_FILENAME = 'pdf_metadata_1756802965122.json'; // filename in directory

const filePath = CSV_DIRECTORY + CSV_FILENAME;

const first_ = CSV_FILENAME.indexOf("_")
const category = CSV_FILENAME.substring(0, first_)

// console.log(category)

async function runETL() {
    try {
        // Stage 1: Extract
        const extractedData = await extract(filePath);

        // Stage 2: Transform
        transform(extractedData);

        // Stage 3: Load
        

        console.log('ETL process completed!');
    } catch (error) {
        console.error('ETL process failed:', error);
    }
}

// runETL();