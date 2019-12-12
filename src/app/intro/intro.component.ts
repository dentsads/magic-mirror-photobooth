import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../routing.service';
import { Anim1 } from '../anim1.model';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  componentData: Anim1;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService
  ) { }

  ngOnInit() {
    this.componentData = this.routingService.getComponentData(this.activatedRoute);
    console.log(this.componentData);
    // this.activatedRoute.paramMap.subscribe(params => {
    //  //this.componentData = this.routingService.ANIM1_MAP[params.get('id')];
    //  this.componentData = this.routingService.getComponentData(this.activatedRoute)
    // });
  }

  handleRedirect(eventId: string) {
    const nextRoute = this.routingService.getNextRoute(this.activatedRoute, eventId);
    this.router.navigate([nextRoute]);
  }

  async handleEvent(eventId: string) {
    this.handleRedirect(eventId);
  }

}
