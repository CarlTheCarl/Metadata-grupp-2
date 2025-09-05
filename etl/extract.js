import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

// This file a submodule for index-etl.js
// Purpose is to extract and later retrieve metadata from a given set of files

export async function extract(filePath) {
    try {
        // for now we have a ready .json-file
        // 
        const content = await readFile(filePath, 'utf-8');
        const jsonContent = JSON.parse(content);
        const csv_filename = basename(filePath);

        return {
            csv_filename: csv_filename,
            // category: 'pdf',
            content: jsonContent
        };
    } catch (error) {
        console.error('Error in extract:', error);
        throw error;
    }
}
