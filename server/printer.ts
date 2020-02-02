import { ErrorHandler } from './errorhandler';
import { logger } from './logger';
var exec = require('child_process').exec
var spawnSync = require('child_process').spawnSync

interface PrinterOptions {
    img: string;
    numberOfCopies: number;
}

class Printer {
    private readonly PRINTER:string = "DP-DS620"
    private readonly PAGE_SIZE:string = "w288h432"
    private readonly MODEL:string = "gutenprint.5.3://dnp-ds620/expert"
    private readonly DEVICE:string = "gutenprint53+usb://dnp-ds620/DS6C98031738"
    private readonly PHOTOS_DIR:string = '../magic-mirror-photobooth-photos/'

  public constructor() {
     this.initializePrinter()
    .then(() => {
    })
    .catch((err) => {  
    })
  }

  public isHealthy(): boolean {
    let code = spawnSync('lpstat', ['-p', this.PRINTER]).status; 

    if (!process.env.PHOTOBOOTH_PRINTER_MOCK && code !== 0) {
      return false;
    } else {
      return true;
    }   
  }

  private initializePrinter() {
    let printerArgs = []

    // if no printer is available then mock the printer by using the CUPS PDF printer
    if (process.env.PHOTOBOOTH_PRINTER_MOCK) {
        logger.log('info', 'Printer mocking is enabled through env PHOTOBOOTH_PRINTER_MOCK=1');
        printerArgs = [
            '-p', 'PDF',
            '-o', this.PAGE_SIZE,
            '-o', 'StpColorCorrection=Raw',
            '-o', 'StpColorPrecision=Best',
            '-o', 'StpImageType=Photo',
            '-o', 'printer-is-shared=false',
            '-E',            
            '-v', 'cups-pdf:/'
        ]
    } else {
        printerArgs = [
            '-p', this.PRINTER,
            '-o', this.PAGE_SIZE,
            '-o', 'StpColorCorrection=Raw',
            '-o', 'StpColorPrecision=Best',
            '-o', 'StpImageType=Photo',
            '-o', 'printer-is-shared=false',
            '-E',
            '-m', this.MODEL,
            '-v', this.DEVICE
        ]
    }
    
    return new Promise((resolve, reject) => {
        exec('lpadmin' + printerArgs.join(' '), (err, stdout, stderr) => {
            if (err) return reject(ErrorHandler.createError("1",err))

            logger.log('info', 'Initialized printer %s', this.PRINTER);
            return resolve()
        }); 
    })
  }

  public print(options: PrinterOptions, cb: (stdout?: object, e?: Error) => void): void {
    let printer = process.env.PHOTOBOOTH_PRINTER_MOCK ? 'PDF' : this.PRINTER

    let printArgs = `-d ${printer} -n ${options.numberOfCopies} ${this.PHOTOS_DIR}${options.img}`
    logger.log('info', 'Printing image %s with printer', options.img, printer);      
    logger.log('info', 'lp ' + printArgs)

    exec('lp ' + printArgs, (err, stdout, stderr) => {
      logger.log('info', '%s', stdout);
      logger.log('error', '%s', stderr);
      if (err) {
        return cb(null, ErrorHandler.createError("55",err))
      } else {
        logger.log('info', 'Successfully printed image %s with printer %s', options.img, printer);  
        return cb({ "status" : "success" });
      }      
    });
  }

}
  
export { Printer, PrinterOptions }