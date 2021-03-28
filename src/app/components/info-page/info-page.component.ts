import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from 'src/app/services/routing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.css']
})
export class InfoPageComponent implements OnInit, OnDestroy {
  
  private subscription: Subscription;
  componentData: any;
  document;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService,
    @Inject(DOCUMENT) document
  ) {
    this.document = document;
  }

  async ngOnInit() {
    this.subscription = this.activatedRoute.paramMap.subscribe(async params => {
      this.componentData = (await this.routingService.getComponentMetadata()).assets;
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
  }

}
