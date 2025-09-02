import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

async function extractPdfMetadata(filePath) {
    try {
        // Read the file content
        const content = await readFile(filePath, 'utf-8');
        const jsonContent = JSON.parse(content);

        // Extract the filename and timestamp
        const filename = basename(filePath);
        const timestamp = filename.replace('pdf_metadata_', '').replace('.json', '');

        // Prepare the output object
        const output = {
            filename: filename,
            category: 'pdf',
            content: jsonContent
        };

        return output;
    } catch (error) {
        console.error('Error reading or parsing the file:', error);
        throw error;
    }
}

// Example usage:
// Replace 'path/to/your/file.pdf_metadata_[timestamp].json' with the actual file path
const filePath = 'csv/pdf_metadata_1756802965122.json';
extractPdfMetadata(filePath)
    .then(output => console.log(JSON.stringify(output, null, 2)))
    .catch(err => console.error('Failed to extract metadata:', err));
