var exec = require('child_process').exec

enum TemplateLayout {
  TWO_UNIFORM = "TWO_UNIFORM",
  THREE_UNIFORM = "THREE_UNIFORM",
  THREE_NON_UNIFORM = "THREE_NON_UNIFORM"
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

  public execute(imgSrcList: string[] = [], templateLayout: TemplateLayout, overlayImg: string = ''): void {
    if (imgSrcList.length == 0)
      throw new Error("There are no images to composite into print template.")
    if (overlayImg == '')
      throw new Error("No path for overlay image to be composed was specified.")

    let compositeArgs = [
    '-size', `${this.IMAGE_HEIGHT}x${this.IMAGE_WIDTH}`,
    'xc:none'
    ]

    imgSrcList.forEach( (img, imgIndex)  => {
      compositeArgs.push('\\(')
      compositeArgs.push(img)

      if (false) compositeArgs.push(`-resize ${null}`)
      
      compositeArgs.push(`-repage ${templateOffsets[templateLayout][imgIndex]}`)            
      compositeArgs.push('\\)')
    });

    compositeArgs.push('-layers', 'flatten')
    compositeArgs.push(this.TMP_FILE)

    /*
    var command = [
      'convert',
      '-size', '1795x1205',
      'xc:none',
      '\\(','built/01.jpg', '-resize 100', '-repage', '+50+245', '\\)',
      '\\(','built/02.jpg','-repage', '+623+245', '\\)',
      '\\(','built/03.jpg','-repage', '+1218+245', '\\)',
      '-layers', 'flatten',
      'built/photos.png'  // output
      ];
    */
    console.log('convert ' + compositeArgs.join(' '))

    exec('convert ' + compositeArgs.join(' '), (err, stdout, stderr) => { 
      if (err) throw err
      this.compose(this.TMP_FILE, overlayImg)
    });

    return;
  }

  public compose(img: string = '', overlayImg: string = ''): void {
    if (img == '')
      throw new Error("No path for image to be composed was specified.")
    if (overlayImg == '')
      throw new Error("No path for overlay image to be composed was specified.")

    //convert built/photos.png built/christmas_01_overlay_base_03.png -compose over -composite ./built/result.png

    let compositeArgs = `${img} ${overlayImg} -compose over -composite ${this.OUTPUT_DIR}/result.png`
    console.log('convert ' + compositeArgs)

    exec('convert ' + compositeArgs, function(err, stdout, stderr) { 
      if (err) throw err
    });

    return;
  }

}

//const compositor = new ImageCompositor()
//compositor.execute(['built/01.jpg', 'built/02.jpg', 'built/03.jpg'], TemplateLayout.THREE_UNIFORM, 'built/christmas_01_overlay_base_03.png')

export { ImageCompositor, TemplateLayout }
