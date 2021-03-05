import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { fabric } from 'fabric';
import { of, Subject, Subscription } from 'rxjs';
import { map, switchMap, takeUntil, repeat, delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import QRCode from 'qrcode';
import MicroModal from 'micromodal';

@Component({
  selector: 'app-accept-photo',
  templateUrl: './accept-photo.component.html',
  styleUrls: ['./accept-photo.component.css']
})
export class AcceptPhotoComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  componentData: any;
  canvas: fabric.Canvas;
  document;
  rotateIcon: string = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='487.23px' height='487.23px' viewBox='0 0 487.23 487.23' style='background-color: %23ffffff; enable-background:new 0 0 487.23 487.23;' xml:space='preserve'%3E%3Cg%3E%3Cg%3E%3Cpath d='M55.323,203.641c15.664,0,29.813-9.405,35.872-23.854c25.017-59.604,83.842-101.61,152.42-101.61 c37.797,0,72.449,12.955,100.23,34.442l-21.775,3.371c-7.438,1.153-13.224,7.054-14.232,14.512 c-1.01,7.454,3.008,14.686,9.867,17.768l119.746,53.872c5.249,2.357,11.33,1.904,16.168-1.205 c4.83-3.114,7.764-8.458,7.796-14.208l0.621-131.943c0.042-7.506-4.851-14.144-12.024-16.332 c-7.185-2.188-14.947,0.589-19.104,6.837l-16.505,24.805C370.398,26.778,310.1,0,243.615,0C142.806,0,56.133,61.562,19.167,149.06 c-5.134,12.128-3.84,26.015,3.429,36.987C29.865,197.023,42.152,203.641,55.323,203.641z'/%3E%3Cpath d='M464.635,301.184c-7.27-10.977-19.558-17.594-32.728-17.594c-15.664,0-29.813,9.405-35.872,23.854 c-25.018,59.604-83.843,101.61-152.42,101.61c-37.798,0-72.45-12.955-100.232-34.442l21.776-3.369 c7.437-1.153,13.223-7.055,14.233-14.514c1.009-7.453-3.008-14.686-9.867-17.768L49.779,285.089 c-5.25-2.356-11.33-1.905-16.169,1.205c-4.829,3.114-7.764,8.458-7.795,14.207l-0.622,131.943 c-0.042,7.506,4.85,14.144,12.024,16.332c7.185,2.188,14.948-0.59,19.104-6.839l16.505-24.805 c44.004,43.32,104.303,70.098,170.788,70.098c100.811,0,187.481-61.561,224.446-149.059 C473.197,326.043,471.903,312.157,464.635,301.184z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3C/svg%3E%0A"
  scaleIcon: string = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 357.18 357.18' style='background-color: %23ffffff; enable-background:new 0 0 357.18 357.18;' xml:space='preserve'%3E%3Cg%3E%3Cg%3E%3Cpath d='M123.292,96.7c-0.128-0.196-0.112-0.408-0.284-0.58L65.456,38.564l31.268,0.048c7.396,0,13.82-6.42,13.816-13.812 l0.004-10.524c0-7.648-6.22-13.868-13.864-13.868H15.04C11.264,0.408,7.7,2,5.072,4.68c-2.608,2.596-4.164,6.088-4.164,9.86V97.9 c-0.004,7.64,6.216,13.86,13.86,13.86l10.528,0.008c7.636,0,13.848-6.212,13.852-13.852l-0.02-31.32L89,116.472 c0.028,0.024,0.052,0.048,0.072,0.072l6.428,6.42c5.404,5.408,14.104,5.284,19.512-0.124l7.44-7.436 C127.576,110.272,127.884,102.144,123.292,96.7z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d='M357.132,260.884c0-7.648-6.212-13.876-13.856-13.876L332.756,247c-7.384-0.008-13.836,6.444-13.836,13.836l0.048,31.272 L261.64,234.78c-0.18-0.18-0.5-0.268-0.696-0.4c-5.444-4.6-13.688-4.396-18.812,0.728l-7.444,7.444 c-5.4,5.4-5.316,14.32,0.1,19.736l6.42,6.42c0.024,0.024,0.048,0.048,0.072,0.072l49.656,49.656l-31.312-0.016 c-7.384,0-13.852,6.46-13.852,13.852l0.024,10.544c-0.008,7.64,6.228,13.876,13.868,13.868l83.38,0.032 c3.688-0.008,7.196-1.4,9.824-4.032l0.376-0.376c2.532-2.54,3.936-6.048,3.936-9.728L357.132,260.884z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d='M122.308,242.804l-7.448-7.452c-5.12-5.116-13.412-5.24-18.852-0.648c-0.196,0.132-0.56,0.296-0.736,0.468l-57.084,57.084 l0.036-31.288c0.004-3.684-1.42-7.14-4.04-9.764c-2.624-2.62-6.104-4.072-9.792-4.064l-10.524-0.008 c-3.824,0-7.288,1.556-9.8,4.072C1.552,253.712,0,257.18,0,261v81.64c0,3.78,1.52,7.32,4.272,9.968 c2.544,2.648,6.084,4.164,9.86,4.164h83.36c7.644,0.008,13.864-6.212,13.864-13.852v-10.532c0-3.688-1.436-7.156-4.064-9.78 c-2.62-2.628-6.084-4.056-9.772-4.056l-31.296,0.024l49.412-49.404c0.024-0.024,0.044-0.04,0.064-0.064l5.584-5.584l0.84-0.844 C127.532,257.272,127.708,248.204,122.308,242.804z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d='M356.348,14.576c0-3.772-1.516-7.312-4.264-9.964c-2.556-2.648-6.096-4.172-9.868-4.172h-81.64 c-3.82,0-7.288,1.556-9.796,4.064c-2.516,2.516-4.072,5.976-4.072,9.796v10.524c0,3.696,1.44,7.164,4.064,9.788 c2.616,2.62,6.084,4.056,9.772,4.056l31.288-0.04l-57.4,57.4c-0.172,0.18-0.312,0.516-0.444,0.712 c-4.592,5.444-4.436,13.704,0.68,18.82l7.452,7.452c5.4,5.4,14.412,5.276,19.82-0.132l6.42-6.42 c0.032-0.024,0.048-0.048,0.072-0.072l49.728-49.724l-0.032,31.296c0,3.692,1.416,7.14,4.04,9.756 c2.624,2.636,6.108,4.08,9.788,4.072l10.532,0.008c7.648,0,13.864-6.22,13.864-13.868L356.348,14.576z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d='M205.732,151.704c-15.004-14.992-39.396-14.992-54.392,0c-14.996,14.992-14.996,39.392,0.004,54.392 c14.992,14.992,39.392,14.992,54.388,0C220.724,191.104,220.724,166.696,205.732,151.704z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3C/svg%3E%0A"
  scaleImg;
  rotateImg;

  readonly MAX_RETRY:number=60;
  readonly DELAY_IN_MS:number=100

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService,
    private http: HttpClient,
    @Inject(DOCUMENT) document
  ) {

    this.document = document;

    this.scaleImg = document.createElement('img');
    this.scaleImg.src = this.scaleIcon;

    this.rotateImg = document.createElement('img');
    this.rotateImg.src = this.rotateIcon;

    fabric.Object.prototype.controls.scaleControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: 16,
      cursorStyle: 'pointer',
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: this.renderIcon(this.scaleImg),
      cornerSize: 40
    });
  
    fabric.Object.prototype.controls.rotateControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: -16,
      cursorStyle: 'pointer',
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      render: this.renderIcon(this.rotateImg),
      withConnection: true,
      cornerSize: 40
    });
  }  

  async ngOnInit() {
    this.subscription = this.activatedRoute.paramMap.subscribe(async params => {
      this.componentData = await this.routingService.getComponentData();  
      
      if (this.componentData.context) {
        this.getPresignedUrl(this.componentData.context.photoPath)        
        
        this.canvas = new fabric.Canvas('canvas-image');
        
        fabric.Object.prototype.setControlVisible('tl', false);
        fabric.Object.prototype.setControlVisible('tr', false);
        fabric.Object.prototype.setControlVisible('br', false);
        fabric.Object.prototype.setControlVisible('bl', false);
        fabric.Object.prototype.setControlVisible('ml', false);
        fabric.Object.prototype.setControlVisible('mt', false);
        fabric.Object.prototype.setControlVisible('mr', false);
        fabric.Object.prototype.setControlVisible('mb', false);
        fabric.Object.prototype.setControlVisible('mtr', false);
        fabric.Object.prototype.hasBorders = false;
        fabric.Object.prototype.cornerSize = 40;

        console.log("photoPath:")
        console.log(this.componentData.context.photoPath)
        //http://localhost:4200/api/photos/default/0uy71b_random.jpg
        //fabric.Image.fromURL(this.componentData.context.photoPath, (img) => {
        fabric.Image.fromURL("http://localhost:4200/api/photos/default/0uy71b_random.jpg", (img) => {
          // add background image

          this.canvas.setHeight(img.height);
          this.canvas.setWidth(img.width);          
          this.canvas.setBackgroundImage(img, () => {
            this.canvas.requestRenderAll();
            this.handleImage();
          });

          //this.canvas.requestRenderAll();
          //this.handleImage();
        });

      } else {
        console.log("context still not loaded")
      }         

    });

    MicroModal.init({
      onShow: modal => console.info(`${modal.id} is shown`), // [1]
      onClose: modal => console.info(`${modal.id} is hidden`), // [2]
      openClass: 'is-open', // [5]
      disableScroll: true, // [6]
      disableFocus: false, // [7]
      awaitOpenAnimation: false, // [8]
      awaitCloseAnimation: false, // [9]
      debugMode: false // [10]
    });
    
  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async handleEvent(eventId: string) {
    var dataURL = this.canvas.toDataURL( { format: "jpeg", quality: 1 } );
    this.routingService.handleEvent(eventId, { imageDataURL: this.canvas.isEmpty() ? "": dataURL });
  }

  sleep(ms): Promise<any> {
    return new Promise((resolve): any => setTimeout(resolve, ms))
  }
  
  async wait(ms): Promise<any> {
    await this.sleep(ms)
  }

  getPresignedUrl(photoPath: string) {
    const stopper = new Subject();
    
    of({})
    .pipe(
        switchMap(() => this.http.get('/api/presigned_url')),
        map( (response: any) => {            
            if (response.file && response.presigned_url && ( !photoPath.includes(response.file) || response.file_uploaded == "false" )) {    
              return undefined;              
            } else {
              return response;
            }
        }),
        delay(this.DELAY_IN_MS),
        repeat(this.MAX_RETRY),
        takeUntil(stopper)
    )
    .subscribe(response => {
      if (!response) {
        return
      }

      let canvas = this.document.getElementById('canvas-qr');

      QRCode.toCanvas(canvas, response.presigned_url, {
        color: {
          dark: '#FFFFFF',  // white dots
          light: '#000000' // black background
        },
        margin: 1,
        scale: 3        
      }, (error) => {
        if (error) 
          console.error(error)
        
        console.log('QR code successfully generated.');
        
        this.handleCanvas();
      })

      stopper.next();
    });
  }

  renderIcon(icon) {
    return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = this.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(icon, -size/2, -size/2, size, size);
      ctx.restore();
    }
  }

  handleClearCanvas() {
    // remove all objects but leave background image alone
    this.canvas.remove(...this.canvas.getObjects());
  }

  handleCanvas() {
    // fade in canvas
    this.document.getElementById('canvas-qr-div').style.opacity = '1';     
  }

  handleImage() {
    // fade in image
    this.document.getElementById('overlay-outer').style.opacity = '1';    
  }

  handleOpenEmojiModal() {
    MicroModal.show('modal-1');  
  }

  handleCloseEmojiModal() {
    MicroModal.close('modal-1');  
  }

  handleEmoji(emojiCode: string) {
    //this.canvas.add(new fabric.Text(String.fromCodePoint(0x1F354), { top: 200, left: 200 }))
    let emoji = new fabric.Text(emojiCode, { fontSize: 80, originY: "center", originX: "center"});
    this.canvas.add(emoji);
    this.canvas.setActiveObject(emoji);
    emoji.center();
    emoji.setCoords();    
    this.document.getElementById('emoji-placeholder').innerHTML = emojiCode;
    MicroModal.close('modal-1');
  }

}
