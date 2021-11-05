import { ErrorHandler } from './errorhandler';
import { logger } from './logger';
import config from '../config.json'
const os = require('os')

var config_dir = process.env.PHOTOBOOTH_BASE_PATH || os.homedir() + "/" + config.config_dir;
var photos_dir = config_dir + "/" + config.photos_sub_dir;

var exec = require('child_process').exec
var spawnSync = require('child_process').spawnSync
var spawn = require('child_process').spawn

const printerStatusCodesḾessages: Record<number, string> = {
  "0": "", /*Idle*/
  "1": "", /*Printing*/
  "500": "Der Druckerkopf wirkd gekühlt.", /*Cooling Print Head*/
  "510": "Der Papiermotor wird gekühlt.", /*Cooling Paper Motor*/
  "900": "Der Drucker scheint sich im Standby Modus zu befinden.", /*Standby Mode*/
  "1000": "Die Druckertür scheint geöffnet zu sein.", /*Cover Open*/
  "1010": "Die Schnippselbox scheint am Drucker zu fehlen.", /*No Scrap Box*/
  "1100": "Die Papierrolle ist nicht richtig eingelegt, oder das Papier ist aufgebraucht.", /*Paper End*/
  "1200": "Das Farbband ist nicht richtig eingelegt, oder das Farbband ist aufgebraucht.", /*Ribbon End*/
  "1300": "Die Papierrolle scheint einen Papierstau ausgelöst zu haben.", /*Paper Jam*/
  "1400": "Es scheint ein unspezfisches Problem mit dem Farbband zu geben.", /*Ribbon Error*/
  "1500": "Es scheint ein unspezfisches Problem mit der Papierrolle zu geben.", /*Paper Definition Error*/
  "1600": "Es scheint ein unspezfisches Datenproblem zu geben.", /*Data Error*/
  "2000": "Es scheint ein Stromproblem mit dem Druckerkopf zu geben.", /*Head Voltage Error*/
  "2010": "Es scheint ein Stromproblem mit dem Druckerkopf zu geben.", /*USB Power Supply Error*/
  "2100": "Es scheint ein Problem mit der Position des Druckerkopfs zu geben.", /*Head Position Error*/
  "2200": "Es scheint ein Problem mit dem Ventilator des eingebauten Netzteils zu geben.", /*Power Supply Fan Error*/
  "2300": "Es scheint ein Problem mit dem Papierschneider zu geben.", /*Cutter Error*/
  "2400": "", /*Pinch Roller Error*/
  "2500": "Es scheint ein Temperaturproblem am Druckerkopf zu geben.", /*Abnormal Head Temperature*/
  "2600": "Es scheint ein Temperaturproblem am Papier zu geben.", /*Abnormal Media Temperature*/
  "2610": "Es scheint ein Temperaturproblem am Papiermotor zu geben.", /*Abnormal Paper Motor Temperature*/
  "2700": "Es scheint ein Problem mit der Spannung des Farbbands zu geben. Entweder die Spannung ist zu groß, oder zu gering.", /*Ribbon Tension Error*/
  "2800": "Es scheint ein RF-ID Modulproblem zu geben.", /*RF-ID Module Error*/
  "3000": "Es scheint ein unspezfisches Systemproblem zu geben." /*System Error*/
};

interface PrinterOptions {
    img: string;
    numberOfCopies: number;
}

class Printer {
    private readonly PRINTER:string = process.env.PHOTOBOOTH_PRINTER_MOCK == '1' ? 'PDF' : config.printer_name
    private readonly PHOTOS_DIR:string = photos_dir;

  public constructor() {
    // if no printer is available then mock the printer by using the CUPS PDF printer
    if (process.env.PHOTOBOOTH_PRINTER_MOCK == '1') {
      this.initializeMockPrinter()
        .then(() => {
        })
        .catch((err) => {  
        });
    } else {
      this.initializePrinter((out, err) => {
        if (err) {
          logger.log('error', err);          
        } else {
          logger.log('info', out);
        }          
      });
    }      
  }

  public isHealthy(): boolean {
    /*
    let gutenprintStatusSpawn = spawnSync('/usr/lib/cups/backend/gutenprint53+usb', ['-s'], {env: {BACKEND: 'dnpds40'}});
    let gutenprintStatusCodeGrepSpawn = spawnSync('grep', ['-oP', 'Printer Status:.*\\(\\K.*(?=\\))'], { input: gutenprintStatusSpawn.stderr }).stdout;
    let statusCode: string = gutenprintStatusCodeGrepSpawn.toString().trim();
    let isPrinterUp = statusCode === "0" || statusCode === "1";
    */

    let lpinfoSpawn = spawnSync('lpinfo', ['-v']);
    let grepSpawnCode = spawnSync('grep', ['-i', 'direct gutenprint53'], { input: lpinfoSpawn.stdout }).status;
    let printerStatusSpawnCode = spawnSync('lpstat', ['-p', this.PRINTER]).status;

    if (!(process.env.PHOTOBOOTH_PRINTER_MOCK == '1') && (grepSpawnCode !== 0 || printerStatusSpawnCode !== 0) ) {
      return false;
    } else {
      return true;
    }   
  }

  private isPrinterInitialized(cb: (status?: boolean) => void): void {
    let lpinfoSpawn = spawn('lpinfo', ['-v']);
    let grepSpawn = spawn('grep', ['-i', 'direct gutenprint53']);

    lpinfoSpawn.stdout.pipe(grepSpawn.stdin);

    let printerStatusSpawnCode = spawnSync('lpstat', ['-p', this.PRINTER]).status;
    
    grepSpawn.on('close', (grepSpawnCode) => {
      if ( grepSpawnCode !== 0 || printerStatusSpawnCode !== 0 ) {
        logger.log('info', 'Printer %s is not initialized', this.PRINTER);
        cb(false);
      } else {
        logger.log('info', 'Printer %s is initialized', this.PRINTER);
        cb(true);
      }
    });
  }

  public getPrinterInfo(): object { 
    let gutenprintStatusSpawn = spawnSync('/usr/lib/cups/backend/gutenprint53+usb', ['-s'], {env: {BACKEND: 'dnpds40'}});
    let gutenprintStatusMessageGrepSpawn = spawnSync('grep', ['-oP', 'Printer Status: \\K.*(?= \\(.*\\))'], { input: gutenprintStatusSpawn.stderr }).stdout;
    let gutenprintStatusCodeGrepSpawn = spawnSync('grep', ['-oP', 'Printer Status:.*\\(\\K.*(?=\\))'], { input: gutenprintStatusSpawn.stderr }).stdout;
    
    let gutenprintMediaTotalGrepSpawn = spawnSync('grep', ['-oP', 'Native Prints Available on New Media: \\K.*'], { input: gutenprintStatusSpawn.stderr }).stdout;
    let gutenprintMediaRemainingGrepSpawn = spawnSync('grep', ['-oP', 'Native Prints Remaining on Media: \\K.*'], { input: gutenprintStatusSpawn.stderr }).stdout;

    let mediaTotal: number = Number(gutenprintMediaTotalGrepSpawn.toString().trim());
    let mediaRemaining: number = Number(gutenprintMediaRemainingGrepSpawn.toString().trim());
    let mediaRemainingPercentage: number = 0;

    let statusMessage: string = gutenprintStatusMessageGrepSpawn.toString().trim();
    let statusCode: string = gutenprintStatusCodeGrepSpawn.toString().trim();

    if (!isNaN(mediaTotal) && !isNaN(mediaRemaining))
      mediaRemainingPercentage = mediaRemaining / mediaTotal * 100;

    return { 
      statusMessage: statusMessage,
      statusCode: statusCode,
      statusAlertMessage: statusCode === "" ? "Der Drucker scheint nicht angeschlossen zu sein. Vielleicht ist es ein Stromkabel- oder USB-Problem." : printerStatusCodesḾessages[statusCode],
      mediaTotal: mediaTotal,
      mediaRemaining: mediaRemaining,
      mediaRemainingPercentage: mediaRemainingPercentage,
      isPrinterUp: statusCode === "0" || statusCode === "1"
    };

  }

  private initializeMockPrinter(): Promise<void> {
    let printerArgs = [
        '-p', 'PDF',
        '-o', 'PageSize=w288h432',
        '-o', 'StpColorCorrection=Raw',
        '-o', 'StpColorPrecision=Best',
        '-o', 'StpImageType=Photo',
        '-o', 'printer-is-shared=false',
        '-E',            
        '-v', 'cups-pdf:/'
    ]

    return new Promise<void>((resolve, reject) => {
        exec('lpadmin ' + printerArgs.join(' '), (err, stdout, stderr) => {
            if (err) return reject(ErrorHandler.createError("1",err))

            logger.log('info', 'Initialized printer %s', this.PRINTER);
            return resolve()
        }); 
    })
  }

  private initializePrinter(cb: (stdout?: object, e?: Error) => void): void {
    /*
    lpadmin \
    -p $PRINTER_NAME \
    -o PageSize=w288h432 \
    -o StpColorCorrection=Raw \
    -o StpColorPrecision=Best \
    -o StpImageType=Photo \
    -o 'printer-is-shared=false' \
    -E \
    -m "$(lpinfo -m | grep -i $PRINTER_NAME | awk '{print $1}' | tail -1)" \
    -v "$(lpinfo -v | grep -i "direct gutenprint53" | tail -1 | awk '{print $2}')"
    */

    let deviceLpinfoSpawn = spawn('lpinfo', ['-v']);
    let deviceGrepSpawn = spawn('grep', ['-i', 'direct gutenprint53']);   
    let deviceTailSpawn = spawn('tail', ['-1']);
    let deviceAwkSpawn = spawn('awk', ['{print $2}']);

    deviceLpinfoSpawn.stdout.pipe(deviceGrepSpawn.stdin);
    deviceGrepSpawn.stdout.pipe(deviceTailSpawn.stdin);
    deviceTailSpawn.stdout.pipe(deviceAwkSpawn.stdin);

    let driverLpinfoSpawn = spawn('lpinfo', ['-m']);
    let driverGrepSpawn = spawn('grep', ['-i', this.PRINTER]);
    let driverAwkSpawn = spawn('awk', ['{print $1}']);
    let driverTailSpawn = spawn('tail', ['-1']);
    
    driverLpinfoSpawn.stdout.pipe(driverGrepSpawn.stdin);
    driverGrepSpawn.stdout.pipe(driverGrepSpawn.stdin);
    driverGrepSpawn.stdout.pipe(driverAwkSpawn.stdin);
    driverAwkSpawn.stdout.pipe(driverTailSpawn.stdin);


    deviceAwkSpawn.stdout.on('data', (deviceAwkSpawnData) => {
      let printDevice = deviceAwkSpawnData.toString().trim();

      driverTailSpawn.stdout.on('data', (driverTailSpawnData) => {
        let printDriver = driverTailSpawnData.toString().trim();
  
        let printerArgs = [
          '-p', this.PRINTER,
          '-o', 'PageSize=w288h432',
          '-o', 'StpColorCorrection=Raw',
          '-o', 'StpColorPrecision=Best',
          '-o', 'StpImageType=Photo',
          '-o', 'printer-is-shared=false',
          '-E',
          '-m', printDriver,
          '-v', printDevice
        ]

        logger.log('info', 'Initializing printer: lpadmin %s',  printerArgs.join(' '));
        exec('lpadmin ' + printerArgs.join(' '), (err, stdout, stderr) => {
            if (err) return cb(null, ErrorHandler.createError("1",err))

            logger.log('info', 'Initialized printer %s', this.PRINTER);
            return cb({ "status" : "success" });
        }); 

      });
    });
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

    this.isPrinterInitialized((status) => {
      if (status == false) {
        logger.log('info', 'Retry to initialize printer %s again', this.PRINTER);
        this.initializePrinter((out, err) => {
          if (err) {
            logger.log('error', err);          
          } else {
            logger.log('info', out);
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
        });
      } else {
        logger.log('info', 'No need to initialize printer %s again', this.PRINTER);

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
    })        

  }

}
  
export { Printer, PrinterOptions }