// Import filesystem handler
import fs from 'fs';

// import exifr - a metadata extractor for images
import exifr from 'exifr';

// list all files in a folder
let images = fs.readdirSync('../pictures/');

// console.log(images);

function retrieveMetaData(path) {
    // read the metadata from the greyhound image
    let metadata = await exifr.parse(path);
}

// stipulate complete relative path
// images.forEach((path) => console.log(`../pictures` + path))
images.forEach((path) => console.log(`../pictures` + path));