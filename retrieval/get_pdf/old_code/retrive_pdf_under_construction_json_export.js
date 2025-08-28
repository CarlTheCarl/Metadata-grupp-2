// Import the built-in Node.js file system module
import fs from "fs"
// Import the pdfParse library for extracting metadata from pdf files
import pdfParse from "pdf-parse/lib/pdf-parse.js"

// ---- directory constants ----
const DIRECTORY = "small_subset_pdfs/";

const files = await fs.readdirSync(DIRECTORY)

// constants
let combined_data = []
let csv_metadata_file = "csv_metadata_file.csv"


const generate_metadata = async function (csv_filename){
    for ( let file of files) {
        console.log("Now reading file: ", file)

        // // Extract fs.stat-data
        // const stats = fs.statSync(file)
        
        try {
            // Read pdf-file 
            const data = await fs.readFileSync(DIRECTORY + file);

            // Extract the data from the pdf-file using pdfParse
            const pdf = await pdfParse(data);

            // Write the data to the console.
            // console.log(pdf);
            // console.log(stats.size)
            // console.log("is this seen?")
            combined_data.push({
                filename: file,
                // size: stats.size,
                numpages: pdf.numpages,
                metadata: pdf.info,
                text: pdf.text, // if no text is saved, then a lot less context. Perhaps strip in ETL?
            });

            // write to csv
            fs.appendFile(csv_filename, combined_data, 'utf8', function (err) {
                if (err) {
                    console.log('Some error occured - file either not saved or corrupted file saved.');
                } else{
                    console.log('It\'s saved!');
                }
            });
        }
        catch(err) {
            if (err.message == "Invalid PDF structure"){
                console.log("invalidooooooooooooooooooooooooooooooooooooooooooooooooooooooo")
            }
            // console.log(err)
        }
    }
};

// console.log("")
// console.log("presenting the full metadataset")
// console.log(combined_data);

generate_metadata(csv_metadata_file)

const csv_file = await fs.readFileSync(csv_metadata_file);
console.log(csv_file)