import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoutingService } from '../../services/routing.service';
import { fabric } from 'fabric';

@Component({
  selector: 'app-drawing-tool',
  templateUrl: './drawing-tool.component.html',
  styleUrls: ['./drawing-tool.component.css']
})
export class DrawingToolComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  componentData: any;
  canvas: any;

  drawingLineWidth = 5;
  drawingColor = '#ffffff';
  drawingShadowColor = '#004aff';
  drawingShadowWidth = 12;
  drawingShadowOffset = 0;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) { }

  async ngOnInit() {
    this.subscription = this.activatedRoute.paramMap.subscribe(params => {
      this.componentData = this.routingService.getComponentData();
    });

    this.canvas = new fabric.Canvas('canvas', { isDrawingMode: true });

    this.canvas.freeDrawingBrush =  new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.shadow =  new fabric.Shadow();
    this.canvas.freeDrawingBrush.width = this.drawingLineWidth;
    this.canvas.freeDrawingBrush.color = this.drawingColor;
    this.canvas.freeDrawingBrush.shadow.color = this.drawingShadowColor;
    this.canvas.freeDrawingBrush.shadow.blur = this.drawingShadowWidth;

    this.canvas.renderAll();
  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async handleEvent(eventId: string) {
    var dataURL = this.canvas.toDataURL();
    this.routingService.handleEvent(eventId, { imageDataURL: dataURL });
  }

  handleClearCanvas() {
    this.canvas.clear();
  }

  handleDrawingShadowColorElChange(event) {
    this.drawingShadowColor = event.target.value;
    this.canvas.freeDrawingBrush.shadow.color = this.drawingShadowColor;
  }

}
