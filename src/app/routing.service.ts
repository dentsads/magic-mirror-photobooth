import { Injectable } from '@angular/core';
import { Anim1 } from './anim1.model';
import { ActivatedRoute } from '@angular/router';
import { Graph } from '@dagrejs/graphlib';
import { Theme } from './theme.model';


@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  currentThemeId = 'WEDDING';
  THEME_MAP: Record<string, Graph> = {};

  constructor() {
    this.createThemes();
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
}
