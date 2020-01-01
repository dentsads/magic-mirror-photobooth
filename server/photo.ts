import { ErrorHandler } from './errorhandler';

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

  public constructor() {    
    this.initializeGphoto()
  }

  private initializeGphoto() {    
    return new Promise((resolve, reject) => {
      this.GPhoto = new gphoto2.GPhoto2();
      this.GPhoto.list( (list) => {
        if (list.length === 0) return reject();
        this.camera = list[0];
        console.log('Found', this.camera.model);

        resolve()
      })
    })
  }

  private async downloadImageTest() {
    const randomString = Math.random().toString(36).substring(2, 8)
    const url = 'https://picsum.photos/533/800'
    const path = Path.resolve(__dirname, '../../../magic-mirror-photobooth-photos', randomString + '_random.jpg')
    const writer = fs.createWriteStream(path)
  
    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve(randomString + '_random.jpg'))
      writer.on('error', reject)
    })
  }

  async downloadImage() {
    return new Promise((resolve, reject) => {
      // Take picture with camera object obtained from list()
      this.camera.takePicture({download: true}, (err, data) => {
        if (err) return reject(err);

        let uuidFileName = uuidv4() + '.jpg'

        const path = Path.resolve(__dirname, '../../../magic-mirror-photobooth-photos', uuidFileName)
        fs.writeFileSync(path, data);

        resolve(uuidFileName)
      });
    })
  }

  public capturePhoto(options: PhotoOptions, cb: (stdout?: object, e?: Error) => void): void {
    this.downloadImage()
    .then((imagePath) => {
      return cb({ "result" : imagePath })
    })
    .catch((err) => {
      if (err == -52) {           
        // try initalizing gphoto again, hoping the dslr reconnected
        this.initializeGphoto()
        .then(() => {
          this.downloadImage()
          .then((imagePath) => {
            return cb({ "result" : imagePath })
          })
          .catch((err) => {
            return cb(null, ErrorHandler.createError("10", "Tried twice to capture image unsuccessfully. Aborting"))      
          }) 
        })
        .catch(() => {
          return cb(null, ErrorHandler.createError("10", "Tried twice to capture image unsuccessfully. Aborting"))    
        })               
      }  
    })
  }

}
  
export { Photo, PhotoOptions }
