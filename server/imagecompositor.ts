import { ErrorHandler, Error } from './errorhandler'
import { logger } from './logger';
import config from '../config.json'
var exec = require('child_process').exec

const fs = require('fs')  
const os = require('os')
const uuidv4 = require('uuid/v4');

var config_dir = os.homedir() + "/" + config.config_dir;
var photos_dir = config_dir + "/" + config.photos_sub_dir;
var assets_dir = config_dir + "/" + config.assets_sub_dir;
var event_dir = photos_dir + "/" + config.event_id;

enum TemplateLayout {
  TWO_UNIFORM = "TWO_UNIFORM",
  THREE_UNIFORM = "THREE_UNIFORM",
  THREE_NON_UNIFORM = "THREE_NON_UNIFORM"
}

interface CompositorOptions {
  templateLayout: TemplateLayout;
  imgSrcList: string[];
  drawingImageDataURL: string;
  overlayImage: string;
  logoImage: string;
  logoImageOffset: string;
  logoImageSize: string;
  overlayText: string;
  overlayTextSize: string;
  overlayTextOffset: string;
}

const templateImageOffsets: Record<string,string[]> = {
  'THREE_UNIFORM': [ '+50+245', '+627+245', '+1218+245' ],
  'THREE_NON_UNIFORM': [ '+98+199', '+617+144', '+1248+199' ]
}

const templateImageSizes: Record<string,string[]> = {
  'THREE_UNIFORM': [ '533x800', '533x800', '533x800' ],
  'THREE_NON_UNIFORM': [ '450x675', '562x844', '450x675' ]
}

class ImageCompositor {
  private readonly IMAGE_WIDTH:number = 1795
  private readonly IMAGE_HEIGHT:number = 1205
  private readonly DRAWING_WIDTH:number = 200
  private readonly DRAWING_HEIGHT:number = 200
  private readonly TMP_DIR:string = "./built"
  private readonly TMP_FILE:string = this.TMP_DIR + "/tmp.png"  
  private readonly PHOTOS_PATH:string = 'api/photos/' + config.event_id + '/'
  private readonly PHOTOS_DIR:string = photos_dir
  private readonly EVENT_DIR:string = event_dir
  private readonly ASSETS_DIR:string = assets_dir
  private readonly DRAWING_FILE:string = this.PHOTOS_DIR + '/drawing.png'

  public constructor() {}

  public composite(options: CompositorOptions, cb: (stdout?: object, e?: Error) => void): void {
    if (options.imgSrcList.length == undefined)
      return cb(null, ErrorHandler.createError("1","There are no images to composite into print template."));
    if (options.overlayImage === '')
      return cb(null, ErrorHandler.createError("0","No path for overlay image to be composed was specified."));
 
    let compositeArgs = [
      '-size', `${this.IMAGE_WIDTH}x${this.IMAGE_HEIGHT}`,
      'xc:none'
    ]         

    options.imgSrcList.forEach( (img, imgIndex)  => {
      compositeArgs.push('\\(')
      compositeArgs.push(this.EVENT_DIR + '/' + img)
      compositeArgs.push('-auto-orient')
      compositeArgs.push(`-resize ${templateImageSizes[options.templateLayout][imgIndex]}`)    
      compositeArgs.push(`-repage ${templateImageOffsets[options.templateLayout][imgIndex]}`)            
      compositeArgs.push('\\)')
    });

    // Overlay drawing result (if available) on lower left corner of last image to be rendered
    if (options.drawingImageDataURL !== '') {
      let drawingImageBase64 = options.drawingImageDataURL.replace(/^data:image\/\w+;base64,/, "");
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

    logger.log('info', 'convert ' + compositeArgs.join(' '))

    exec('convert ' + compositeArgs.join(' '), (err, stdout, stderr) => { 
      if (err) return cb(null, ErrorHandler.createError("1",err))

      let logoImage = options.logoImage == undefined ? undefined : this.ASSETS_DIR + '/' + options.logoImage
      this.compose(this.TMP_FILE, this.ASSETS_DIR + '/' + options.overlayImage, logoImage, options.logoImageOffset, options.logoImageSize, options.overlayText, options.overlayTextSize, options.overlayTextOffset, cb)
    });

  }

  public compose(img: string = '', overlayImage: string = '', overlayLogoImg: string = '', overlayLogoImgOffset: string = '+10+10', logoImageSize: string = '200', overlayText: string = '', overlayTextSize: string, overlayTextOffset: string, cb: (stdout?: object, e?: Error) => void): void {
    let uuidFileName = uuidv4() + '_collage.png'

    let compositeArgs = [
      '-size', `${this.IMAGE_WIDTH}x${this.IMAGE_HEIGHT}`,
      'xc:none'
    ]

    compositeArgs.push(img)
    compositeArgs.push('-composite')
    compositeArgs.push(`${overlayImage}`)
    compositeArgs.push('-composite')

    // Overlay logo (if available)
    if (overlayLogoImg !== ''&& fs.existsSync(overlayLogoImg)) {
      compositeArgs.push('\\(')
      compositeArgs.push(overlayLogoImg)
      compositeArgs.push(`-resize ${logoImageSize}`)               
      compositeArgs.push('\\)')
      compositeArgs.push(`-geometry ${overlayLogoImgOffset}`)
      compositeArgs.push('-composite')
    }

    // Overlay text (usually the componay URL)
    if (overlayText !== '') {
      compositeArgs.push('\\(')      
      compositeArgs.push(`-pointsize ${overlayTextSize}`)         
      compositeArgs.push(`-annotate ${overlayTextOffset}`)      
      compositeArgs.push(overlayText)
      compositeArgs.push('\\)')
    }

    compositeArgs.push(this.EVENT_DIR + '/' + uuidFileName)

    logger.log('info', 'convert ' + compositeArgs.join(' '))

    exec('convert ' + compositeArgs.join(' '), (err, stdout, stderr) => { 
      exec('convert ' + this.EVENT_DIR + '/' + uuidFileName + ' -resize 1783x1193 -gravity center -background white -extent 1821x1240+6+0 ' + this.PHOTOS_DIR + '/printable_result.png', (err, stdout, stderr) => { 
        if (err) {
          return cb(null, ErrorHandler.createError("1",err))
        } else {
          return cb({ "result" : this.PHOTOS_PATH + uuidFileName });
        }      
      });       
    });    
  }

}

export { ImageCompositor, TemplateLayout }