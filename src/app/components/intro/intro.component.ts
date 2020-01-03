import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { Anim1 } from '../../models/anim1.model';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  componentData: Anim1;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) {}

  ngOnInit() {
    this.componentData = this.routingService.getComponentData();
  }

  async handleEvent(eventId: string) {
    this.routingService.handleEvent(eventId);
  }
  
}
