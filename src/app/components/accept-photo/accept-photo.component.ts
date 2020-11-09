import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { PhotoService } from '../../services/photo.service';
import { Subscription } from 'rxjs';
import QRCode from 'qrcode';

@Component({
  selector: 'app-accept-photo',
  templateUrl: './accept-photo.component.html',
  styleUrls: ['./accept-photo.component.css']
})
export class AcceptPhotoComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  componentData: any;
  presignedUrl: string;
  document;
  MAX_RETRY: number;
  currentRetry: number;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService,
    private photoService: PhotoService,
    @Inject(DOCUMENT) document
  ) {

    this.document = document;
    this.MAX_RETRY = 10;
    this.currentRetry = 0;

  }  

  async ngOnInit() {
    this.subscription = this.activatedRoute.paramMap.subscribe(async params => {
      this.componentData = await this.routingService.getComponentData();      
      this.getPresignedUrl()
    });    
    
  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
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

  getPresignedUrl() {
    this.photoService.getPresignedUrl(this.componentData.context.photoPath)
      .then( response => {
        // handle success
        let presignedUrlObject = response.data;
        
        this.presignedUrl = presignedUrlObject.presigned_url
        console.log(presignedUrlObject.presigned_url);

        let canvas = this.document.getElementById('canvas');

        QRCode.toCanvas(canvas, this.presignedUrl, {
          color: {
            dark: '#FFFFFF',  // white dots
            light: '#000000' // black background
          }
        }, function (error) {
          if (error) console.error(error)
          console.log('success!');
        })
                
      })
      .catch(async () => {
        if (this.currentRetry < this.MAX_RETRY) {
          this.currentRetry++;
          console.log('Retrying...');
          await this.wait(100);
          this.getPresignedUrl();
        } else {
          console.log('Retried several times but still failed');
        }
      })
  }

  handleImage() {
    // fade in image
    this.document.getElementById('overlay-outer').style.opacity = '1';    
  }

}
