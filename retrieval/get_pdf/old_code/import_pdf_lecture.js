import fs from 'fs'
import PdfParse from 'pdf-parse/lib/pdf-parse.js'

const data = await fs.readFileSync("pdf-files/Hellman_Karin_KEG007.pdf")

const pdf = await PdfParse.PdfData(data)

console.log(pdf)