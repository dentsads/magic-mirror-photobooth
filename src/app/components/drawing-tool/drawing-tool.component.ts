import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { fabric } from 'fabric';

@Component({
  selector: 'app-drawing-tool',
  templateUrl: './drawing-tool.component.html',
  styleUrls: ['./drawing-tool.component.css']
})
export class DrawingToolComponent implements OnInit {

  componentData: any;
  canvas: any;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) { }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.componentData = this.routingService.getComponentData();
    });

    this.canvas = new fabric.Canvas('canvas', { isDrawingMode: true });
    
    var rect = new fabric.Rect({
        top : 100,
        left : 100,
        width : 60,
        height : 70,
        fill : 'red'
    });

    console.log(rect)
    console.log(this.canvas)
    this.canvas.add(rect);
    this.canvas.renderAll();
  }

  async handleEvent(eventId: string) {
    this.routingService.handleEvent(eventId);
  }

}
