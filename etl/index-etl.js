import { extract } from './extract.js';
import { transform } from './transform.js';
import { load } from './load.js';

const datafile_directory = 'datafiles/';
const metadata_json_filename = 'pdf_metadata_1756802965122.json';
const metadata_filePath = datafile_directory + metadata_json_filename;
const metadata_first_ = metadata_json_filename.indexOf("_");
const category = metadata_json_filename.substring(0, metadata_first_);

const url_file_list = datafile_directory + "pdfs.csv";

async function runETL() {
    try {
        // Stage 1: Extract
        const extractedData = await extract(metadata_filePath);

        // Stage 2: Transform
        const transformedData = await transform(extractedData, url_file_list);

        // Stage 3: Load
        await load(transformedData, category);

        console.log('ETL process completed!');
    } catch (error) {
        console.error('ETL process failed:', error);
    }
}

runETL();
