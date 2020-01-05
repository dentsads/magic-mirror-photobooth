import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  async log(level:string, data:any): Promise<AxiosResponse<any>> {
    return axios.post('/api/logger', {
      level: level || 'error',
      data: data
    });
  }

}
