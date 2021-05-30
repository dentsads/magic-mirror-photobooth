import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { of, Subject, Subscription } from 'rxjs';
import { map, switchMap, takeUntil, repeat, delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import QRCode from 'qrcode';

@Component({
  selector: 'app-accept-photo',
  templateUrl: './accept-photo.component.html',
  styleUrls: ['./accept-photo.component.css']
})
export class AcceptPhotoComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private allowNextTransitionButtonSubscription: Subscription;
  componentData: any;
  allowNextTransitionButton: boolean = true;
  document;

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
  }  

  async ngOnInit() {
    this.subscription = this.activatedRoute.paramMap.subscribe(async params => { 
      this.componentData = await this.routingService.getComponentData();  
      
      if (this.componentData.context) {          
        this.getPresignedUrl(this.componentData.context.photoPath);
      }            
    });
    
    this.allowNextTransitionButtonSubscription =  this.routingService.allowNextTransitionButton.subscribe((value: boolean) => { 
      this.allowNextTransitionButton = value; 
    });

    this.handleEvent("event.loading-finished.01");
  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.allowNextTransitionButtonSubscription) {
      this.allowNextTransitionButtonSubscription.unsubscribe();
    }
  }

  async handleEvent(eventId: string) {
    this.routingService.handleEvent(eventId);
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

  handleCanvas() {
    // fade in canvas
    this.document.getElementById('canvas-qr-div').style.opacity = '1';     
  }

  handleImage() {
    // fade in image
    this.document.getElementById('overlay-outer').style.opacity = '1';    
  }

}
