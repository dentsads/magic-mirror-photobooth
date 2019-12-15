import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Buffer } from 'buffer';
import axios from 'axios';
import { RoutingService } from '../routing.service';
import { Anim1 } from '../anim1.model';

@Component({
  selector: 'app-anim1',
  templateUrl: './anim1.component.html',
  styleUrls: ['./anim1.component.css']
})
export class Anim1Component implements OnInit {

  componentData: Anim1;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) { }

  async ngOnInit() {    
    this.activatedRoute.paramMap.subscribe(params => {
      // this.componentData = this.routingService.ANIM1_MAP[params.get('id')];
      this.componentData = this.routingService.getComponentData2(this.activatedRoute);
      console.log(this.componentData);
    });
  }

  async handleEvent(eventId: string) {        
    const duration: number = await this.getDuration(this.componentData.assetPath);
    console.log('gif duration is ' + duration * 10 + ' milliseconds');
    /*
    this.redirectAfterMilliSeconds(duration * 10, eventId);
    */
    
    this.routingService.transtionState(eventId, { delay: duration * 10 });
  }

  redirectAfterMilliSeconds(milliseconds: number, eventId: string) {
    const router = this.router;
    const routingService = this.routingService;
    const activatedRoute = this.activatedRoute;

    window.setTimeout(function() {
      const nextRoute = routingService.getNextRoute(activatedRoute, eventId);
      router.navigate([nextRoute]);
    }, milliseconds);
  }

  async getDuration(url): Promise<number> {
    const { data: b64 } = await axios(url, { responseType: 'arraybuffer' });
    const dataInBinary = Buffer.from(b64, 'base64');

    const d = new Uint8Array(dataInBinary);
    // Thanks to http://justinsomnia.org/2006/10/gif-animation-duration-calculation/
    // And http://www.w3.org/Graphics/GIF/spec-gif89a.txt
    let duration = 0;
    for (let i = 0; i < d.length; i++) {

      // Find a Graphic Control Extension hex(21F904__ ____ __00)
      if (d[i] == 0x21
        && d[i + 1] == 0xF9
        && d[i + 2] == 0x04
        && d[i + 7] == 0x00) {
        // Swap 5th and 6th bytes to get the delay per frame
        const delay = (d[i + 5] << 8) | (d[i + 4] & 0xFF);

        // Should be aware browsers have a minimum frame delay
        // e.g. 6ms for IE, 2ms modern browsers (50fps)
        duration += delay < 2 ? 10 : delay;
      }
    }

    return duration;
  }

}
