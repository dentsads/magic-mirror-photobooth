import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from 'src/app/services/routing.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit {
  
  componentData: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.componentData = this.routingService.getComponentData();
    });
  }

  async handleEvent(eventId: string) {
    this.routingService.handleEvent(eventId);
  }

}
