import fs from 'fs/promises';
import path from 'path';
import { createInterface } from 'readline';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import sizeOf from 'image-size';
import pkg from 'exifr';

const { ExifReader } = pkg;

// --- Logging Setup ---
const LOG_DIR = 'logs';
const LOG_PREFIX = 'extraction_';
const LOG_LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

// Ensure logs directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR);
}

function getLogFilePath() {
  const now = new Date();
//   const dateStr = now.toISOString().split('T')[0];
  return path.join(LOG_DIR, `${LOG_PREFIX}main.log`);
//   return path.join(LOG_DIR, `${LOG_PREFIX}${dateStr}.log`);
}

// Write to log file
function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] image_metadata ${message}\n`;
  const logFilePath = getLogFilePath();
  fs.appendFile(logFilePath, logMessage).catch(() => {});
  if (level === LOG_LEVELS.ERROR) {
    console.error(logMessage.trim());
  } else {
    console.log(logMessage.trim());
  }
}

// --- Metadata Extraction ---
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff']);

async function getImageFiles(dir, fileList = []) {
  try {
    const files = await fs.readdir(dir);
    for (let file of files) {
      const filePath = path.join(dir, file);
      const fileStat = await fs.stat(filePath);
      if (fileStat.isDirectory()) {
        fileList = await getImageFiles(filePath, fileList);
      } else if (IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())) {
        fileList.push(filePath);
      }
    }
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Error reading directory ${dir}. ${err}`);
    // log(LOG_LEVELS.ERROR, `Error reading directory ${dir}: ${err.message}`);
  }
  log(LOG_LEVELS.INFO, `getImageFiles. Successfully retrieving ${dir}`);
  return fileList;
}

async function getImageMetadata(filePath) {
  try {
    // file size in bytes, last modified, permissions, creation time etc
    const fileStat = await fs.stat(filePath);
    
    // size, exifdata, width / height, type
    const buffer = await fs.readFile(filePath);
    const dimensions = sizeOf(buffer);
    const exif_data = exif(buffer);

    return {
      filename: path.basename(filePath),
      path: filePath,
      size: fileStat.size,
      lastModified: fileStat.mtime.toISOString(),
      width: dimensions.width,
      height: dimensions.height,
      type: dimensions.type,
      exif: exif || {},
    };
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Error processing file ${filePath}: ${err.message}`);
    return null;
  }
}

// --- CSV Generation ---
function generateCSV(metadata) {
  const csvHeader = [
    'Filename', 'Path', 'Size (bytes)', 'Last Modified', 'Width', 'Height', 'Type',
    'EXIF: Make', 'EXIF: Model', 'EXIF: DateTime', 'EXIF: GPSLatitude', 'EXIF: GPSLongitude',
  ].join(',');

  const csvRows = metadata.map(data => {
    const exif = data.exif;
    return [
      `"${data.filename}"`, `"${data.path}"`, data.size, `"${data.lastModified}"`, data.width, data.height, `"${data.type}"`,
      `"${exif.Make?.description || ''}"`, `"${exif.Model?.description || ''}"`,
      `"${exif.DateTime?.description || ''}"`, `"${exif.GPSLatitude?.description || ''}"`,
      `"${exif.GPSLongitude?.description || ''}"`,
    ].join(',');
  }).join('\n');

  return `${csvHeader}\n${csvRows}`;
}

// --- Main ---
async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter directory path (default: .): ', async (dir) => {
    const targetDir = dir.trim() || '.';
    log(LOG_LEVELS.INFO, `Starting scan in directory: ${targetDir}`);

    const imageFiles = await getImageFiles(targetDir);
    log(LOG_LEVELS.INFO, `Found ${imageFiles.length} image files.`);

    const metadataPromises = imageFiles.map(getImageMetadata);
    const metadata = (await Promise.all(metadataPromises)).filter(Boolean);

    const csvContent = generateCSV(metadata);
    try {
      await fs.writeFile('image_metadata.csv', csvContent);
      log(LOG_LEVELS.INFO, 'CSV file saved as image_metadata.csv');
    } catch (err) {
      log(LOG_LEVELS.ERROR, `Error writing CSV file: ${err.message}`);
    }

    rl.close();
  });
}

main().catch(err => log(LOG_LEVELS.ERROR, `Fatal error: ${err.message}`));
