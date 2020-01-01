import { ErrorHandler } from './errorhandler';

const gphoto2 = require('gphoto2');
const fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')

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

  public constructor() {
    this.GPhoto = new gphoto2.GPhoto2();
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
      this.GPhoto.list(function (list) {
        if (list.length === 0) return reject("No camera model detected");
        var camera = list[0];
        console.log('Found', camera.model);
  
  
        // Take picture with camera object obtained from list()
        camera.takePicture({download: true}, function (err, data) {
          if (err) reject(err);     

          const path = Path.resolve(__dirname, '../../../magic-mirror-photobooth-photos', 'pic.jpg')
          fs.writeFileSync(path, data);

          resolve(path)
        });
      })
    })
  }

  public caputurePhoto(options: PhotoOptions, cb: (stdout?: object, e?: Error) => void): void {
    this.downloadImage()
    .then((imagePath) => {
      return cb({ "result" : imagePath })
    })
    .catch((err) => {
      return cb(null, ErrorHandler.createError("10", err))      
    })
  }

}
  
export { Photo, PhotoOptions }
