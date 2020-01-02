import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';

@Component({
  selector: 'app-select-print-photos',
  templateUrl: './select-print-photos.component.html',
  styleUrls: ['./select-print-photos.component.css']
})
export class SelectPrintPhotosComponent implements OnInit {

  componentData: any;
  printCounterValue = 0;

  constructor(
    public router: Router,
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

  decrement() {
    if (this.printCounterValue > 0) {
      this.printCounterValue--;
    }
  }

  increment() {
    if (this.printCounterValue < 5) {
    this.printCounterValue++;
    }
  }

}
