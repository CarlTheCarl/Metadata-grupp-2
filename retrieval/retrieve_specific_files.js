import { search } from 'duckduckgo-search';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- For output text file ---
async function saveResults(url, outputFile = "audio_search_output.txt") {
    await fs.appendFile(outputFile, `${url}\n`);
    console.log(`Saved: ${url}`);
}

// --- Load search keywords ---
async function loadKeywords(filename = "search_words.txt") {
    try {
        const data = await fs.readFile(filename, 'utf8');
        return data.split('\n').filter(line => line.trim() !== '');
    } catch (err) {
        console.error(`Error reading keywords: ${err}`);
        return [];
    }
}

// --- Get filename from URL ---
function getFilenameFromUrl(url, fallbackName) {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const basename = path.basename(pathname);
    return basename || fallbackName;
}

// --- Audio file finder ---
async function findAudioFiles(query, maxResults = 20, download = true, downloadDir = "audio_files") {
    let audioLinks = [];
    try {
        await fs.mkdir(downloadDir, { recursive: true });
    } catch (err) {
        console.error(`Error creating directory: ${err}`);
    }

    const results = await search(query, { safeSearch: 'off', time: 'y', maxResults });
    for (const r of results) {
        const url = r.link;
        if (!url) continue;

        const isAudio = url.toLowerCase().endsWith('.mp3') ||
                        url.toLowerCase().endsWith('.wav') ||
                        url.toLowerCase().endsWith('.ogg') ||
                        url.toLowerCase().endsWith('.flac');

        if (!isAudio) {
            try {
                const response = await axios.head(url, { timeout: 5000, maxRedirects: 5 });
                const contentType = response.headers['content-type'] || '';
                if (contentType.startsWith('audio/')) {
                    audioLinks.push(url);
                }
            } catch (err) {
                continue;
            }
        } else {
            audioLinks.push(url);
        }
    }

    // Download files
    if (download) {
        for (let i = 0; i < audioLinks.length; i++) {
            const url = audioLinks[i];
            try {
                console.log(`Downloading: ${url}`);
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

                const localName = getFilenameFromUrl(url, `${query}_${i + 1}.mp3`);
                const filePath = path.join(downloadDir, localName);

                if (!fs.existsSync(filePath)) {
                    await fs.writeFile(filePath, response.data);
                    await saveResults(url);
                } else {
                    console.log(`File ${localName} already exists!`);
                }
            } catch (err) {
                console.error(`Failed to download ${url}: ${err}`);
            }
        }
    }

    return audioLinks;
}

// --- Main ---
async function main() {
    const keywords = await loadKeywords();
    for (const kw of keywords) {
        console.log(`\n🔍 Searching for: ${kw}`);
        const audioFiles = await findAudioFiles(kw, 50, true, "audio_files");
        console.log(`Found ${audioFiles.length} audio links for '${kw}'`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Polite delay
    }
}

main().catch(console.error);
