import { Injectable } from '@angular/core';
import { Anim1 } from './anim1.model';
import { Router } from '@angular/router';
import { Machine, interpret, AnyEventObject } from 'xstate';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  THEME_MAP: Record<string, any> = {};
  currentThemeId = 'WEDDING';
  currentTheme;

  constructor(
    public router: Router
  ) {
    this.createThemes();
    this.currentTheme = this.THEME_MAP[this.currentThemeId];
  }

  ANIM1_MAP: Record<string, Anim1> = {
    1: { assetPath: 'assets/intro.gif' },
    2: { assetPath: 'assets/are_you_ready.gif' },
    3: { assetPath: 'assets/countdown.gif' },
    4: { assetPath: 'assets/say_cheese.gif' },
    5: { assetPath: 'assets/take_photo.gif' },
    6: { assetPath: 'assets/great_job.gif' },
    7: { assetPath: 'assets/photos_are_ready.gif' }
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
          count: 0
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
                    actions: (context, event) => { this.triggerLed({
                      direction: 'RIGHT',
                      color: 'rgb(0, 0, 50)',
                      duration: 2760,
                      loops: 1
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
                  FINISH_ANIM: '#root.take-photo'
                }
              }
            }
          },
          'take-photo': {
            entry: ['transition'],
            meta: { path: '/anim1/5', assets: this.ANIM1_MAP[5] },
            initial: 'anim_loaded',
            states: {
              anim_loaded: {
                on: {
                  'event.anim1.01': 'anim_running'
                }
              },
              anim_running: {
                after: {
                  FINISH_ANIM: '#root.accept-photo'
                }
              }
            }
          },
          'accept-photo':  {
            entry: ['transition'],
            meta: { path: '/accept-photo', assets: { assetButtonOkPath: 'assets/icons8-ok-480.png', assetButtonNokPath: 'assets/icons8-nok-480.png'} },
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
            }
          },
          delays: {
            FINISH_ANIM: (context, event: AnyEventObject) => {
              console.log('delay is ' + JSON.stringify(event));
              console.log('event delay is ' + event.delay);
              return event.delay || 0;
            }
          }
        });

    const stateService = interpret(extendedStateMachine).start();

    this.THEME_MAP.WEDDING = stateService;
  }

  async triggerLed(options: any) {
    await axios.post('/api/led/ball', options)
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
