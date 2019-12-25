import { Injectable } from '@angular/core';
import { Anim1 } from '../models/anim1.model';
import { Router } from '@angular/router';
import { Machine, interpret, AnyEventObject } from 'xstate';
import { LedService } from './led.service';
import { PhotoService } from './photo.service';

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
    private photoService: PhotoService
  ) {
    this.createThemes();
    this.currentTheme = this.THEME_MAP[this.currentThemeId];
  }

  ANIM1_MAP: Record<string, Anim1> = {
    1: { assetPath: 'api/assets/compositions/intro.gif' },
    2: { assetPath: 'api/assets/compositions/are_you_ready.gif' },
    3: { assetPath: 'api/assets/compositions/countdown.gif' },
    4: { assetPath: 'api/assets/compositions/say_cheese.gif' },
    5: { assetPath: 'api/assets/compositions/take_photo.gif' },
    6: { assetPath: 'api/assets/compositions/great_job.gif' },
    7: { assetPath: 'api/assets/compositions/photos_are_ready.gif' }
  };

  handleEvent(eventId: string, options?: any): void {
    this.currentTheme.send(eventId, options);
  }

  getComponentData() {
    const metadata: any = Object.values(this.currentTheme.state.meta).shift();
    return metadata.assets;
  }

  private statAnim(assets: object, path: string, targetState: string, action?:(context: any, event: any) => void): object {
    return {
      entry: ['transition'],
      meta: { path: path, assets: assets },
      initial: 'execute_action',
      states: {
        execute_action: {
          on: {
            '': {
              target: 'anim_loaded',
              actions: (context, event) => { 
                if (action) action(context, event)
              }
            }
          }
        },
        anim_loaded: {
          on: {
            'event.anim1.01': 'anim_running'
          }
        },
        anim_running: {
          after: {
            FINISH_ANIM: targetState
          }
        }
      }
    }
  }

  createThemes() {
    const stateMachine = Machine(
      {
        id: 'root',
        initial: 'intro',
        context: {
          capturedPhotoPaths: [],
          photoPath: "",
          maxNumberOfPhotos: 3,
          currentPhotoCounter: 0
        },
        states: {
          intro: {
            entry: ['transition'],
            meta: { path: '/intro', assets: this.ANIM1_MAP[1] },
            on: {
              'event.intro.01': {
                target: 'countdown'
              }
            }
          },
          countdown: {
            entry: ['transition'],
            meta: { path: '/anim1/3', assets: this.ANIM1_MAP[3] },
            initial: 'trigger_led',
            states: {
              trigger_led: {
                on: {
                  '': {
                    target: 'anim_loaded',
                    actions: (context, event) => { 
                      this.ledService.triggerLed({
                        direction: 'RIGHT',
                        color: 'rgb(0, 0, 50)',
                        duration: 2760,
                        loops: 1
                      })
                      .then(function(response) {
                        // handle success
                        console.log(response);
                      })
                      .catch(function(error) {
                        // handle error
                        console.log(error);
                      });
                    }
                  }
                }
              },
              anim_loaded: {
                on: {
                  'event.anim1.01': 'anim_running'
                }
              },
              anim_running: {
                after: {
                  FINISH_ANIM: '#root.capturePhoto'
                }
              }
            }
          },
          capturePhoto: {
            entry: ['transition'],
            meta: { path: '/anim1/5', assets: this.ANIM1_MAP[5] },
            initial: 'capture_photo',
            states: {
              capture_photo: {
                on: {
                  '': {
                    target: 'anim_loaded',
                    actions: (context, event) => { 
                      this.photoService.capturePhoto()
                      .then(function(response) {
                        // handle success
                        let capturedPhotoPath = response.data.result
                        context.photoPath = 'api/photos/' + capturedPhotoPath
                        context.capturedPhotoPaths.push(capturedPhotoPath)
                        console.log(response);
                      })
                      .catch(function(error) {
                        // handle error
                        console.log(error);
                      });
                    }
                  }
                }
              },
              anim_loaded: {
                on: {
                  'event.anim1.01': 'anim_running'
                }
              },
              anim_running: {
                after: {
                  FINISH_ANIM: '#root.acceptPhoto'
                }
              }
            }
          },
          acceptPhoto:  {
            entry: ['transition', 'updateMetaAssetsWithContext'],
            meta: { path: '/accept-photo', assets: { assetButtonOkPath: 'api/assets/compositions/icons8-ok-480.png', assetButtonNokPath: 'api/assets/compositions/icons8-nok-480.png'} },
            on: {
              'event.accept-photo.01': 'compositePhoto', // photo ok
              'event.accept-photo.02': 'countdown'  // photo not ok
            }
          },
          compositePhoto: {
            initial: 'composite_photo',
            states: {
              composite_photo: {
                on: {
                  '': {
                    target: '#root.goodjob',
                    actions: (context, event) => {
                      this.photoService.compositePhoto({
                        templateLayout: 'THREE_UNIFORM',
                        imgSrcList: context.capturedPhotoPaths,
                        overlayImg: 'print-templates/christmas_01_overlay_base_03.png'
                      })
                      .then(function(response) {
                        // handle success
                        let capturedPhotoPath = response.data.result
                        context.photoPath = capturedPhotoPath
                        context.capturedPhotoPaths = []
                        console.log(response);
                      })
                      .catch(function(error) {
                        // handle error
                        console.log(error);
                      });
                    }
                  }
                }
              }
            }
          },
          /*
          goodjob: {
            entry: ['transition'],
            meta: { path: '/anim1/6', assets: this.ANIM1_MAP[6] },
            initial: 'anim_loaded',
            states: {
              anim_loaded: {
                on: {
                  'event.anim1.01': 'anim_running'
                }
              },
              anim_running: {
                after: {
                  FINISH_ANIM: '#root.acceptCompositedPhoto'
                }
              }
            }
          },
          */
          goodjob: this.statAnim(this.ANIM1_MAP[6], '/anim1/6', '#root.acceptCompositedPhoto'),        
          acceptCompositedPhoto:  {
            entry: ['transition', 'updateMetaAssetsWithContext'],
            meta: { path: '/accept-photo', assets: { assetButtonOkPath: 'api/assets/compositions/icons8-ok-480.png', assetButtonNokPath: 'api/assets/compositions/icons8-nok-480.png'} },
            on: {
              'event.accept-photo.01': 'intro', // photo ok
              'event.accept-photo.02': 'countdown'  // photo not ok
            }
          },
          selectPrintPhotos:  {
            entry: ['transition'],
            meta: { path: '/select-print-photos', assets: { assetButtonOkPath: 'api/assets/compositions/icons8-ok-480.png', assetButtonNokPath: 'api/assets/compositions/icons8-nok-480.png'} },
            on: {
              'event.select-print-photos.01': 'intro', // photo ok
              'event.select-print-photos.02': 'countdown'  // photo not ok
            }
          }
        }
      });

    const extendedStateMachine = stateMachine.withConfig(
    {
      actions: {
        transition: (context, event, meta) => {
          console.log('transitioning to: ' + JSON.stringify(meta.state.value));
          const metadata: any = Object.values(meta.state.meta).shift();
          console.log(JSON.stringify(metadata));
          this.router.navigate([metadata.path]);
        },
        updateMetaAssetsWithContext: (context, event, meta) => {                            
          meta.state.meta[Object.keys(meta.state.meta).shift()].assets.context = context;
        }
      },
      delays: {
        FINISH_ANIM: (context, event: AnyEventObject) => {
          console.log('delay is ' + JSON.stringify(event));
          return event.delay || 0;
        }
      },
      guards: {
        transitionToAcceptanceValid: (context, event) => {
          //return context.canSearch && event.query && event.query.length > 0;
          return true
        }
      }
    });

    const stateService = interpret(extendedStateMachine).start();

    this.THEME_MAP.WEDDING = stateService;
  }  
}
