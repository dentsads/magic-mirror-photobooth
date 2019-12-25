import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class LedService {

  constructor() { }

  async triggerLed(options: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/led/ball', options)
    /*
    await axios.post('/api/led/ball', options)
    .then(function(response) {
      // handle success
      console.log(response);
    })
    .catch(function(error) {
      // handle error
      console.log(error);
    })
    .finally(function() {
      // always executed
    });
    */
  }
}
