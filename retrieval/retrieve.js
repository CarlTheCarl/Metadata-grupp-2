import { search } from 'duck-duck-scrape';
import { createObjectCsvWriter } from 'csv-writer';
import { readFileSync, existsSync } from 'fs';

// Function to read existing URLs from CSV
function readExistingUrls(filename) {
    try {
        if (!existsSync(filename)) return new Set();
        const data = readFileSync(filename, 'utf8');
        const lines = data.split('\n');
        const existingUrls = new Set();
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                existingUrls.add(lines[i].trim());
            }
        }
        return existingUrls;
    } catch (err) {
        console.error('Error reading existing URLs:', err);
        return new Set();
    }
}

// Function to save new unique URLs to CSV
async function saveToCsv(newUrls, filename) {
    const csvWriter = createObjectCsvWriter({
        path: filename,
        header: [{ id: 'url', title: 'pdf URL' }],
        append: true,
    });

    const existingUrls = readExistingUrls(filename);
    const uniqueUrls = [...new Set(newUrls)].filter(url => !existingUrls.has(url));

    if (uniqueUrls.length > 0) {
        const records = uniqueUrls.map(url => ({ url }));
        await csvWriter.writeRecords(records);
        console.log(`Added ${uniqueUrls.length} new unique URLs to ${filename}.`);
    } else {
        console.log('No new unique URLs to add.');
    }
}

// Function to search for PDFs using duck-duck-scrape
async function findPdfs(query, maxResults = 20) {
    try {
        const results = await search(`${query} filetype:pdf`, {
            safeSearch: 1,
            time: 'y', // last year
            region: 'wt-wt', // worldwide
            maxResults,
        });

        return results
            .map(result => result.link)
            .filter(link => link && link.toLowerCase().endsWith('.pdf'));
    } catch (err) {
        console.error('Error searching DuckDuckGo:', err);
        return [];
    }
}

// Main function
async function main() {
    const keywords = ['example keyword 1', 'example keyword 2']; // Replace with your keywords
    const filename = 'pdfs.csv';

    for (const kw of keywords) {
        console.log(`\n🔍 Searching for: ${kw}`);
        const pdfs = await findPdfs(kw, 50);
        console.log(`Found ${pdfs.length} PDF links for '${kw}'`);
        await saveToCsv(pdfs, filename);
    }
}

main().catch(console.error);
