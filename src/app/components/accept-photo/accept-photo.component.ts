import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common'; 
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';

@Component({
  selector: 'app-accept-photo',
  templateUrl: './accept-photo.component.html',
  styleUrls: ['./accept-photo.component.css']
})
export class AcceptPhotoComponent implements OnInit {

  componentData: any;
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
    this.activatedRoute.paramMap.subscribe(params => {
      this.componentData = this.routingService.getComponentData();
    });    
  }

  async handleEvent(eventId: string) {
    this.routingService.handleEvent(eventId);
  }

  fadeIn() {
    this.document.getElementById("overlay-outer").style["opacity"] = "1";
  }

}
