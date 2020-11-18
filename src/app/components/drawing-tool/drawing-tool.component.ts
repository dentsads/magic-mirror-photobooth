import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoutingService } from '../../services/routing.service';
import { fabric } from 'fabric';
import Pickr from '@simonwep/pickr';

@Component({
  selector: 'app-drawing-tool',
  templateUrl: './drawing-tool.component.html',
  styleUrls: ['./drawing-tool.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DrawingToolComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  componentData: any;
  canvas: any;

  drawingLineWidth = 8;
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
    this.subscription = this.activatedRoute.paramMap.subscribe(async params => {
      this.componentData = await this.routingService.getComponentData();
    });

    this.canvas = new fabric.Canvas('canvas-drawing', { isDrawingMode: true });

    this.canvas.freeDrawingBrush =  new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.shadow =  new fabric.Shadow();
    this.canvas.freeDrawingBrush.width = this.drawingLineWidth;
    this.canvas.freeDrawingBrush.color = this.drawingColor;
    this.canvas.freeDrawingBrush.shadow.color = this.drawingShadowColor;
    this.canvas.freeDrawingBrush.shadow.blur = this.drawingShadowWidth;

    this.canvas.renderAll();

    // Color picker
    const pickr = Pickr.create({
      el: '.color-picker',
      theme: 'nano', // or 'monolith', or 'nano'
      comparison: false,
      default: this.drawingShadowColor,
      swatches: [
          'rgba(244, 67, 54, 1)',
          'rgba(233, 30, 99, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(103, 58, 183, 1)',
          'rgba(63, 81, 181, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(3, 169, 244, 1)',
          'rgba(0, 188, 212, 1)',
          'rgba(0, 150, 136, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(139, 195, 74, 1)',
          'rgba(205, 220, 57, 1)',
          'rgba(255, 235, 59, 1)',
          'rgba(255, 193, 7, 1)'
      ],

      components: {

          // Main components
          preview: false,
          opacity: false,
          hue: false,

          // Input / output Options
          interaction: {
              hex: false,
              rgba: false,
              hsla: false,
              hsva: false,
              cmyk: false,
              input: false,
              clear: false,
              save: false
          }
      }
    });

    pickr.on('swatchselect', (color, instance) => {
      pickr.applyColor(false)
      pickr.hide()
      this.handleDrawingShadowColorElChange(color.toRGBA().toString())
    });

  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async handleEvent(eventId: string) {
    var dataURL = this.canvas.toDataURL();
    this.routingService.handleEvent(eventId, { imageDataURL: this.canvas.isEmpty() ? "": dataURL });
  }

  handleClearCanvas() {
    this.canvas.clear();
  }

  handleDrawingShadowColorElChange(color) {
    this.drawingShadowColor = color;
    this.canvas.freeDrawingBrush.shadow.color = this.drawingShadowColor;
  }

}
