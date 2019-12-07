import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  componentData: any;
  //gphoto2 = require('gphoto2');
  //GPhoto = new this.gphoto2.GPhoto2();  

  constructor() { }

  /*
  getCameraModel() {
    this.GPhoto.list(function (list) {
      if (list.length === 0) return;
      var camera = list[0];
      console.log('Found', camera.model);
    })
  }
  */

}
