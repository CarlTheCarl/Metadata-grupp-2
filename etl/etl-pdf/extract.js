// import exifr - a metadata extractor for images
import exifr from 'exifr';
// import fs (file system) - a built in module in Node.js
import fs, { rename } from 'fs';
// import { type } from 'os';
import { join } from 'path';
// import { imageSizeFromFile } from 'image-size/fromFile';
// import imageSize from 'image-size';
// Import the pdfParse library for extracting metadata from pdf files
import pdfParse from "pdf-parse/lib/pdf-parse.js"

// defaults
const default_directory = 'retrieval/get_pdf/pdfs';

// export async function getListOfFiles(directory){
//     // give me a list of all files in the image folder
//     let images = fs.readdirSync(directory);

//     return images;
// }

// const images = getListOfFiles('retrieval/get_img_metadata/images');

export async function moveFile(imagename, oldPathDirectoryTree, newDirectory) {
    const oldImgPath = join(oldPathDirectoryTree, imagename);
    const newDir = join(oldPathDirectoryTree, newDirectory, imagename);
    fs.renameSync(oldImgPath, newDir, (err) => {
        if (err) throw err;
        // console.log(image, " moved to ", newSoftwareGoogleDir);
    });
    console.log(imagename, " ---> ", newDirectory);
}


// Loop through the images and extract the metadata
export async function extractMetadata(directory = default_directory) {
    let numberOfUndefined = 0;
    let erronousFiles = 0;
    let definedMetadata = 0;
    let completeMetadata = [];

    for (let file of fs.readdirSync(directory)) {
        let oneFileMetadata = {};
        let metadata;
        let stats;
        let numberOfPages = null;
        // let img_dimensions;

        try {
            // Extract file data
            stats = fs.statSync(join(directory, file));

            if (!stats.isFile()) {
                // console.log(image, " is a directory. Skipping...");
                continue;
            }

            // -- extract pdfmetadata --
            metadata = await pdfParse(file);
            if (!metadata) {
                console.error("Error! Not possible to extract metadata from ", file);
                numberOfUndefined += 1;
                await moveFile(file, directory, "undefined");
            } else if (metadata) {
                console.log()
            }
            // metadata = await exifr.parse(join(directory, file));
            // console.log(image, stats.size, picture_size, metadata);

            // oneFileMetadata = {
            //     filename: file,
            //     url: join(directory, file),
            //     filesize: stats.size,
            //     picture_height: img_dimensions.height,
            //     picture_width: img_dimensions.width,
            //     created_locally: stats.ctime,
            //     modified_locally: stats.mtime,
            //     gps_latitude: metadata?.latitude || null,
            //     gps_longitude: metadata?.longitude || null,
            //     metadata: metadata || null
            // };
            // completeMetadata.push(oneFileMetadata);

        } catch (err) {
            if (err.message.includes("Unknown file format") || err.code === "ENOENT") {
                erronousFiles += 1;
                console.error(`Error in file ${file}: `, err);

                // moves this file out of the way
                await moveFile(file, directory, "bad_files");
            }
        }

    }

    // Counters for the different quality-types
    console.log("Number of undefined = ", numberOfUndefined);
    console.log("Number of numberOfMetadataFilesNotUndefined = ", definedMetadata);
    console.log("Number of error_files = ", erronousFiles);

    const metadataTextFile = 'pdf-allmetadata.txt';
    const metadataToText = JSON.stringify(completeMetadata, null, 2);

    try {
        fs.writeFileSync(metadataTextFile, metadataToText);
        console.log(metadataTextFile, 'was written successfully!');
    } catch (errMetadataTextFile) {
        console.log("Error writing ", metadataTextFile, errMetadataTextFile);
    }

    return completeMetadata;
}

// only run extractMetadata when this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    // This code will only run if the file is executed directly
    await extractMetadata(default_directory);
}