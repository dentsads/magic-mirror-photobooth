const gphoto2 = require('gphoto2');
const Fs = require('fs')  
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
  private readonly OUTPUT_DIR:string = "api/photos/"

  public constructor() {
    this.GPhoto = new gphoto2.GPhoto2();
  }

  public getCameraModel(): void {
    this.GPhoto.list(function (list) {
      if (list.length === 0) return;
      var camera = list[0];
      console.log('Found', camera.model);
    })
  }

  private async downloadImage () {
    const randomString = Math.random().toString(36).substring(2, 8)
    const url = 'https://picsum.photos/533/800'
    const path = Path.resolve(__dirname, '../../../magic-mirror-photobooth-photos', randomString + '_random.jpg')
    const writer = Fs.createWriteStream(path)
  
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

  public caputurePhoto(options: PhotoOptions, cb: (stdout?: object, e?: Error) => void): void {

    this.downloadImage()
    .then((result) => {
      // return something more meaningful here after getting DSLR ready
      return cb({ "result" : result })
    })    
  }

}
  
export { Photo, PhotoOptions }
