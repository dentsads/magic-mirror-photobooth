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

  drawingLineWidth: number = 5;
  drawingColor: string = '#ffffff';
  drawingShadowColor: string = '#004aff';
  drawingShadowWidth: number = 12;
  drawingShadowOffset: number = 0;

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
    
    this.canvas.freeDrawingBrush =  new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.shadow =  new fabric.Shadow();
    this.canvas.freeDrawingBrush.width = this.drawingLineWidth;
    this.canvas.freeDrawingBrush.color = this.drawingColor;
    this.canvas.freeDrawingBrush.shadow.color = this.drawingShadowColor;
    this.canvas.freeDrawingBrush.shadow.blur = this.drawingShadowWidth;    

    this.canvas.renderAll();
  }

  async handleEvent(eventId: string) {
    this.routingService.handleEvent(eventId);
  }

  handleClearCanvas() {
    this.canvas.clear();
  }

  handleDrawingLineWidthElChange(event) {
    this.drawingLineWidth = parseInt(event.target.value, 10) || 1;
    this.canvas.freeDrawingBrush.width = this.drawingLineWidth;
  }

  handleDrawingColorElChange(event) {
    this.drawingColor = event.target.value;
    this.canvas.freeDrawingBrush.color = this.drawingColor;
  }

  handleDrawingShadowColorElChange(event) {
    this.drawingShadowColor = event.target.value;
    this.canvas.freeDrawingBrush.shadow.color = this.drawingShadowColor;
  }

  handleDrawingShadowWidthElChange(event) {
    this.drawingShadowWidth = parseInt(event.target.value, 10) || 0;
    this.canvas.freeDrawingBrush.shadow.blur = this.drawingShadowWidth;
  }

  handleDrawingShadowOffsetElChange(event) {
    this.drawingShadowOffset = parseInt(event.target.value, 10) || 0;
    this.canvas.freeDrawingBrush.shadow.offsetX = this.drawingShadowOffset;
    this.canvas.freeDrawingBrush.shadow.offsetY = this.drawingShadowOffset;
  }

}
