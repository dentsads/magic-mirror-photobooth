import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from 'src/app/services/routing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  
  private subscription: Subscription;
  componentData: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) { }

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

}
