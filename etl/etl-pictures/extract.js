// import exifr - a metadata extractor for images
import exifr from 'exifr';
// import fs (file system) - a built in module in Node.js
import fs, { rename } from 'fs';
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
export async function extractMetadata(directory) {
    let numberOfUndefined = 0;
    let numberOfMetadataFiles = 0;
    let more_software_colon_google = 0;
    let erronousFiles = 0;
    let numberOfMetadataFilesNotUndefined = 0;

    let metadata = [];

    for (let image of fs.readdirSync(directory)) {
        try {
            let oneImgMetadata = {};
            oneImgMetadata["filename"] = image;
            // console.log(fs.stat(image));
            // oneImgMetadata["size"] = fs.stat
            // console.log("before everythng happens: ", oneImgMetadata)
            // Only for files ending with .jpg
            // slice(-4) get the last 4 letters from the image name
            if (image.slice(-4) == '.jpg') {
                // console.log('IMAGE: ' + image);
                let metadata = await exifr.parse(join(directory, image));
                if (metadata == undefined) {
                    numberOfUndefined += 1;
                    await moveFile(image, directory, "undefined");
                } else if (metadata.Software == "Google"){
                    console.log("Software_google")
                    await moveFile(image, directory, "software_google");
                    // const oldImgPath = join(directory, image);
                    // const newSoftwareGoogleDir = join(directory, "software_google", image);
                    // fs.renameSync(oldImgPath, newSoftwareGoogleDir, (err) => {
                    //     if (err) throw err;
                    //     console.log(image, " moved to ", newSoftwareGoogleDir);
                    // });
                    more_software_colon_google += 1;
                } else if (metadata != undefined) {
                    numberOfMetadataFilesNotUndefined += 1;

                    const regex = /^[IMG]/;
                    if (image == regex.test(image)) {
                        console.log(image, " has valid metadata, ", metadata);
                    }
                    // console.log(metadata);
                    // oneImgMetadata = {metadata};
                    // console.log(image);
                    // console.log(metadata); // Some of them are { Software:}
                    // console.log("Metadata in this file: ", image, metadata);
                    // console.log(metadata);
                } else if (metadata) {
                    console.log(image, " has no metadata!");
                    numberOfMetadataFiles += 1;
                } else {
                    console.log(image, " has invalidities!")
                }
            }
            // console.log(oneImgMetadata)

        } catch(err) {
            erronousFiles += 1;
            console.log(`Error in file ${image}: `, err);

            // moves this file out of the way
            await moveFile(image, directory, "bad_pics");
            // const oldImgPath = join(directory, image);
            // const newPathBad_Pics = join(directory, "bad_pics", image);
            // fs.renameSync(oldImgPath, newPathBad_Pics, (err) => {
            //     if (err) throw err;
            //     console.log(image, " moved to ", newSoftwareGoogleDir);
            // });
        }
    }
    console.log("Number of undefined = ", numberOfUndefined);
    console.log("Number of defined = ", numberOfMetadataFiles);
    console.log("Number of numberOfMetadataFilesNotUndefined = ", numberOfMetadataFilesNotUndefined);
    console.log("Number of more_software_colon_google = ", more_software_colon_google);
    console.log("Number of error_files = ", erronousFiles);
}

// console.log(fs.stat(join(default_directory, )))

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