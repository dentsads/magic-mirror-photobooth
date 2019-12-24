const gphoto2 = require('gphoto2');

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
  private readonly OUTPUT_DIR:string = "photos"

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

  public caputurePhoto(options: PhotoOptions, cb: (stdout?: object, e?: Error) => void): void {
    // return something more meaningful here after getting DSLR ready
    return cb({ "result" : this.OUTPUT_DIR + "/01.jpg" })
  }

}
  
export { Photo, PhotoOptions }
