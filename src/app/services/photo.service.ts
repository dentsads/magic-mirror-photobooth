import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  componentData: any;

  constructor() { }

  async capturePhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/dslr/capture', options)
  }

  async compositePhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/compositor/composite', options)
  }

}
