import { Injectable } from '@angular/core';
import { Anim1 } from './anim1.model';
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
    1: { assetPath: 'assets/compositions/intro.gif' },
    2: { assetPath: 'assets/compositions/are_you_ready.gif' },
    3: { assetPath: 'assets/compositions/countdown.gif' },
    4: { assetPath: 'assets/compositions/say_cheese.gif' },
    5: { assetPath: 'assets/compositions/take_photo.gif' },
    6: { assetPath: 'assets/compositions/great_job.gif' },
    7: { assetPath: 'assets/compositions/photos_are_ready.gif' }
  };

  handleEvent(eventId: string, options?: any): void {
    this.currentTheme.send(eventId, options);
  }

  getComponentData() {
    const metadata: any = Object.values(this.currentTheme.state.meta).shift();
    return metadata.assets;
  }

  createThemes() {
    const stateMachine = Machine(
      {
        id: 'root',
        initial: 'intro',
        context: {
          capturedPhotoPaths: [],
          capturedPhotoPath: ""
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
                      })
                      .finally(function() {
                        // always executed
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
                        context.capturedPhotoPath = capturedPhotoPath
                        context.capturedPhotoPaths.push(capturedPhotoPath)
                        console.log(response);
                      })
                      .catch(function(error) {
                        // handle error
                        console.log(error);
                      })
                      .finally(function() {
                        // always executed
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
            meta: { path: '/accept-photo', assets: { assetButtonOkPath: 'assets/compositions/icons8-ok-480.png', assetButtonNokPath: 'assets/compositions/icons8-nok-480.png'} },
            on: {
              'event.accept-photo.01': 'goodjob', // photo ok
              'event.accept-photo.02': 'countdown'  // photo not ok
            }
          },
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
                  FINISH_ANIM: '#root.intro'
                }
              }
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
          }
        });

    const stateService = interpret(extendedStateMachine).start();

    this.THEME_MAP.WEDDING = stateService;
  }  
}
