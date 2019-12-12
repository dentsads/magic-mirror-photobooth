import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../routing.service';
import { PhotoService } from '../photo.service';
import axios from 'axios';

@Component({
  selector: 'app-accept-photo',
  templateUrl: './accept-photo.component.html',
  styleUrls: ['./accept-photo.component.css']
})
export class AcceptPhotoComponent implements OnInit {

  componentData: any;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService,
    private photoService: PhotoService
  ) { }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.componentData = this.routingService.getComponentData(this.activatedRoute);
    });   

    //this.componentData.takenPicture = this.photoService.
    //this.photoService.getCameraModel()
  }

  handleRedirect(eventId: string) {
    this.triggerLed(eventId)

    const nextRoute = this.routingService.getNextRoute(this.activatedRoute, eventId);
    this.router.navigate([nextRoute]);
  }

  async triggerLed(eventId: string) {
    await axios('/api/led')
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
  }

  async handleEvent(eventId: string) {
    this.handleRedirect(eventId);
  }
}
