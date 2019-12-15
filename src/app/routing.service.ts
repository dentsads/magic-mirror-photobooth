import { Injectable } from '@angular/core';
import { Anim1 } from './anim1.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Machine, interpret, assign, Interpreter, AnyEventObject } from 'xstate';
import { Graph } from '@dagrejs/graphlib';
import { Theme } from './theme.model';


@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  THEME_MAP: Record<string, Graph> = {};
  THEME_MAP2: Record<string, any> = {};
  currentThemeId = 'WEDDING';
  currentTheme;

  constructor(
    public router: Router
  ) {
    this.createThemes();
    this.createThemes2();
    this.currentTheme = this.THEME_MAP2[this.currentThemeId];
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

  getNextRoute(activatedRoute: ActivatedRoute, eventId: string): string {
    let currentRoute: string;
    let id: string;

    activatedRoute.url.subscribe(params => {
      currentRoute = params[0].path;
    });
    activatedRoute.paramMap.subscribe(params => {
      id = params.get('id');
    });

    const currentTheme: Graph = this.THEME_MAP[this.currentThemeId];
    let edges: Array<any>;

    if (id == null) {
      edges = currentTheme.outEdges('/' + currentRoute);
    } else {
      edges = currentTheme.outEdges('/' + currentRoute + '/' + id);
    }

    let resultEdge = edges.find(function (edge) {
      return edge.name === eventId
    })

    if (resultEdge !== undefined) resultEdge = resultEdge.w

    return resultEdge || edges[0].w;

  }

  transtionState(eventId: string, options?: any): void {
    console.log("triggered event: " + eventId)
    console.log("options: " + JSON.stringify(options))
    this.currentTheme.send(eventId, options)
  }

  getComponentData(activatedRoute: ActivatedRoute) {
    let currentRoute: string;
    let id: string;

    activatedRoute.url.subscribe(params => {
      currentRoute = params[0].path;
    });
    activatedRoute.paramMap.subscribe(params => {
      id = params.get('id');
    });

    const currentTheme: Graph = this.THEME_MAP[this.currentThemeId];

    if (id == null) {
      return currentTheme.node('/' + currentRoute);
    } else {
      return currentTheme.node('/' + currentRoute + '/' + id);
    }

  }

  getComponentData2(activatedRoute: ActivatedRoute) {
    let currentRoute: string;
    let id: string;

    activatedRoute.url.subscribe(params => {
      currentRoute = params[0].path;
    });
    activatedRoute.paramMap.subscribe(params => {
      id = params.get('id');
    });
    
    let metadata:any = Object.values(this.currentTheme.state.meta).shift()
    return metadata.assets
  }

  createThemes() {
    const g = new Graph({ multigraph: true });

    g.setNode('/intro', this.ANIM1_MAP[1]);
    g.setNode('/anim1/2', this.ANIM1_MAP[2]);
    g.setNode('/anim1/3', this.ANIM1_MAP[3]);
    g.setNode('/anim1/4', this.ANIM1_MAP[4]);
    g.setNode('/anim1/5', this.ANIM1_MAP[5]);
    g.setNode('/anim1/6', this.ANIM1_MAP[6]);
    g.setNode('/anim1/7', this.ANIM1_MAP[7]);
    g.setNode('/anim1/8', { assetPath: 'assets/test01.gif' });
    g.setNode('/anim1/2', this.ANIM1_MAP[2]);
    g.setNode('/drawing', {});
    g.setNode('/accept-photo', { assetButtonOkPath: 'assets/icons8-ok-480.png', assetButtonNokPath: 'assets/icons8-nok-480.png'});

    g.setEdge('/intro', '/anim1/3');    
    g.setEdge('/anim1/3', '/anim1/5');
    g.setEdge('/anim1/5', '/accept-photo');
    g.setEdge( { v: '/accept-photo', w: '/anim1/6', name: 'event.accept-photo.01' }); // photo ok
    g.setEdge( { v: '/accept-photo', w: '/anim1/3', name: 'event.accept-photo.02' }); // photo not ok
    g.setEdge('/anim1/6', '/anim1/8');
    g.setEdge('/anim1/8', '/intro');

    this.THEME_MAP.WEDDING = g;
  }

  createThemes2() {
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

      const stateMachine2 = stateMachine.withConfig(
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

      const stateService = interpret(stateMachine2)
        //.onTransition(state => console.log(state.context.count))
        .start();


      this.THEME_MAP2.WEDDING = stateService;
      //stateService.send('event.intro.01');
  }
}
