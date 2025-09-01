// import { PdfData, VerbosityLevel } from 'pdfdataextract';
import pdfParse from 'pdf-parse';
// import fs from 'fs';
// import { readFileSync } from 'fs';

// --constants--
// const PDF_DIRECTORY = "pdf-files/"

// const file_data = await fs.readdirSync(PDF_DIRECTORY);

// give me a list of all files in a folder

// let images = fs.readdirSync("pdf-files/")
// for (let file of file_data) {
//     // console.log(file)
//     console.log(file)
//     let databuffer = await fs.readFileSync(PDF_DIRECTORY + file)
//     console.log(databuffer)
//     pdfParse(databuffer).then(function(data) {
    
//         // number of pages
//         console.log(data.numpages);
//         // number of rendered pages
//         console.log(data.numrender);
//         // PDF info
//         console.log(data.info);
//         // PDF metadata
//         console.log(data.metadata); 
//         // PDF.js version
//         // check https://mozilla.github.io/pdf.js/getting_started/
//         console.log(data.version);
//         // PDF text
//         console.log(data.text); 
        
//     });

//     // const metadata = pdfParse.(databuffer)

//     // // all options are optional
//     // const metadata = await PdfData.extract(data, {
//     //     //password: '123456', // password of the pdf file
//     //     //pages: 1, // how many pages should be read at most
//     //     sort: true, // sort the text by text coordinates
//     //     verbosity: VerbosityLevel.ERRORS, // set the verbosity level for parsing
//     //     get: { // enable or disable data extraction (all are optional and enabled by default)
//     //     	pages: true, // get number of pages
//     //     	text: true, // get text of each page
//     //     	fingerprint: true, // get fingerprint
//     //     	outline: true, // get outline
//     //     	metadata: true, // get metadata
//     //     	info: true, // get info
//     //     	permissions: true, // get permissions
//     //     },
//     //     }).then((data) => {
//     //         data.pages; // the number of pages
//     //         data.text; // an array of text pages
//     //         data.fingerprint; // fingerprint of the pdf document
//     //         data.outline; // outline data of the pdf document
//     //         data.info; // information of the pdf document, such as Author
//     //         data.metadata; // metadata of the pdf document
//     //         data.permissions; // permissions for the document
//     //     });
    
//         console.log(metadata)
// }

