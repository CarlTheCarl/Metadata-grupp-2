// import exifr - a metadata extractor for images
import exifr from 'exifr';
// import fs (file system) - a built in module in Node.js
import fs, { rename } from 'fs';
// import { type } from 'os';
import { join } from 'path';
import { imageSizeFromFile } from 'image-size/fromFile';
import imageSize from 'image-size';

// defaults
const default_directory = 'retrieval/get_img_metadata/images';

// export async function getListOfFiles(directory){
//     // give me a list of all files in the image folder
//     let images = fs.readdirSync(directory);

//     return images;
// }

// const images = getListOfFiles('retrieval/get_img_metadata/images');

export async function moveFile(imagename, oldPathDirectoryTree, newDirectory) {
    const oldImgPath = join(oldPathDirectoryTree, imagename);
    const newSoftwareGoogleDir = join(oldPathDirectoryTree, newDirectory, imagename);
    fs.renameSync(oldImgPath, newSoftwareGoogleDir, (err) => {
        if (err) throw err;
        // console.log(image, " moved to ", newSoftwareGoogleDir);
    });
    console.log(imagename, " ---> ", newDirectory);
}


// Loop through the images and extract the metadata
export async function extractMetadata(directory = default_directory) {
    let numberOfUndefined = 0;
    let software_colon_google = 0;
    let erronousFiles = 0;
    let numberOfMetadataFilesNotUndefined = 0;
    let completeMetadata = [];

    for (let image of fs.readdirSync(directory)) {
        let oneImgMetadata = {};
        let metadata;
        let stats;
        let picture_size = null;
        let img_dimensions;

        try {
            // Extract file data
            stats = fs.statSync(join(directory, image));

            if (!stats.isFile()) {
                // console.log(image, " is a directory. Skipping...");
                continue;
            }

            try {
                // Extract imageSize data
                img_dimensions = await imageSizeFromFile(join(directory, image));
                // Reformat to "HeightxWidth":
                picture_size = `${JSON.stringify(img_dimensions.height)}x${JSON.stringify(img_dimensions.width)}`
                // console.log(picture_size);
            } catch (imageSizeErr) {
                console.log(image, " cannot be imageSize-extracted: ", imageSizeErr);
                
                // moves this file out of the way
                await moveFile(image, directory, "bad_pics");
            }

            // // Only for files ending with .jpg
            // // slice(-4) get the last 4 letters from the image name
            // const file_ending = image.slice(-4);
            // if (file_ending == '.jpg' || file_ending == '.JPG' ) {
            //     // file_ending == '.jpeg' ||
            //     // file_ending == '.heic' ||
            //     /*file_ending == '.HEIC'*/

            //     // Extract metadata:
            //     

            //     if (metadata === undefined) {
            //         numberOfUndefined += 1;
            //         await moveFile(image, directory, "undefined");
            //     } else if (metadata.Software === "Google") {
            //         software_colon_google += 1;
            //         await moveFile(image, directory, "software_google");
            //     } else {
            //         // For all other cases (metadata is defined and not "Google")
            //         numberOfMetadataFilesNotUndefined += 1;
            //     }
            // }

            // -- extract exifdata --
            metadata = await exifr.parse(join(directory, image));
            // console.log(image, stats.size, picture_size, metadata);

            oneImgMetadata = {
                filename: image,
                url: null,
                filesize: stats.size,
                picture_height: img_dimensions.height,
                picture_width: img_dimensions.width,
                created_locally: stats.ctime,
                modified_locally: stats.mtime,
                gps_latitude: metadata?.latitude || null,
                gps_longitude: metadata?.longitude || null,
                metadata: metadata || null
            };
            completeMetadata.push(oneImgMetadata);

        } catch (err) {
            if (err.message.includes("Unknown file format") || err.code === "ENOENT") {
                erronousFiles += 1;
                console.error(`Error in file ${image}: `, err);

                // moves this file out of the way
                await moveFile(image, directory, "bad_pics");
            }
        }

    }

    // // Counters for the different quality-types
    // console.log("Number of undefined = ", numberOfUndefined);
    // console.log("Number of numberOfMetadataFilesNotUndefined = ", numberOfMetadataFilesNotUndefined);
    // console.log("Number of software_colon_google = ", software_colon_google);
    // console.log("Number of error_files = ", erronousFiles);

    const metadataTextFile = 'allmetadata.txt';
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