import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, } from 'fs';

// URL of the image to download

// Folder path to save the downloaded image
const folder = './images/';
// Function to download and save the image
export const downloadImage = async (url, fileName) => {
  const filePath = `${folder}${fileName}`
  try {
    if (existsSync(filePath)) {
      console.log('File already exists:', filePath);
      return;
    }
    
    // console.log('fileName ', fileName)
    const apiImg = `https://cdn.akson.ru/webp${url}0.jpg`
    const response = await axios.get(apiImg, {
      responseType: 'stream'
    });

    response.data.pipe(createWriteStream(filePath));

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        console.log(`Image saved to ${filePath}`);
        resolve();
      });

      response.data.on('error', (err) => {
        console.log(err)
        reject(err);
      });
    });
  } catch (error) {
    console.log(error)
  }

};

// Create the images folder if it doesn't exist
if (!existsSync(folder)) {
  mkdirSync(folder);
}

// console.log(await readdir('./images'))
// console.log(existsSync('./images/i100100984.jpg'))