import { ErrorHandler } from './errorhandler';
import { logger } from './logger';
import config from '../config.json'
const os = require('os')

var config_dir = os.homedir() + "/" + config.config_dir;
var photos_dir = config_dir + "/" + config.photos_sub_dir;

var exec = require('child_process').exec
var execSync = require('child_process').execSync
var spawnSync = require('child_process').spawnSync

interface PrinterOptions {
    img: string;
    numberOfCopies: number;
}

class Printer {
    private readonly PRINTER:string = process.env.PHOTOBOOTH_PRINTER_MOCK == '1' ? 'PDF' : config.printer_name
    private readonly PHOTOS_DIR:string = photos_dir;

  public constructor() {
    // if no printer is available then mock the printer by using the CUPS PDF printer
    if (process.env.PHOTOBOOTH_PRINTER_MOCK == '1')
      this.initializeMockPrinter()
        .then(() => {
        })
        .catch((err) => {  
        })
  }

  public isHealthy(): boolean { 
    let lpinfoSpawn = spawnSync('lpinfo', ['-v']);
    let grepSpawnCode = spawnSync('grep', ['-i', 'direct gutenprint'], { input: lpinfoSpawn.stdout }).status;
    let printerStatusSpawnCode = spawnSync('lpstat', ['-p', this.PRINTER]).status;

    if (!(process.env.PHOTOBOOTH_PRINTER_MOCK == '1') && (grepSpawnCode !== 0 || printerStatusSpawnCode !== 0) ) {
      return false;
    } else {
      return true;
    }   
  }

  public getPrinterInfo(): object { 
    let gutenprintStatusSpawn = spawnSync('/usr/lib/cups/backend/gutenprint52+usb', ['-s'], {env: {BACKEND: 'dnpds40'}});
    let gutenprintStatusMessageGrepSpawn = spawnSync('grep', ['-oP', 'Printer Status: \\K.*(?= \\(.*\\))'], { input: gutenprintStatusSpawn.stderr }).stdout;
    let gutenprintStatusCodeGrepSpawn = spawnSync('grep', ['-oP', 'Printer Status:.*\\(\\K.*(?=\\))'], { input: gutenprintStatusSpawn.stderr }).stdout;
    
    let gutenprintMediaTotalGrepSpawn = spawnSync('grep', ['-oP', 'Native Prints Available on New Media: \\K.*'], { input: gutenprintStatusSpawn.stderr }).stdout;
    let gutenprintMediaRemainingGrepSpawn = spawnSync('grep', ['-oP', 'Native Prints Remaining on Media: \\K.*'], { input: gutenprintStatusSpawn.stderr }).stdout;

    let mediaTotal: number = Number(gutenprintMediaTotalGrepSpawn.toString().trim())
    let mediaRemaining: number = Number(gutenprintMediaRemainingGrepSpawn.toString().trim())
    let mediaRemainingPercentage: number = 0;

    if (!isNaN(mediaTotal) && !isNaN(mediaRemaining))
      mediaRemainingPercentage = mediaRemaining / mediaTotal * 100;

    return { 
      statusMessage: gutenprintStatusMessageGrepSpawn.toString().trim(),
      statusCode: gutenprintStatusCodeGrepSpawn.toString().trim(),
      mediaTotal: mediaTotal,
      mediaRemaining: mediaRemaining,
      mediaRemainingPercentage: mediaRemainingPercentage
    };

  }

  private initializeMockPrinter() {
    let printerArgs = [
        '-p', 'PDF',
        '-o', 'w288h432',
        '-o', 'StpColorCorrection=Raw',
        '-o', 'StpColorPrecision=Best',
        '-o', 'StpImageType=Photo',
        '-o', 'printer-is-shared=false',
        '-E',            
        '-v', 'cups-pdf:/'
    ]

    return new Promise((resolve, reject) => {
        exec('lpadmin' + printerArgs.join(' '), (err, stdout, stderr) => {
            if (err) return reject(ErrorHandler.createError("1",err))

            logger.log('info', 'Initialized printer %s', this.PRINTER);
            return resolve()
        }); 
    })
  }

  public print(options: PrinterOptions, cb: (stdout?: object, e?: Error) => void): void {
    if (options.numberOfCopies < 1) {
      logger.log('info', 'Skipping image printing, since 0 copies have been requested');  
      return cb({ "status" : "success" });
    }

    let printer = this.PRINTER;

    let printArgs = `-d ${printer} -n ${options.numberOfCopies} ${this.PHOTOS_DIR}/${options.img}`
    logger.log('info', 'Printing image %s with printer', options.img, printer);      
    logger.log('info', 'lp ' + printArgs)

    // TODO: stderr is logged but is always empty, even if the printer fails. Is err maybe the right one?
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