import { ErrorHandler, Error } from './errorhandler'
import config from '../config.json'
var exec = require('child_process').exec

const fs = require('fs')  
const os = require('os')

var config_dir = os.homedir() + "/" + config.config_dir;
var photos_dir = config_dir + "/" + config.photos_sub_dir;
var assets_dir = config_dir + "/" + config.assets_sub_dir;

enum TemplateLayout {
  TWO_UNIFORM = "TWO_UNIFORM",
  THREE_UNIFORM = "THREE_UNIFORM",
  THREE_NON_UNIFORM = "THREE_NON_UNIFORM"
}

interface CompositorOptions {
  templateLayout: TemplateLayout;
  imgSrcList: string[];
  drawingImg: string;
  overlayImg: string;
}

const templateImageOffsets: Record<string,string[]> = {
  'THREE_UNIFORM': [ '+50+245', '+623+245', '+1218+245' ]
}

const templateImageSizes: Record<string,string[]> = {
  'THREE_UNIFORM': [ '533x800', '533x800', '533x800' ]
}

class ImageCompositor {
  private readonly IMAGE_WIDTH:number = 1205
  private readonly IMAGE_HEIGHT:number = 1795
  private readonly DRAWING_WIDTH:number = 200
  private readonly DRAWING_HEIGHT:number = 200
  private readonly TMP_DIR:string = "./built"
  private readonly TMP_FILE:string = this.TMP_DIR + "/tmp.png"  
  private readonly PHOTOS_PATH:string = 'api/photos/'
  private readonly PHOTOS_DIR:string = photos_dir
  private readonly ASSETS_DIR:string = assets_dir
  private readonly DRAWING_FILE:string = this.PHOTOS_DIR + "/drawing.png"

  public constructor() {}

  public composite(options: CompositorOptions, cb: (stdout?: object, e?: Error) => void): void {
    if (options.imgSrcList.length == undefined)
      return cb(null, ErrorHandler.createError("1","There are no images to composite into print template."));
    if (options.overlayImg === '')
      return cb(null, ErrorHandler.createError("0","No path for overlay image to be composed was specified."));

    let compositeArgs = [
      '-size', `${this.IMAGE_HEIGHT}x${this.IMAGE_WIDTH}`,
      'xc:none'
    ]         

    options.imgSrcList.forEach( (img, imgIndex)  => {
      compositeArgs.push('\\(')
      compositeArgs.push(this.PHOTOS_DIR + '/' + img)
      compositeArgs.push('-auto-orient')
      compositeArgs.push(`-resize ${templateImageSizes[options.templateLayout][imgIndex]}`)    
      compositeArgs.push(`-repage ${templateImageOffsets[options.templateLayout][imgIndex]}`)            
      compositeArgs.push('\\)')
    });

    // Overlay drawing result (if available) on lower left corner of last image to be rendered
    if (options.drawingImg !== '') {
      let drawingImageBase64 = options.drawingImg.replace(/^data:image\/\w+;base64,/, "");
      let bufferedImage = new Buffer(drawingImageBase64, 'base64');
      fs.writeFileSync(this.DRAWING_FILE, bufferedImage);

      let lastImgIndex = templateImageSizes[options.templateLayout].length - 1;
      let imageSizeArr = templateImageSizes[options.templateLayout][lastImgIndex].split('x')
      let imageSizeHeight = Number(imageSizeArr[1])
      let imageOffsetArr = templateImageOffsets[options.templateLayout][lastImgIndex].split('+')
      let imageOffsetX = Number(imageOffsetArr[1])
      let imageOffsetY = Number(imageOffsetArr[2])

      compositeArgs.push('\\(')
      compositeArgs.push(this.DRAWING_FILE)
      compositeArgs.push(`-resize ${this.DRAWING_HEIGHT}x${this.DRAWING_WIDTH}`)    
      compositeArgs.push(`-repage +${imageOffsetX}+${imageOffsetY + imageSizeHeight - this.DRAWING_HEIGHT}`)            
      compositeArgs.push('\\)')
    }   

    compositeArgs.push('-layers', 'flatten')
    compositeArgs.push(this.TMP_FILE)

    exec('convert ' + compositeArgs.join(' '), (err, stdout, stderr) => { 
      if (err) return cb(null, ErrorHandler.createError("1",err))
      this.compose(this.TMP_FILE, this.ASSETS_DIR + '/' + options.overlayImg, cb)
    });

  }

  public compose(img: string = '', overlayImg: string = '', cb: (stdout?: object, e?: Error) => void): void {
    let compositeArgs = `${img} ${overlayImg} -compose over -composite ${this.PHOTOS_DIR}/result.png`

    exec('convert ' + compositeArgs, (err, stdout, stderr) => { 
      if (err) {
        return cb(null, ErrorHandler.createError("1",err))
      } else {
        return cb({ "result" : this.PHOTOS_PATH + "result.png" });
      }      
    });    
  }

}

export { ImageCompositor, TemplateLayout }