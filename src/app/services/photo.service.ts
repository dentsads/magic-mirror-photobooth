import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  presignedUrlInterceptor: any;

  constructor() { }

  async capturePhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/dslr/capture', options);
  }

  // Composite end result photo
  async compositePhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/compositor/composite', options);
  }

  // Composite individual photo
  async compositeIndividualPhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/compositor/composite_individual', options);
  }

  async compositePrintableResultPhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/compositor/composite-printable-result', options);
  }

}
