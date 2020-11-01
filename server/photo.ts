import { ErrorHandler } from './errorhandler';
import { logger } from './logger';
import config from '../config.json'

var exec = require('child_process').exec

const gphoto2 = require('gphoto2');
const fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')
const uuidv4 = require('uuid/v4');
const os = require('os')

var config_dir = os.homedir() + "/" + config.config_dir;
var photos_dir = config_dir + "/" + config.photos_sub_dir;
var event_photos_dir = photos_dir + "/" + config.event_id;

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
    if (!( process.env.PHOTOBOOTH_CAMERA_MOCK == '1' )&& this.camera == undefined) {
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

  private toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
  }

  // see: https://www.exif.org/Exif2-2.PDF
  private getJpegExifOrientation(data: Buffer): number {
    const view = new DataView(this.toArrayBuffer(data));
  
      if (view.getUint16(0, false) != 0xFFD8) {
          return -2;
      }
  
      const length = view.byteLength
      let offset = 2;
  
      while (offset < length)
      {
          if (view.getUint16(offset+2, false) <= 8) return -1;
          let marker = view.getUint16(offset, false);
          offset += 2;
  
          if (marker == 0xFFE1) {
            if (view.getUint32(offset += 2, false) != 0x45786966) {
              return -1;
            }
  
            let little = view.getUint16(offset += 6, false) == 0x4949;
            offset += view.getUint32(offset + 4, little);
            let tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                return view.getUint16(offset + (i * 12) + 8, little);
              }
            }
          } else if ((marker & 0xFF00) != 0xFF00) {
              break;
          }
          else {
              offset += view.getUint16(offset, false);
          }
      }
      return -1;
  }

  private async downloadImageTest() {
    const randomString = Math.random().toString(36).substring(2, 8)
    const url = 'https://picsum.photos/533/800'

    const path = event_photos_dir + '/' + randomString + '_random.jpg'
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

        const path = event_photos_dir + '/' + uuidFileName
        fs.writeFileSync(path, data);

        return resolve({ imagePath: uuidFileName, exifOrientation: jpegExifOrientation } )
      });
    })
  }

  public capturePhoto(options: PhotoOptions, cb: (stdout?: object, e?: object) => void): void {
    // if no DSLR is available then mock the camera by fetching pics from this.downloadImageTest
    if (process.env.PHOTOBOOTH_CAMERA_MOCK == '1') {
      logger.log('info', 'DSLR camera mocking is enabled through env PHOTOBOOTH_CAMERA_MOCK=1');      
      this.captureFunction = this.downloadImageTest
    }      

    this.captureFunction()
    .then((result) => {
      return cb({ "result" : result })
    })
    .catch((err) => {

      // Error when trying to find USB device.
      if (err && !(process.env.PHOTOBOOTH_CAMERA_MOCK == '1') ) {
        
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
