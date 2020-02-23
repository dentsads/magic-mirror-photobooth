import { Injectable } from '@angular/core';
import { Anim1 } from '../models/anim1.model';
import { Router } from '@angular/router';
import { Machine, interpret, AnyEventObject } from 'xstate';
import { LedService } from './led.service';
import { PhotoService } from './photo.service';
import { LoggerService } from './logger.service'
import { PrinterService } from './printer.service';
import config from '../../../config.json'

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  THEME_MAP: Record<string, any> = {};
  currentThemeId = 'WEDDING';
  currentTheme;

  constructor(
    public router: Router,
    private ledService: LedService,
    private photoService: PhotoService,
    private printService: PrinterService,
    private loggerService: LoggerService
  ) {
    this.createThemes();
    this.currentTheme = this.THEME_MAP[this.currentThemeId];
  }

  ANIM1_MAP: Record<string, Anim1> = {
    1: { assetPath: 'api/assets/wedding_01_touchtostart_02.mp4'},
    2: { assetPath: 'api/assets/are_you_ready.gif' },
    3: { assetPath: 'api/assets/general_01_countdown_03.mp4' },
    4: { assetPath: 'api/assets/say_cheese.gif' },
    5: { assetPath: 'api/assets/general_01_lookatcamera_01.mp4' },
    6: { assetPath: 'api/assets/wedding_01_loveinair_01.mp4' },
    7: { assetPath: 'api/assets/photos_are_ready.gif' }
  };

  handleEvent(eventId: string, options?: any): void {
    this.currentTheme.send(eventId, options);
  }

  getComponentData() {
    const metadata: any = Object.values(this.currentTheme.state.meta).shift();
    return metadata.assets;
  }

  private animationState(assets: object, path: string, targetState: string, action?: (context: any, event: any) => void): object {
    return {
      entry: ['transition'],
      meta: { "path": path, "assets": assets },
      initial: 'anim_loaded',
      states: {
        anim_loaded: {
          on: {
            'event.anim1.01': {
              target: 'anim_running',
              actions: (context, event) => {
                if (action) action(context, event);
              }
            }           
          }
        },
        anim_running: {
          after: {
            FINISH_ANIM: targetState
          }
        }
      }
    };
  }

  createThemes() {    
    const stateMachine = Machine(
      {
        id: 'root',
        initial: 'drawing',
        context: {
          capturedPhotoPaths: [],
          exifOrientation: 1,
          photoPath: '',
          maxNumberOfPhotos: config.maxNumberOfPhotos
        },
        states: {
          intro: {
            entry: ['transition'],
            meta: { 
              path: '/intro', 
              assets: {
                assetPath: this.ANIM1_MAP[1].assetPath,
                website: config.website
              }
            },
            on: {
              'event.intro.01': {
                target: 'countdown'
              }
            }
          },
          countdown: this.animationState(this.ANIM1_MAP[3], '/anim1/3', '#root.clearLed', (context, event) => {
            this.ledService.triggerLed({
              direction: 'RIGHT',
              color: 'rgb(0, 0, 50)',
              duration: event.delay || 0,
              loops: 1
            })
            .then((response) => {
              // handle success
              this.loggerService.log('info', response)              
            })
            .catch((error) => {              
              // handle error
              this.loggerService.log('error', error)
            });
          }),
          clearLed: {
            invoke: {
              id: 'clear',
              src: (context, event) => this.ledService.clearLed(),
              onDone: {
                target: 'capturePhoto',
                actions: (context, event) => {
                  // handle success
                  this.loggerService.log('info', 'Clearing LED strip')     
                }
              },
              onError: {
                /* 
                  despite the error navigate to capturePhoto,
                  since it is better to not disturbe the workflow
                  than to interrupt because of an LED error
                */
                target: 'capturePhoto',
                actions: (_, event) => {
                  // handle error
                  this.loggerService.log('error', event.data.response.data)
                }
              }              
            }
          },
          capturePhoto: {
            invoke: {
              id: 'capture',
              src: (context, event) => this.photoService.capturePhoto(),
              onDone: {
                target: 'acceptPhoto',
                actions: (context, event) => {
                  // handle success
                  const capturedPhotoPath = event.data.data.result.imagePath;
                  context.photoPath = 'api/photos/' + capturedPhotoPath;
                  context.exifOrientation = event.data.data.result.exifOrientation;
                  context.capturedPhotoPaths.push(capturedPhotoPath);         
                }
              },
              onError: {
                target: 'errorPage',
                actions: (_, event) => {
                  // handle error
                  this.loggerService.log('error', event.data.response.data)
                }
              }              
            }
          },
          acceptPhoto:  {
            entry: ['updateMetaAssetsWithContext', 'transition'],
            meta: { 
              path: '/accept-photo', 
              assets: { 
                assetButtonOkPath: 'api/assets/check-circle-solid-240.png', 
                assetButtonNokPath: 'api/assets/x-circle-solid-240.png'
              } 
            },
            on: {
              'event.accept-photo.01': [
                // If number of required photos not reached, then repeat photo capture
                { target: 'drawing', cond: 'targetNumberOfPhotosReached' },
                { target: 'countdown'}
              ], // photo ok
              'event.accept-photo.02': {
                target: 'countdown',
                actions: (context, event) => {
                  context.capturedPhotoPaths.pop();
                }
              } // photo not ok
            }
          },
          drawing:  {
            entry: ['transition'],
            meta: { 
              path: '/drawing', 
              assets: { 
                assetButtonClear: 'api/assets/undo-regular-240.png', 
                assetButtonOk: 'api/assets/check-circle-regular-240.png',
                assetButtonColor: 'api/assets/color-fill-solid-240.png'
              } 
            },
            on: {
              'event.drawing-tool.01': 'compositePhoto' // photos will be printed
            }
          },
          compositePhoto: {
            entry: ['transition'],
            meta: { path: '/anim1/6', assets: this.ANIM1_MAP[6] },
            invoke: {
              id: 'composite',
              src: (context, event) => this.photoService.compositePhoto({
                templateLayout: 'THREE_UNIFORM',
                imgSrcList: context.capturedPhotoPaths,
                drawingImageDataURL: event.imageDataURL,
                overlayImage: 'christmas_01_overlay_base_03.png',
                logoImage: 'logo.png',
                logoImageOffset: '+10+200'
              }),
              onDone: {
                target: 'acceptCompositedPhoto',
                actions: (context, event) => {
                  // handle success
                  const capturedPhotoPath = event.data.data.result;
                  context.photoPath = capturedPhotoPath;
                  context.exifOrientation = 1;
                  context.capturedPhotoPaths = [];     
                }
              },
              onError: {
                target: 'errorPage',
                actions: (_, event) => {
                  // handle error
                  this.loggerService.log('error', event.data.response.data)
                }
              }
            }
          },
          acceptCompositedPhoto:  {
            entry: ['transition', 'updateMetaAssetsWithContext'],
            meta: { 
              path: '/accept-photo', 
              assets: { 
                assetButtonOkPath: 'api/assets/check-circle-solid-240.png', 
                assetButtonNokPath: 'api/assets/x-circle-solid-240.png'                
              } 
            },
            on: {
              'event.accept-photo.01': 'selectPrintPhotos', // photo ok
              'event.accept-photo.02': 'countdown'  // photo not ok
            }
          },
          selectPrintPhotos:  {
            entry: ['transition'],
            meta: { 
              path: '/select-print-photos', 
              assets: { 
                assetButtonPlus: 'api/assets/plus-circle-regular-240.png', 
                assetButtonMinus: 'api/assets/minus-circle-regular-240.png',
                assetButtonPrinter: 'api/assets/printer-regular-240.png',
              } 
            },
            on: {
              'event.select-print-photos.01': 'printPhoto' // photos will be printed
            }
          },
          printPhoto: {
            invoke: {
              id: 'print',
              src: (context, event) => this.printService.printPhoto({
                img: 'result.png',
                numberOfCopies: event.numberOfCopies
              }),
              onDone: {
                target: 'intro',
                actions: (context, event) => {
                  // handle error
                  this.loggerService.log('info', event.data.data.status)       
                }
              },
              onError: {
                target: 'errorPage',
                actions: (_, event) => {
                  // handle error
                  this.loggerService.log('error', event.data.response.data)
                }
              }              
            }
          },
          errorPage: {
            entry: ['transition'],
            meta: { 
              path: '/error',
              assets: { 
                assetButtonHome: 'api/assets/home-solid-240.png',
                phoneNumber: config.phone_number             
              } 
            },
            on: {
              'event.error-page.01': 'intro'
            }
          },      
        }
      });

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
      }
    });

    const stateService = interpret(extendedStateMachine).start();

    this.THEME_MAP.WEDDING = stateService;
  }
}
