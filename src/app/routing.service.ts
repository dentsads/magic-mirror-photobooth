import { Injectable } from '@angular/core';
import { Anim1 } from './anim1.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Machine, interpret, assign, Interpreter, AnyEventObject } from 'xstate';
import { Theme } from './theme.model';


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

  transtionState(eventId: string, options?: any): void {
    this.currentTheme.send(eventId, options)
  }

  getComponentData() {
    return <any> Object.values(this.currentTheme.state.meta).shift()
  }

  createThemes() {
    let stateMachine = Machine(
      {
        id: 'root',
        initial: '/intro',
        context: {
          count: 0
        },
        states: {
          "/intro": {
            entry: ['transition'],
            meta: { path: "/intro", assets: this.ANIM1_MAP[1] },
            on: {
              "event.intro.01": { 
                target: "/anim1/3"          
              }
            }
          },
          "/anim1/3": {
            entry: ['transition'],
            meta: { path: "/anim1/3", assets: this.ANIM1_MAP[3] },
            initial: 'anim_loaded',
            states: {
              anim_loaded: {
                on: {
                  "event.anim1.01": 'anim_running'
                }
              },
              anim_running: {              
                after: {
                  FINISH_ANIM: '#root./anim1/5'
                } 
              }
            }      
          },
          "/anim1/5": {
            entry: ['transition'],
            meta: { path: "/anim1/5", assets: this.ANIM1_MAP[5] },
            initial: 'anim_loaded',
            states: {
              anim_loaded: {
                on: {
                  "event.anim1.01": 'anim_running'
                }
              },
              anim_running: {              
                after: {
                  FINISH_ANIM: '#root./accept-photo'
                } 
              }
            }      
          },
          "/accept-photo":  {
            entry: ['transition'],
            meta: { path: "/accept-photo", assets: { assetButtonOkPath: 'assets/icons8-ok-480.png', assetButtonNokPath: 'assets/icons8-nok-480.png'} },
            on: {
              "event.accept-photo.01": '/anim1/6', // photo ok
              "event.accept-photo.02": '/anim1/3'  // photo not ok
            }
          },
          "/anim1/6": {
            entry: ['transition'],
            meta: { path: "/anim1/6", assets: this.ANIM1_MAP[6] },
            initial: 'anim_loaded',
            states: {
              anim_loaded: {
                on: {
                  "event.anim1.01": 'anim_running'
                }
              },
              anim_running: {              
                after: {
                  FINISH_ANIM: '#root./intro'
                } 
              }
            }      
          }
        }
      });        

      const extendedStateMachine = stateMachine.withConfig(
        {
          actions: {
            // action implementations
            transition: (context, event, meta) => {
              console.log('transitioning to: ' + JSON.stringify(meta.state.value));
              let metadata:any = Object.values(meta.state.meta).shift()
              console.log(JSON.stringify(metadata))
              this.router.navigate([metadata.path]);            
            }
          },
          delays: {
            FINISH_ANIM: (context, event: AnyEventObject) => {
              console.log("delay is " + JSON.stringify(event))
              console.log("event delay is " + event.delay)
              return event.delay || 0;
            }
          }
        });

      const stateService = interpret(extendedStateMachine).start();

      this.THEME_MAP.WEDDING = stateService;
  }
}
