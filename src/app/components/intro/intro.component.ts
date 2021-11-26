import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { Subscription } from 'rxjs';
import { Anim1 } from '../../models/anim1.model';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  componentData: Anim1;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) {}

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
  
}
