import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../routing.service';

@Component({
  selector: 'app-drawing-tool',
  templateUrl: './drawing-tool.component.html',
  styleUrls: ['./drawing-tool.component.css']
})
export class DrawingToolComponent implements OnInit {

  componentData: any;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) { }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      // this.componentData = this.routingService.ANIM1_MAP[params.get('id')];
      this.componentData = this.routingService.getComponentData();
    });
  }


  async handleEvent(eventId: string) {
    this.routingService.transtionState(eventId);
  }

}
