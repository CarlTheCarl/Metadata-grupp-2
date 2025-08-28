// Import the built-in Node.js file system module
import fs from "fs"
// Import the pdfParse library for extracting metadata from pdf files
import pdfParse from "pdf-parse/lib/pdf-parse.js"

// ---- directory constants ----
const DIRECTORY = "";

const files = await fs.readdirSync(DIRECTORY)

// console.log(files)
let combined_data = []

for ( let file of files) {
    console.log(file)

    // Read pdf-file "kursplan.pdf" from the root 
    const data = await fs.readFileSync(DIRECTORY + file);
    // Extract the data from the pdf-file using pdfParse
    const pdf = await pdfParse(data);

    // Write the data to the console.
    // console.log(pdf.info);
    combined_data.push({
        filename: file,
        info: pdf.info,
        
    });
}

console.log(combined_data);