import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

// Utilises Darknet YOLO v.3 pretrained model for object detection
// @article{yolov3,
//   title={YOLOv3: An Incremental Improvement},
//   author={Redmon, Joseph and Farhadi, Ali},
//   journal = {arXiv},
//   year={2018}
// }
// https://pjreddie.com/darknet/yolo/

const execAsync = promisify(exec);
const darknetPath = './darknet';
const stats = await fs.stat(darknetPath);
console.log('Is executable?', (stats.mode & fs.constants.S_IXUSR) !== 0);
const imageDir = '../images/';
const outputCSV = '../output_img_object_detection.csv';

// In order to get the bounding box cordinates
// ./src/image.c has to be modified with the following:
// ...
// if(bot > im.h-1) bot = im.h-1;
//
// Print bounding box values 
// printf("Bounding Box: Left=%d, Top=%d, Right=%d, Bottom=%d\n", left, top, right, bot); 
// draw_box_width(im, left, top, right, bot, width, red, green, blue);
// ...
// as per: https://stackoverflow.com/questions/44544471/how-to-get-the-coordinates-of-the-bounding-box-in-yolo-object-detection

// Write CSV header
await fs.writeFile(outputCSV, 'id,filename,object_name,boundingbox_start,boundingbox_stop\n');

// Helper function to run Darknet
async function runDarknet(imagePath) {
  const command = `${darknetPath} detect cfg/yolov3.cfg yolov3.weights "${imagePath}"`;
  console.log("Running command:", command);
  const { stdout } = await execAsync(command);
  console.log(`darknets stdout: `, stdout);
  return stdout;
}

// Helper function to parse output and generate CSV
async function parseOutputAndGenerateCSV(output, file, index) {
  const lines = output.split('\n');
  const detections = [];
  let currentDetection = null;

  for (const line of lines) {
    if (line.includes(':')) {
      const [objectName, confidence] = line.split(':').map(s => s.trim());
      if (objectName && confidence) {
        currentDetection = {
          object_name: objectName,
          confidence: parseFloat(confidence.replace('%', '')),
          bounding_box: null,
        };
        detections.push(currentDetection);
      } // I feel like this if - statement is in thw wrong place...:
    } else if (line.includes('Bounding Box:')) {
      const parts = line.split('=');
      const left = parseInt(parts[1].split(',')[0].trim());
      console.log('left side thing value is: ', left)
      const top = parseInt(parts[2].split(',')[0].trim());
      const right = parseInt(parts[3].split(',')[0].trim());
      const bottom = parseInt(parts[4].trim());

      if (currentDetection) {
        currentDetection.bounding_box = { left, top, right, bottom };
      }
    }
  }

  // Debug it was actually created
  console.log('Following detections detected: ', detections);

  // Generate a CSV row for each detection
  for (const [detIndex, det] of detections.entries()) {
    if (!det.bounding_box) continue;

    const csvRow = `"${index}_${detIndex}", "${file}", "${det.object_name}", "[${det.bounding_box.left},${det.bounding_box.top}]", "[${det.bounding_box.right},${det.bounding_box.bottom}]"`;
    await fs.appendFile(outputCSV, csvRow + '\n');
  }
}

// Main function to process all images
async function processImages() {
  try {
    const files = await fs.readdir(imageDir);
    for (const [index, file] of files.entries()) {
      const imagePath = `${imageDir}${file}`;
      console.log('Now processing: ', imagePath);
      const output = await runDarknet(imagePath);
      await parseOutputAndGenerateCSV(output, file, index);
    }
  } catch (err) {
    console.error('Error processing images:', err);
  }
}

// Run the script
processImages();
