import { ErrorHandler, Error } from './errorhandler'

var exec = require('child_process').exec

enum TemplateLayout {
  TWO_UNIFORM = "TWO_UNIFORM",
  THREE_UNIFORM = "THREE_UNIFORM",
  THREE_NON_UNIFORM = "THREE_NON_UNIFORM"
}

interface CompositorOptions {
  templateLayout: TemplateLayout;
  imgSrcList: string[];
  overlayImg: string;
}

const templateOffsets: Record<string,string[]> = {
  'THREE_UNIFORM': [ '+50+245', '+623+245', '+1218+245' ]
}

class ImageCompositor {
  private readonly IMAGE_WIDTH:number = 1205
  private readonly IMAGE_HEIGHT:number = 1795
  private readonly TMP_DIR:string = "./built"
  private readonly TMP_FILE:string = this.TMP_DIR + "/tmp.png"
  private readonly OUTPUT_DIR:string = "./built"  

  public constructor() {

  }

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
      compositeArgs.push(img)

      if (false) compositeArgs.push(`-resize ${null}`)
      
      compositeArgs.push(`-repage ${templateOffsets[options.templateLayout][imgIndex]}`)            
      compositeArgs.push('\\)')
    });

    compositeArgs.push('-layers', 'flatten')
    compositeArgs.push(this.TMP_FILE)

    exec('convert ' + compositeArgs.join(' '), (err, stdout, stderr) => { 
      if (err) return cb(null, ErrorHandler.createError("1",err))
      this.compose(this.TMP_FILE, options.overlayImg, cb)
    });

  }

  public compose(img: string = '', overlayImg: string = '', cb: (stdout?: object, e?: Error) => void): void {
    let compositeArgs = `${img} ${overlayImg} -compose over -composite ${this.OUTPUT_DIR}/result.png`

    exec('convert ' + compositeArgs, (err, stdout, stderr) => { 
      if (err) {
        return cb(null, ErrorHandler.createError("1",err))
      } else {
        return cb({ "result" : this.OUTPUT_DIR + "/result.png" });
      }      
    });    
  }

}

//const compositor = new ImageCompositor()
//compositor.composite({ ['built/01.jpg', 'built/02.jpg', 'built/03.jpg'], TemplateLayout.THREE_UNIFORM, 'built/christmas_01_overlay_base_03.png' })

export { ImageCompositor, TemplateLayout }
