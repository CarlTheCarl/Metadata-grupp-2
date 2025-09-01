import fs from 'fs'

// constant directory
const DIRECTORY = "../retrieval/get_pdf/pdf-files"

const files = await fs.readdirSync(DIRECTORY)

// console.log(files)

for (let file of files) {
    console.log(file)
}