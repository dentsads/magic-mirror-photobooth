import { ErrorHandler } from './errorhandler';
import { logger } from './logger';
var exec = require('child_process').exec

const gphoto2 = require('gphoto2');
const fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')
const uuidv4 = require('uuid/v4');

function sleep(ms): Promise<any> {
  return new Promise((resolve): any => setTimeout(resolve, ms))
}

async function wait(ms): Promise<any> {
  await sleep(ms)
}

interface PhotoOptions {
  test: string
}

class Photo {
  private GPhoto
  private camera
  private captureFunction = this.downloadImage

  public constructor() {
    this.killAllRunningGphotoProcesses()
    this.initializeGphoto()
    .then(() => {
    })
    .catch((err) => {  
    })
  }

  public isHealthy(): boolean {
    if (!process.env.PHOTOBOOTH_CAMERA_MOCK && this.camera == undefined) {
      return false;
    } else {
      return true;
    }     
  }

  private initializeGphoto() {    
    return new Promise((resolve, reject) => {
      this.GPhoto = new gphoto2.GPhoto2();
      this.GPhoto.list( (list) => {
        if (list.length === 0) return reject("Camera cannot be detected. Initialization failed");
        this.camera = list[0];
        logger.log('info', 'Found camera model %s', this.camera.model);

        return resolve()
      })
    })
  }

  private killAllRunningGphotoProcesses() {    
    logger.log('info', 'killing all running gphoto2 processeses');
    exec('pkill -f gphoto2', (err, stdout, stderr) => {
      logger.log('error', err);
    }); 
  }

  // see: https://www.exif.org/Exif2-2.PDF
  private getJpegExifOrientation(data: Buffer): number {  
    let idx= 0;
    let value = 1; // Non-rotated is the default
    let maxBytes = data.byteLength

    // Is it a jpeg? If not then don't continue
    if (data.readUInt16BE(0).toString(16) !== 'ffd8' && data.readUInt16BE(2).toString(16) !== 'ffe1') {
      logger.log('debug', 'Buffered image is not a JPEG. Don\'t extract EXIF orientation');
      return value
    }     

    while (idx < maxBytes - 2) {
      let uint16 = data.readUInt16BE(idx).toString(16);

      idx += 2;      
      switch (uint16) {
        case 'ffe1': // Start of EXIF
          let exifLength = data.readUInt16BE(idx);
          maxBytes = exifLength - idx;
          idx += 2;
          break;
        case '112': // Orientation tag
          // Read the value, its 6 bytes further out
          // see: https://www.exif.org/Exif2-2.PDF
          value = data.readUInt16BE(idx + 6);
          maxBytes = 0; // Stop scanning
          break;
      }
    }

    return value;

  }

  private async downloadImageTest() {
    const randomString = Math.random().toString(36).substring(2, 8)
    const url = 'https://picsum.photos/533/800'
    const path = Path.resolve(__dirname, '../../magic-mirror-photobooth-photos', randomString + '_random.jpg')
    const writer = fs.createWriteStream(path)
  
    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve({ imagePath: randomString + '_random.jpg', exifOrientation: 1 } ))
      writer.on('error', reject)
    })
  }

  private async downloadImage() {
    return new Promise((resolve, reject) => {
      if (this.camera == undefined)
        return reject("Camera cannot be detected. Initialization failed.")

      logger.log('info', 'Capturing picture with DSLR');

      // Take picture with camera object obtained from list()
      this.camera.takePicture({download: true}, (err, data: Buffer) => {
        if (err) return reject(err);             

        logger.log('info', 'Successfully captured picture with DSLR');

        let jpegExifOrientation = this.getJpegExifOrientation(data);
        logger.log('info', 'Jpeg orientation is %d', jpegExifOrientation);

        let uuidFileName = uuidv4() + '.jpg'

        const path = Path.resolve(__dirname, '../../magic-mirror-photobooth-photos', uuidFileName)
        fs.writeFileSync(path, data);

        return resolve({ imagePath: uuidFileName, exifOrientation: jpegExifOrientation } )
      });
    })
  }

  public capturePhoto(options: PhotoOptions, cb: (stdout?: object, e?: object) => void): void {
    // if no DSLR is available then mock the camera by fetching pics from this.downloadImageTest
    if (process.env.PHOTOBOOTH_CAMERA_MOCK) {
      logger.log('info', 'DSLR camera mocking is enabled through env PHOTOBOOTH_CAMERA_MOCK=1');      
      this.captureFunction = this.downloadImageTest
    }      

    this.captureFunction()
    .then((result) => {
      return cb({ "result" : result })
    })
    .catch((err) => {

      // Error when trying to find USB device.
      if (err && !process.env.PHOTOBOOTH_CAMERA_MOCK) {
        
        // try initalizing gphoto again, hoping the dslr reconnected
        this.initializeGphoto()
        .then(() => {
          this.downloadImage()
          .then((result) => {
            return cb({ "result" : result })
          })
          .catch((err) => {
            return cb(null, ErrorHandler.createError("11", err))      
          }) 
        })
        .catch((err) => {
          return cb(null, ErrorHandler.createError("12", err))    
        })    

      }
    })
  }

}
  
export { Photo, PhotoOptions }
