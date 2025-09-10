import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';


// // Helper function to extract the first 250 words
// function getFirst250Words(text) {
//     const cleanedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
//     const words = cleanedText.split(' ');
//     return words.slice(0, 250).join(' ');
// }

// Helper function to get URL from CSV records
function getUrlFromRecords(records, pdfFilename) {
    const record = records.find(r => r.filename === pdfFilename);
    return record ? record.url : null;
}

// function parsePdfDate(pdfDate) {
//     // Example: D:20250414155204+08'00'
//     if (!pdfDate || !pdfDate.startsWith('D:')) {
//         return null;
//     }
//     // Extract the date part: 20250414155204
//     const datePart = pdfDate.substring(2).split('+')[0].replace(/'/g, '');
//     // Parse into YYYY-MM-DD HH:MM:SS
//     const year = datePart.substring(0, 4);
//     const month = datePart.substring(4, 6);
//     const day = datePart.substring(6, 8);
//     const hour = datePart.substring(8, 10);
//     const minute = datePart.substring(10, 12);
//     const second = datePart.substring(12, 14);
//     return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
// }

export async function transform(extractedData, csvFilePath) {
    const { content } = extractedData;

    // Read the CSV file once
    // const csvContent = await readFile(csvFilePath, 'utf-8');
    const records = parse(csvContent, { columns: true });

    // Transform each PDF metadata object
    const transformedData = content.map(pdf => {
        // Extract the first 250 words from pdf_text
        const firstPartOfText = getFirst250Words(pdf.metadata.pdf_text);

        // Find the URL for this PDF filename
        const url = getUrlFromRecords(records, pdf.filename);

        // Extract creation date
        const pdfCreated = parsePdfDate(pdf.metadata.pdf_info.CreationDate);

        // Extract authors
        const authors = pdf.metadata.pdf_info.Author;

        // Extract number of pages
        const numpages = pdf.metadata.pdf_info.numpages;

        // Prepare rest_of_metadata (exclude extracted fields)
        const { pdf_info, pdf_text, ...restOfMetadata } = pdf.metadata;

        return {
            filename: pdf.filename,
            url: url,
            filesize: pdf.size,
            num_pages: numpages,
            first_part_of_text: firstPartOfText,
            pdf_created: pdfCreated,
            authors: authors,
            rest_of_metadata: restOfMetadata,
        };
    });

    return {
        filename: extractedData.filename,
        content: transformedData,
    };
}
