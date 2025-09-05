    // Import the built-in Node.js file system module
    import fs, { stat, write } from "fs"
    // import 
    // Import the pdfParse library for extracting metadata from pdf files
    import pdfParse from "pdf-parse/lib/pdf-parse.js"

    // ---- directory constants ----
    const DIRECTORY = "./pdfs/";

    // Save full path
    const files = await fs.readdirSync(DIRECTORY)

    // ---Initialize overall output array---
    let combined_data = []

    for ( let file of files) {
        console.log("Now reading file: ", file)

        try {
            // Read pdf-file 
            const data = await fs.readFileSync(DIRECTORY + file);

            // Extract the data from the pdf-file using pdfParse
            const pdf = await pdfParse(data);

            // Extract fs.stat-data
            const stats = await fs.promises.stat(DIRECTORY + file);

            // Write the data to the console.
            // console.log(pdf);
            // console.log(stats.size)
            // console.log("is this seen?")
            combined_data.push({
                // path: ....????
                filename: file,
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                metadata: {
                    numpages: pdf.numpages,
                    pdf_info: pdf.info,
                    pdf_text: pdf.text // if no text is saved, then a lot less context. Perhaps strip in ETL?
                }
            });

        }
        catch(err){
            if (err.message == "Invalid PDF structure"){
                console.log("invalidooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
            } else {
            console.error(`Error processing file ${file}:`, err);
            }
        }
    }

    // console.log("")
    // console.log("presenting the full metadataset")
    // console.log(combined_data);

    async function writeToFile() {
        let now = Date.now();
        let filename = `../csvs/pdf_metadata_${now}.json`

        try {
            await fs.writeFileSync(filename, JSON.stringify(combined_data, null, 2));
            console.log(`JSON-file written successfully: ${filename}`);
        } catch (err) {
            console.log(`error occurred:`);
            console.log(err);
            console.log(`While writing file ${filename}`);
        }
    }

    writeToFile()