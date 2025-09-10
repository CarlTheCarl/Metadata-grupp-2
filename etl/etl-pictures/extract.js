// import exifr - a metadata extractor for images
import exifr from 'exifr';
// import fs (file system) - a built in module in Node.js
import fs from 'fs';
import { type } from 'os';
import { join } from 'path';

// defaults
const default_directory = 'retrieval/get_img_metadata/images';

// export async function getListOfFiles(directory){
//     // give me a list of all files in the image folder
//     let images = fs.readdirSync(directory);

//     return images;
// }

// const images = getListOfFiles('retrieval/get_img_metadata/images');


// Loop through the images and extract the metadata
export async function extractMetadata(directory) {
    let numberOfUndefined = 0;
    let numberOfMetadataFiles = 0;
    let whatTheDuckIsThis = 0;

    for (let image of fs.readdirSync(directory)) {
        try {
            // Only for files ending with .jpg
            // slice(-4) get the last 4 letters from the image name
            if (image.slice(-4) == '.jpg') {
                console.log('IMAGE: ' + image);
                let metadata = await exifr.parse(join(directory, image));
                if (metadata == undefined) {
                    numberOfUndefined += 1;
                } else if (metadata != undefined) {
                    numberOfMetadataFiles += 1;
                    // console.log(metadata);
                } else {
                    whatTheDuckIsThis += 1;
                }
            }
        } catch(err) {
            console.log(err);
        }
    }
    console.log("Number of undefined = ", numberOfUndefined);
    console.log("Number of defined = ", numberOfMetadataFiles);
    console.log("Number of WTDIS = ", whatTheDuckIsThis);
}

await extractMetadata(default_directory);

// export async function retrieve_exif_from_jpg(directory, list_of_files) {
//     let metadata = {};


//     // Loop through the images and extract the metadata
//     for (let image of list_of_files) {
//         metadata['filename'] = image;
//         console.log(metadata["filename"]);
//         // Only for files ending with .jpg
//         // slice(-4) get the last 4 letters from the image name
//         if (image.slice(-4) == '.jpg') {
//             let metadata = await exifr.parse(join(directory, image));
//         }
//     }

//     console.log(metadata);
// }

// export async function retrieveAllMetadata(directory) {
//     console.log("directory: ", directory);
//     const listOfFiles = await getListOfFiles(directory);
//     console.log(typeof(listOfFiles[0]));

//     const retrieved_metadata = await retrieve_exif_from_jpg(directory, listOfFiles);

//     // return retrieved_metadata;
    
// }

// console.log(retrieveAllMetadata("retrieval/get_img_metadata/images"));