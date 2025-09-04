import { extract } from './extract.js';
import { transform } from './transform.js';
import { load  } from './load.js';

// Metadata_csv and category
const datafile_directory = 'datafiles/'; // Relative to this file location
const metadata_json_filename = 'pdf_metadata_1756802965122.json'; // filename in directory

const metadata_filePath = datafile_directory + metadata_json_filename;

const metadata_first_ = metadata_json_filename.indexOf("_")
const category = metadata_json_filename.substring(0, metadata_first_)

// url-filelist
const url_file_list = datafile_directory + "pdfs.csv"

// console.log(category)

async function runETL() {
    try {
        // Stage 1: Extract
        const extractedData = await extract(metadata_filePath);
        // console.log(extractedData);
        await load(extractedData, category, url_file_list);

        // Stage 2: Transform
        // transform(extractedData);

        // Stage 3: Load
        const loadData = await load(extractedData, category)

        console.log('ETL process completed!');
    } catch (error) {
        console.error('ETL process failed:', error);
    }
}

runETL();