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

  async ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  async ngOnInit() {
    this.subscription = this.activatedRoute.paramMap.subscribe(params => {
      this.componentData = this.routingService.getComponentData();      
    });    
  }

  async handleEvent(eventId: string) {
    this.routingService.handleEvent(eventId);
  }

  handleImage() {
    // fade in image
    this.document.getElementById("overlay-outer").style["opacity"] = "1";    
        
    // see: https://www.exif.org/Exif2-2.PDF
    let exifOrientation = this.componentData.context.exifOrientation;
    this.document.getElementsByClassName("image")[0].style["transform"] = this.rotation[exifOrientation];
  }

}
