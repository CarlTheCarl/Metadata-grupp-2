import fs from 'fs'; // filesystem handler
import exifr from 'exifr'; // a metadata extractor for images

async retrieveMetaData(path) {
    // read the metadata from the greyhound image
    let metadata = await exifr.parse(path);
}

// list all files in a folder
// let images = fs.readdirSync('../pictures/');
function traverseDir(dir) {
fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
    traverseDir(fullPath);
    }  
    console.log(fullPath);
});
}

// // stipulate complete relative path
// // images.forEach((path) => console.log(`../pictures` + path))
// images.forEach((path) => console.log(`../pictures` + path));