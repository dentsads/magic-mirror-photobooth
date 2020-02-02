import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  constructor() { }

  async printPhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/printer/print', options);
  }

}
