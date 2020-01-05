import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class LedService {

  constructor() { }

  async triggerLed(options: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/led/ball', options);
  }

  async clearLed(): Promise<AxiosResponse<any>> {
    return axios.get('/api/led/clear');
  }
}
