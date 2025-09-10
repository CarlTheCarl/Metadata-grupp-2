import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

// This file a submodule for index-etl.js
// Purpose is to extract and later retrieve metadata from a given set of files

let content = "";

export async function extract(filePath, datatype) {
    try {
        if (datatype == "JSON") {
            jsonRead = await readFile(filePath, 'utf-8');
            content = JSON.parse(jsonRead);
        } else if (datatype == "csv"){
            content = await readFile(filePath, 'utf-8');
        }

        const filename = basename(filePath);

        console.log(filename, content)

        return {
            filename,
            content: content
        };
    } catch (error) {
        console.error('Error in extract:', error);
        throw error;
    }
}