import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accept-photo',
  templateUrl: './accept-photo.component.html',
  styleUrls: ['./accept-photo.component.css']
})
export class AcceptPhotoComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  componentData: any;
  document;

  // see: https://www.exif.org/Exif2-2.PDF page 18
  private readonly rotation = {
    1: 'rotate(0deg)',
    3: 'rotate(180deg)',
    6: 'rotate(90deg)',
    8: 'rotate(270deg)'
  };

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService,
    @Inject(DOCUMENT) document
  ) {

    this.document = document;

  }  

  async ngOnInit() {
    this.subscription = this.activatedRoute.paramMap.subscribe(params => {
      this.componentData = this.routingService.getComponentData();
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

  handleImage() {
    // fade in image
    this.document.getElementById('overlay-outer').style.opacity = '1';    

    // see: https://www.exif.org/Exif2-2.PDF
    const exifOrientation = this.componentData.context.exifOrientation;
    this.document.getElementsByClassName('image')[0].style.transform = this.rotation[exifOrientation];

    /*
      If there is a CSS transform rotation, the document flow of the parent divs is not getting adjusted accordingly.
      We need to therefore manually change the layout of the parent elements to match the tranformed image layout.

      see:
       * https://stackoverflow.com/questions/31962378/parent-div-to-change-dimension-when-inner-image-rotate
       * https://stackoverflow.com/questions/16301625/rotated-elements-in-css-that-affect-their-parents-height-correctly
    */
    if (exifOrientation !== 1) {
      let bound = this.document.getElementsByClassName('image')[0].getBoundingClientRect();

      this.document.getElementById('overlay-outer').style.height = bound.height + 'px'
      this.document.getElementById('overlay-outer').style.width = bound.width + 'px'

      this.document.getElementsByClassName('image')[0].style['margin-left'] = '-' + (bound.height/2) + 'px'
      this.document.getElementsByClassName('image')[0].style['margin-top'] =  '-' + (bound.width/2) + 'px'

      this.document.getElementsByClassName('image')[0].style['top'] = '50%'
      this.document.getElementsByClassName('image')[0].style['left'] =  '50%'
    }    
  }

}
