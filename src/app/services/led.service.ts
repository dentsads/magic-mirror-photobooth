import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class LedService {

  constructor() { }

  async triggerLed(animationType: string = 'ball', options: any): Promise<AxiosResponse<any>> {
    if (animationType == 'barrel') {
      return axios.post('/api/led/barrel', options);
    } else if (animationType == 'ball') {
      return axios.post('/api/led/ball', options);
    } else {
      // default animation is ball
      return axios.post('/api/led/ball', options);
    }    
  }

  async clearLed(): Promise<AxiosResponse<any>> {
    return axios.get('/api/led/clear');
  }
}
