import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor() { }

  async capturePhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/dslr/capture', options);
  }

  async compositePhoto(options?: any): Promise<AxiosResponse<any>> {
    return axios.post('/api/compositor/composite', options);
  }

  async getPresignedUrl(photoPath: string): Promise<AxiosResponse<any>> {
    axios.interceptors.response.use(function (response) {
      console.log(response.data.file_uploaded)
      console.log(response.data.file_uploaded == "false")
      if (response.data.file && response.data.presigned_url && ( !photoPath.includes(response.data.file) || response.data.file_uploaded == "false" )) {
        throw new axios.Cancel(photoPath + " DOES NOT contain string " + response.data.file);
      } else {
        return response;
      }
    }, function (error) {
      return Promise.reject(error);
    });

    return axios.get('/api/presigned_url');
  }

}
