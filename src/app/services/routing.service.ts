import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Machine, interpret, AnyEventObject } from 'xstate';
import { LedService } from './led.service';
import { PhotoService } from './photo.service';
import { LoggerService } from './logger.service'
import { PrinterService } from './printer.service';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  THEME_MAP: Record<string, any> = {};
  allowNextTransitionButton: Subject<boolean> = new Subject<boolean>();
  currentTheme;

  constructor(
    public router: Router,
    private ledService: LedService,
    private photoService: PhotoService,
    private printService: PrinterService,
    private loggerService: LoggerService,
    private http: HttpClient
  ) {
    this.createTheme();
  }

  handleEvent(eventId: string, options?: any): void {
    this.currentTheme.send(eventId, options);
  }

  sleep(ms): Promise<any> {
    return new Promise((resolve): any => setTimeout(resolve, ms))
  }
  
  async wait(ms): Promise<any> {
    await this.sleep(ms)
  }
  
  async getComponentMetadata() {
    let counter:number = 0
    while (!this.currentTheme && counter < 50) {
      console.log("Loading theme profile. Please wait...");
      await this.wait(100);
      counter++;
    }

    const metadata: any = Object.values(this.currentTheme.state.meta).shift();
    return metadata;
  }
  
  fetchProfile(): Observable<any> {
    return this.http.get("/api/theme");
  }

  createTheme() {
    this.fetchProfile().subscribe(data => {
      let profile = data;    
      const stateMachine = Machine(profile);
  
      const extendedStateMachine = stateMachine.withConfig(
      {
        actions: {
          transition: (context, event, meta) => {
            this.loggerService.log('info', 'Transitioning to: ' + JSON.stringify(meta.state.value))    
            const metadata: any = Object.values(meta.state.meta).shift();
  
            this.router.navigate([metadata.path]);
          },
          updateMetaAssetsWithContext: (context, event, meta) => {
            meta.state.meta[Object.keys(meta.state.meta).shift()].assets.context = context;
          },
          logError: (_, event) => {
            // handle error
            this.loggerService.log('error', event.data.response.data)
          },
          logStatus: (context, event) => {
            this.loggerService.log('info', event.data.data.status)       
          },
          logClearLed: (context, event) => {
            // handle success
            this.loggerService.log('info', 'Clearing LED strip')     
          },
          printPhoto: (context, event) => {
            this.printService.printPhoto({
              img: 'printable_result.png',
              numberOfCopies: event.numberOfCopies == undefined ? 1 : event.numberOfCopies
            })
          },
          triggerLed: (context, event) => {
            if (context.triggerLedConfig && context.triggerLedConfig.animationType && context.triggerLedConfig.animationType == 'ball') {
              this.ledService.triggerLed("ball", {
                "direction": context.triggerLedConfig.direction || "RIGHT",
                "color": context.triggerLedConfig.color || "rgb(0, 0, 150)",
                "duration": event.delay || 0,
                "loops": context.triggerLedConfig.loops || 1
              })
              .then((response) => {
                  // handle success
                  this.loggerService.log("info", response)              
              })
              .catch((error) => {              
                  // handle error
                  this.loggerService.log("error", error)
              });
            } else if (context.triggerLedConfig && context.triggerLedConfig.animationType && context.triggerLedConfig.animationType == 'barrel') {
              this.ledService.triggerLed("barrel", {
                "direction": context.triggerLedConfig.direction,
                "color": context.triggerLedConfig.color,
                "duration": event.delay || 0,
                "shiftDelay": context.triggerLedConfig.shiftDelay || 500
              })
              .then((response) => {
                  // handle success
                  this.loggerService.log("info", response)              
              })
              .catch((error) => {              
                  // handle error
                  this.loggerService.log("error", error)
              });
            } else {
              this.ledService.triggerLed("ball", {
                "direction": "RIGHT",
                "color": "rgb(0, 0, 150)",
                "duration": event.delay || 0,
                "loops": 1
              })
              .then((response) => {
                  // handle success
                  this.loggerService.log("info", response)              
              })
              .catch((error) => {              
                  // handle error
                  this.loggerService.log("error", error)
              });
            }
          },                
          setCapturedPhoto: (context, event) => {
            // handle success
            const capturedPhotoFile = event.data.data.result.imagePath;
            context.capturedPhotoFile = capturedPhotoFile;
            context.photoPath = 'api/photos/' + config.event_id + '/' + capturedPhotoFile;
            context.exifOrientation = event.data.data.result.exifOrientation;
            context.capturedPhotoPaths.push(capturedPhotoFile);         
          },
          popCapturedPhotos: (context, event) => {
            context.capturedPhotoPaths.pop();
          },
          clearCapturedPhotos: (context, event) => {
            // handle success            
            const capturedPhotoPath = event.data.data.result.imagePath;
            const eventId = event.data.data.result.eventId;
            context.uuidFileName = capturedPhotoPath;
            context.photoPath = 'api/photos/' + eventId + '/' + capturedPhotoPath;
            context.exifOrientation = 1;
            context.capturedPhotoPaths = [];     
          },
          compositeIndividualPhoto: (context, event) => this.photoService.compositeIndividualPhoto({
            imgSrc: context.capturedPhotoFile,
            imageDataURL: event.imageDataURL            
          })        
        },
        delays: {
          FINISH_ANIM: (context, event: AnyEventObject) => {
            this.loggerService.log('info', 'Animation delay is ' + JSON.stringify(event))   
            return event.delay || 0;
          }
        },
        guards: {
          targetNumberOfPhotosReached: (context, event) => {
            return context.capturedPhotoPaths.length >= context.maxNumberOfPhotos;
          },
          dontSkipSelectPrintPhotos: (context, event) => {
            return context.maxNumberOfPrints > 1;
          }
        },
        services: {
          clearLed: (context, event) => this.ledService.clearLed(),
          capturePhoto: (context, event) => this.photoService.capturePhoto(),
          compositePhoto: (context, event) => this.photoService.compositePhoto({
              templateLayout: context.compositeConfig.templateLayout,
              imgSrcList: context.capturedPhotoPaths,
              drawingImageDataURL: event.imageDataURL,
              overlayImage: context.compositeConfig.overlayImage,
              logoImage: context.compositeConfig.logoImage,
              logoImageSize: context.compositeConfig.logoImageSize,
              logoImageOffset: context.compositeConfig.logoImageOffset,
              logoRotation: context.compositeConfig.logoRotation,
              overlayText: context.compositeConfig.overlayText,
              overlayTextSize: context.compositeConfig.overlayTextSize,
              overlayTextOffset: context.compositeConfig.overlayTextOffset
          }),
          compositePrintableResultPhoto: (context, event) => this.photoService.compositePrintableResultPhoto({
            uuidFileName: context.uuidFileName
          }),       
          printPhoto: (context, event) => this.printService.printPhoto({
            img: 'printable_result.png',
            numberOfCopies: event.numberOfCopies == undefined ? 1 : event.numberOfCopies
          })
        }
      });
  
      const stateService = interpret(extendedStateMachine).start();
      this.currentTheme = stateService;
    });

  }
}
