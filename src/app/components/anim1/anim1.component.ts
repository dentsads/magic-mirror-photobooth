import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Buffer } from 'buffer';
import axios from 'axios';
import { RoutingService } from '../../services/routing.service';
import { Anim1 } from '../../models/anim1.model';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-anim1',
  templateUrl: './anim1.component.html',
  styleUrls: ['./anim1.component.css']
})
export class Anim1Component implements OnInit, OnDestroy {

  private subscription: Subscription;
  componentData: Anim1;
  document;

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

  async handleStartEvent(eventId: string) {
    const duration:number =  this.document.getElementById('animVideo').duration
    this.routingService.handleEvent(eventId, { delay: duration * 1000 });    
  }

  async handleEndEvent(eventId: string) {
  
  }  

}
