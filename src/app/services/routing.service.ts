import { Injectable } from '@angular/core';
import { Anim1 } from '../models/anim1.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Machine, interpret, AnyEventObject } from 'xstate';
import { LedService } from './led.service';
import { PhotoService } from './photo.service';
import { LoggerService } from './logger.service'
import { PrinterService } from './printer.service';
import config from '../../../config.json'
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  THEME_MAP: Record<string, any> = {};
  currentTheme;

  constructor(
    public router: Router,
    private ledService: LedService,
    private photoService: PhotoService,
    private printService: PrinterService,
    private loggerService: LoggerService,
    private http: HttpClient
  ) {
    this.createThemes();
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
  
  async getComponentData() {
    let counter:number = 0
    while (!this.currentTheme && counter < 50) {
      console.log("Loading theme profile. Please wait...");
      await this.wait(100);
      counter++;
    }

    const metadata: any = Object.values(this.currentTheme.state.meta).shift();
    return metadata.assets;
  }
  
  fetchProfile(): Observable<any> {
    return this.http.get("/api/theme");
  }

  createThemes() {
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
          triggerLed: (context, event) => {
            this.ledService.triggerLed({
                "direction": "RIGHT",
                "color": "rgb(0, 0, 50)",
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
          },                
          setCapturedPhoto: (context, event) => {
            // handle success
            const capturedPhotoPath = event.data.data.result.imagePath;
            context.photoPath = 'api/photos/' + capturedPhotoPath;
            context.exifOrientation = event.data.data.result.exifOrientation;
            context.capturedPhotoPaths.push(capturedPhotoPath);         
          },
          popCapturedPhotos: (context, event) => {
            context.capturedPhotoPaths.pop();
          },
          clearCapturedPhotos: (context, event) => {
            // handle success
            const capturedPhotoPath = event.data.data.result;
            context.photoPath = capturedPhotoPath;
            context.exifOrientation = 1;
            context.capturedPhotoPaths = [];     
          }        
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
              logoImageOffset: context.compositeConfig.logoImageOffset
          }),
          printPhoto: (context, event) => this.printService.printPhoto({
            img: 'printable_result.png',
            numberOfCopies: event.numberOfCopies
          })
        }
      });
  
      const stateService = interpret(extendedStateMachine).start();
      this.currentTheme = stateService;
    });

  }
}
